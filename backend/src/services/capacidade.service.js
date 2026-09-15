// src/services/capacidade.service.js
// Lógica de capacidade dos pontos de coleta

const { query, withTransaction } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

/**
 * Retorna a capacidade de TODOS os pontos, agrupada por ponto.
 * Inclui % de ocupação por tipo de item.
 */
async function listarCapacidades() {
  const { rows } = await query(`
    SELECT
      p.id, p.nome, p.bairro, p.tipo, p.latitude, p.longitude, p.endereco,
      c.tipo_item,
      c.quantidade_atual,
      c.capacidade_maxima,
      ROUND( (c.quantidade_atual::numeric / NULLIF(c.capacidade_maxima,0)) * 100, 1)
        AS percentual_ocupacao,
      c.ultima_atualizacao
    FROM pontos_coleta p
    JOIN capacidade_pontos c ON c.ponto_coleta_id = p.id
    WHERE p.ativo = TRUE
    ORDER BY p.id, c.tipo_item
  `);

  // Agrupa por ponto
  const porPonto = new Map();
  for (const r of rows) {
    if (!porPonto.has(r.id)) {
      porPonto.set(r.id, {
        id: r.id,
        nome: r.nome,
        bairro: r.bairro,
        tipo: r.tipo,
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
        endereco: r.endereco,
        capacidade: [],
        ocupacao_media: 0,
      });
    }
    porPonto.get(r.id).capacidade.push({
      tipo_item: r.tipo_item,
      quantidade_atual: r.quantidade_atual,
      capacidade_maxima: r.capacidade_maxima,
      percentual: parseFloat(r.percentual_ocupacao) || 0,
    });
  }

  // Calcula ocupação média de cada ponto
  for (const ponto of porPonto.values()) {
    const soma = ponto.capacidade.reduce((acc, c) => acc + c.percentual, 0);
    ponto.ocupacao_media = ponto.capacidade.length
      ? Math.round(soma / ponto.capacidade.length)
      : 0;
  }

  return Array.from(porPonto.values());
}

/**
 * Verifica se cabe uma quantidade adicional do tipo de item em um ponto.
 * Retorna { ok: true } ou { ok: false, motivo, espaco_disponivel }
 */
async function verificarEspaco(pontoColetaId, tipoItem, quantidade) {
  const { rows } = await query(
    `SELECT quantidade_atual, capacidade_maxima
       FROM capacidade_pontos
      WHERE ponto_coleta_id = $1 AND tipo_item = $2`,
    [pontoColetaId, tipoItem],
  );

  if (rows.length === 0) {
    return {
      ok: false,
      motivo: 'tipo_item_nao_configurado',
      espaco_disponivel: 0,
    };
  }

  const { quantidade_atual, capacidade_maxima } = rows[0];
  const espaco = capacidade_maxima - quantidade_atual;

  if (quantidade > espaco) {
    return {
      ok: false,
      motivo: 'capacidade_excedida',
      espaco_disponivel: Math.max(0, espaco),
      quantidade_atual,
      capacidade_maxima,
    };
  }

  return { ok: true, espaco_disponivel: espaco - quantidade };
}

/**
 * Sugere o ponto com MAIS espaço disponível para um tipo de item.
 * Retorna null se nenhum tiver espaço.
 */
async function sugerirPontoAlternativo(tipoItem, quantidadeMinima, excluirPontoId) {
  const { rows } = await query(
    `SELECT p.id, p.nome, p.bairro, p.latitude, p.longitude,
            (c.capacidade_maxima - c.quantidade_atual) AS espaco_disponivel,
            c.capacidade_maxima
       FROM pontos_coleta p
       JOIN capacidade_pontos c ON c.ponto_coleta_id = p.id
      WHERE p.ativo = TRUE
        AND c.tipo_item = $1
        AND p.id <> $2
        AND (c.capacidade_maxima - c.quantidade_atual) >= $3
      ORDER BY (c.capacidade_maxima - c.quantidade_atual) DESC
      LIMIT 1`,
    [tipoItem, excluirPontoId, quantidadeMinima],
  );
  return rows[0] || null;
}

/**
 * Incrementa a quantidade atual de um tipo de item em um ponto.
 * Use dentro de uma transação para garantir atomicidade.
 */
async function incrementarCapacidade(client, pontoColetaId, tipoItem, delta) {
  const { rows } = await client.query(
    `UPDATE capacidade_pontos
        SET quantidade_atual = quantidade_atual + $3,
            ultima_atualizacao = CURRENT_TIMESTAMP
      WHERE ponto_coleta_id = $1 AND tipo_item = $2
      RETURNING quantidade_atual, capacidade_maxima`,
    [pontoColetaId, tipoItem, delta],
  );
  if (rows.length === 0) {
    throw new HttpError(400, 'Tipo de item não configurado neste ponto.');
  }
  return rows[0];
}

/**
 * Decrementa (saída por distribuição). Não desce abaixo de zero.
 */
async function decrementarCapacidade(client, pontoColetaId, tipoItem, delta) {
  const { rows } = await client.query(
    `UPDATE capacidade_pontos
        SET quantidade_atual = GREATEST(0, quantidade_atual - $3),
            ultima_atualizacao = CURRENT_TIMESTAMP
      WHERE ponto_coleta_id = $1 AND tipo_item = $2
      RETURNING quantidade_atual, capacidade_maxima`,
    [pontoColetaId, tipoItem, delta],
  );
  if (rows.length === 0) {
    throw new HttpError(400, 'Tipo de item não configurado neste ponto.');
  }
  return rows[0];
}

module.exports = {
  listarCapacidades,
  verificarEspaco,
  sugerirPontoAlternativo,
  incrementarCapacidade,
  decrementarCapacidade,
  withTransaction,
};
