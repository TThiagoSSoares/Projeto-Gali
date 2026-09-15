// src/controllers/doacoes.controller.js
// Registro de doações com validação de capacidade

const QRCode = require('qrcode');
const { query, withTransaction } = require('../config/db');
const capacidadeService = require('../services/capacidade.service');
const { gerarProtocolo } = require('../services/protocolo.service');
const { HttpError } = require('../middleware/errorHandler');

const TIPOS_KIT = ['cesta_basica', 'kit_higiene', 'kit_limpeza', 'agua_litros'];

async function criar(req, res) {
  const {
    ponto_coleta_id,
    tipo_kit,
    quantidade,
    data_prevista_entrega,
    data_validade,
    descricao,
    observacoes,
    contato_nome,
    contato_telefone,
  } = req.body;

  // ---- validação básica ----
  if (!ponto_coleta_id || !tipo_kit || !quantidade) {
    throw new HttpError(400, 'Campos obrigatórios: ponto_coleta_id, tipo_kit, quantidade.');
  }
  if (!TIPOS_KIT.includes(tipo_kit)) {
    throw new HttpError(400, `tipo_kit inválido. Use um de: ${TIPOS_KIT.join(', ')}.`);
  }
  const qtd = parseInt(quantidade, 10);
  if (!Number.isFinite(qtd) || qtd <= 0) {
    throw new HttpError(400, 'Quantidade deve ser um inteiro positivo.');
  }

  // ---- verificação de capacidade ANTES de tentar gravar ----
  const check = await capacidadeService.verificarEspaco(ponto_coleta_id, tipo_kit, qtd);
  if (!check.ok) {
    const sugestao = await capacidadeService.sugerirPontoAlternativo(
      tipo_kit, qtd, ponto_coleta_id,
    );
    throw new HttpError(409, 'Capacidade insuficiente neste ponto.', {
      espaco_disponivel: check.espaco_disponivel,
      quantidade_atual: check.quantidade_atual,
      capacidade_maxima: check.capacidade_maxima,
      sugestao_alternativa: sugestao,
      mensagem: sugestao
        ? `Este ponto está cheio. Sugerimos: ${sugestao.nome} (${sugestao.bairro}) com ${sugestao.espaco_disponivel} unidades de espaço.`
        : 'Todos os pontos estão sem espaço suficiente. Tente uma quantidade menor ou aguarde nossa notificação.',
    });
  }

  // ---- grava em transação: doação + atualização de capacidade ----
  const protocolo = gerarProtocolo('DOA');
  const usuario_id = req.user?.id || null;

  const doacao = await withTransaction(async (client) => {
    const ins = await client.query(
      `INSERT INTO doacoes
         (usuario_id, ponto_coleta_id, tipo_kit, quantidade, descricao,
          data_prevista_entrega, data_validade, observacoes,
          contato_nome, contato_telefone, numero_protocolo, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pendente')
       RETURNING *`,
      [
        usuario_id, ponto_coleta_id, tipo_kit, qtd,
        descricao || null, data_prevista_entrega || null,
        data_validade || null, observacoes || null,
        contato_nome || null, contato_telefone || null,
        protocolo,
      ],
    );
    // Atualiza capacidade imediatamente (entrada prevista conta para ocupação)
    await capacidadeService.incrementarCapacidade(client, ponto_coleta_id, tipo_kit, qtd);
    return ins.rows[0];
  });

  // ---- gera QR code (data URL PNG) com o protocolo ----
  const qr_payload = JSON.stringify({
    protocolo: doacao.numero_protocolo,
    ponto: ponto_coleta_id,
    tipo: tipo_kit,
    quantidade: qtd,
  });
  const qr_code_data_url = await QRCode.toDataURL(qr_payload, {
    width: 240,
    margin: 1,
  });

  res.status(201).json({
    sucesso: true,
    protocolo: doacao.numero_protocolo,
    doacao,
    qr_code_data_url,
    mensagem: 'Doação registrada com sucesso. Apresente o protocolo no momento da entrega.',
  });
}

async function listar(req, res) {
  const { ponto, status, desde, ate, limit = 30 } = req.query;
  const where = [];
  const params = [];
  if (ponto) { params.push(parseInt(ponto, 10)); where.push(`d.ponto_coleta_id = $${params.length}`); }
  if (status) { params.push(status); where.push(`d.status = $${params.length}`); }
  if (desde) { params.push(desde); where.push(`d.data_doacao_efetiva >= $${params.length}`); }
  if (ate)   { params.push(ate);   where.push(`d.data_doacao_efetiva <= $${params.length}`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  params.push(Math.min(parseInt(limit, 10) || 30, 500));

  const { rows } = await query(
    `SELECT d.*, p.nome AS ponto_nome
       FROM doacoes d
       JOIN pontos_coleta p ON p.id = d.ponto_coleta_id
       ${whereSql}
      ORDER BY d.data_doacao_efetiva DESC
      LIMIT $${params.length}`,
    params,
  );
  res.json(rows);
}

async function buscarPorProtocolo(req, res) {
  const { rows } = await query(
    `SELECT d.*, p.nome AS ponto_nome
       FROM doacoes d
       JOIN pontos_coleta p ON p.id = d.ponto_coleta_id
      WHERE d.numero_protocolo = $1`,
    [req.params.protocolo],
  );
  if (!rows[0]) throw new HttpError(404, 'Protocolo não encontrado.');
  res.json(rows[0]);
}

async function atualizarStatus(req, res) {
  const { status } = req.body;
  const validos = ['pendente', 'recebida', 'conferida', 'distribuida', 'cancelada'];
  if (!validos.includes(status)) {
    throw new HttpError(400, `Status inválido. Use: ${validos.join(', ')}.`);
  }

  // Se for "cancelada", devolve a quantidade à capacidade
  const result = await withTransaction(async (client) => {
    const cur = await client.query(
      `SELECT * FROM doacoes WHERE id = $1 FOR UPDATE`,
      [req.params.id],
    );
    if (!cur.rows[0]) throw new HttpError(404, 'Doação não encontrada.');
    const d = cur.rows[0];

    if (status === 'cancelada' && d.status !== 'cancelada') {
      await capacidadeService.decrementarCapacidade(
        client, d.ponto_coleta_id, d.tipo_kit, d.quantidade,
      );
    }
    const upd = await client.query(
      `UPDATE doacoes SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id],
    );
    return upd.rows[0];
  });

  res.json(result);
}

module.exports = { criar, listar, buscarPorProtocolo, atualizarStatus };
