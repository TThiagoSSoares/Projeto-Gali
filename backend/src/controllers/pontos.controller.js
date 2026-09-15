// src/controllers/pontos.controller.js
// Endpoints relativos aos pontos de coleta + capacidade

const { query } = require('../config/db');
const capacidadeService = require('../services/capacidade.service');
const { HttpError } = require('../middleware/errorHandler');

async function listar(req, res) {
  const { rows } = await query(
    `SELECT id, nome, endereco, cep, bairro, latitude, longitude,
            telefone, horario_funcionamento, tipo, ativo
       FROM pontos_coleta
      WHERE ativo = TRUE
      ORDER BY id`,
  );
  res.json(rows.map((r) => ({
    ...r,
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
  })));
}

async function detalhar(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) throw new HttpError(400, 'ID inválido.');

  const ponto = await query(
    `SELECT id, nome, endereco, cep, bairro, latitude, longitude,
            telefone, horario_funcionamento, tipo
       FROM pontos_coleta WHERE id = $1 AND ativo = TRUE`,
    [id],
  );
  if (!ponto.rows[0]) throw new HttpError(404, 'Ponto de coleta não encontrado.');

  const capacidade = await query(
    `SELECT tipo_item, quantidade_atual, capacidade_maxima,
            ROUND((quantidade_atual::numeric / NULLIF(capacidade_maxima,0)) * 100, 1)
              AS percentual
       FROM capacidade_pontos WHERE ponto_coleta_id = $1
      ORDER BY tipo_item`,
    [id],
  );

  // Itens que MAIS FALTAM = menor % de ocupação
  const ordenadoPorFalta = [...capacidade.rows]
    .map((c) => ({
      tipo_item: c.tipo_item,
      quantidade_atual: c.quantidade_atual,
      capacidade_maxima: c.capacidade_maxima,
      percentual: parseFloat(c.percentual) || 0,
      faltam: c.capacidade_maxima - c.quantidade_atual,
    }))
    .sort((a, b) => a.percentual - b.percentual);

  const p = ponto.rows[0];
  res.json({
    ...p,
    latitude: parseFloat(p.latitude),
    longitude: parseFloat(p.longitude),
    capacidade: ordenadoPorFalta,
    itens_mais_faltam: ordenadoPorFalta.slice(0, 3),
  });
}

async function capacidade(req, res) {
  const dados = await capacidadeService.listarCapacidades();
  res.json(dados);
}

module.exports = { listar, detalhar, capacidade };
