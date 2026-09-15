// src/controllers/beneficiarios.controller.js
// Solicitação de ajuda: encontra o ponto mais próximo COM estoque disponível

const { query, withTransaction } = require('../config/db');
const { haversine } = require('../utils/distance');
const { gerarProtocolo } = require('../services/protocolo.service');
const capacidadeService = require('../services/capacidade.service');
const { HttpError } = require('../middleware/errorHandler');

const TIPOS_KIT = ['cesta_basica', 'kit_higiene', 'kit_limpeza', 'agua_litros'];

async function solicitarAjuda(req, res) {
  const {
    nome,
    telefone,
    latitude,
    longitude,
    endereco,
    tipo_kit,
    quantidade_pessoas,
    quantidade,
    modo_recebimento, // 'retirada' | 'entrega'
    observacoes,
  } = req.body;

  if (!nome || !telefone || !tipo_kit) {
    throw new HttpError(400, 'Campos obrigatórios: nome, telefone, tipo_kit.');
  }
  if (!TIPOS_KIT.includes(tipo_kit)) {
    throw new HttpError(400, `tipo_kit inválido. Use: ${TIPOS_KIT.join(', ')}.`);
  }

  const qtd = parseInt(quantidade, 10) || 1;

  // Lista todos os pontos com estoque suficiente desse tipo de item
  const { rows: candidatos } = await query(
    `SELECT p.id, p.nome, p.bairro, p.endereco, p.latitude, p.longitude, p.telefone,
            c.quantidade_atual,
            c.capacidade_maxima
       FROM pontos_coleta p
       JOIN capacidade_pontos c ON c.ponto_coleta_id = p.id
      WHERE p.ativo = TRUE
        AND c.tipo_item = $1
        AND c.quantidade_atual >= $2`,
    [tipo_kit, qtd],
  );

  if (candidatos.length === 0) {
    throw new HttpError(409, 'Sem estoque disponível em nenhum ponto.', {
      mensagem: 'No momento não há estoque suficiente. Vamos avisar você assim que houver.',
      sugestao_quantidade_menor: true,
    });
  }

  // Ordena por distância (se o beneficiário informou localização)
  const comDistancia = candidatos.map((c) => ({
    ...c,
    latitude: parseFloat(c.latitude),
    longitude: parseFloat(c.longitude),
    distancia_km: latitude && longitude
      ? haversine(parseFloat(latitude), parseFloat(longitude),
                  parseFloat(c.latitude), parseFloat(c.longitude))
      : null,
  }));

  if (latitude && longitude) {
    comDistancia.sort((a, b) => a.distancia_km - b.distancia_km);
  }
  const escolhido = comDistancia[0];

  // Registra a distribuição como agendada e reserva o estoque
  const protocolo = gerarProtocolo('BEN');
  const distribuicao = await withTransaction(async (client) => {
    const ins = await client.query(
      `INSERT INTO distribuicoes
         (ponto_coleta_id, tipo_kit, quantidade, quantidade_pessoas,
          modo_recebimento, contato_nome, contato_telefone,
          endereco_entrega, observacoes, numero_protocolo, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'agendada')
       RETURNING *`,
      [
        escolhido.id, tipo_kit, qtd, quantidade_pessoas || 1,
        modo_recebimento || 'retirada', nome, telefone,
        endereco || null, observacoes || null, protocolo,
      ],
    );
    // Reserva o estoque imediatamente
    await capacidadeService.decrementarCapacidade(
      client, escolhido.id, tipo_kit, qtd,
    );
    return ins.rows[0];
  });

  res.status(201).json({
    sucesso: true,
    protocolo,
    distribuicao,
    ponto_atendimento: {
      id: escolhido.id,
      nome: escolhido.nome,
      bairro: escolhido.bairro,
      endereco: escolhido.endereco,
      telefone: escolhido.telefone,
      latitude: escolhido.latitude,
      longitude: escolhido.longitude,
      distancia_km: escolhido.distancia_km
        ? Math.round(escolhido.distancia_km * 100) / 100
        : null,
    },
    outras_opcoes: comDistancia.slice(1, 3),
    mensagem: `Solicitação confirmada. Atendimento em ${escolhido.nome} (${escolhido.bairro}). Apresente o protocolo: ${protocolo}.`,
  });
}

async function minhasSolicitacoes(req, res) {
  const { rows } = await query(
    `SELECT d.*, p.nome AS ponto_nome
       FROM distribuicoes d
       JOIN pontos_coleta p ON p.id = d.ponto_coleta_id
      WHERE d.beneficiario_id = $1
      ORDER BY d.id DESC`,
    [req.user.id],
  );
  res.json(rows);
}

module.exports = { solicitarAjuda, minhasSolicitacoes };
