// src/controllers/admin.controller.js
// Dashboard administrativo, alertas e exportação

const { query } = require('../config/db');
const capacidadeService = require('../services/capacidade.service');

const PCT_ALERTA = parseInt(process.env.ALERT_CAPACIDADE_PCT || '80', 10);

async function resumo(req, res) {
  const [pontos, doacoes, distribuicoes] = await Promise.all([
    capacidadeService.listarCapacidades(),
    query(`SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE data_doacao_efetiva >= NOW() - INTERVAL '7 days')::int AS semana,
                  COUNT(*) FILTER (WHERE status = 'pendente')::int AS pendentes
             FROM doacoes`),
    query(`SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE status = 'agendada')::int AS agendadas
             FROM distribuicoes`),
  ]);

  res.json({
    pontos,
    doacoes: doacoes.rows[0],
    distribuicoes: distribuicoes.rows[0],
  });
}

async function serieDoacoes(req, res) {
  // Doações por dia nos últimos 30 dias, separadas por tipo
  const { rows } = await query(`
    SELECT to_char(data_doacao_efetiva::date, 'YYYY-MM-DD') AS dia,
           tipo_kit,
           SUM(quantidade)::int AS total
      FROM doacoes
     WHERE data_doacao_efetiva >= NOW() - INTERVAL '30 days'
       AND status <> 'cancelada'
     GROUP BY 1, 2
     ORDER BY 1
  `);
  res.json(rows);
}

async function alertas(req, res) {
  const out = [];

  // 1) Pontos com >= 80% de ocupação em qualquer item
  const cap = await query(`
    SELECT p.id, p.nome, c.tipo_item,
           c.quantidade_atual, c.capacidade_maxima,
           ROUND((c.quantidade_atual::numeric / NULLIF(c.capacidade_maxima,0)) * 100, 1) AS pct
      FROM pontos_coleta p
      JOIN capacidade_pontos c ON c.ponto_coleta_id = p.id
     WHERE c.capacidade_maxima > 0
       AND (c.quantidade_atual::numeric / c.capacidade_maxima) * 100 >= $1
     ORDER BY pct DESC
  `, [PCT_ALERTA]);
  for (const r of cap.rows) {
    out.push({
      tipo: 'capacidade',
      severidade: r.pct >= 90 ? 'alta' : 'media',
      mensagem: `${r.nome} está com ${r.pct}% de ${r.tipo_item}.`,
      ponto_id: r.id,
      detalhes: r,
    });
  }

  // 2) Doações com validade próxima (< 5 dias) ou vencidas
  const venc = await query(`
    SELECT d.id, d.numero_protocolo, d.tipo_kit, d.data_validade, p.nome AS ponto_nome,
           (d.data_validade - CURRENT_DATE) AS dias_para_vencer
      FROM doacoes d
      JOIN pontos_coleta p ON p.id = d.ponto_coleta_id
     WHERE d.status IN ('pendente', 'recebida', 'conferida')
       AND d.data_validade IS NOT NULL
       AND d.data_validade <= CURRENT_DATE + INTERVAL '5 days'
     ORDER BY d.data_validade
  `);
  for (const r of venc.rows) {
    const dias = r.dias_para_vencer;
    out.push({
      tipo: 'validade',
      severidade: dias < 0 ? 'alta' : 'media',
      mensagem: dias < 0
        ? `Protocolo ${r.numero_protocolo} (${r.tipo_kit}) está VENCIDO em ${r.ponto_nome}.`
        : `Protocolo ${r.numero_protocolo} (${r.tipo_kit}) vence em ${dias} dia(s) em ${r.ponto_nome}.`,
      detalhes: r,
    });
  }

  res.json({ total: out.length, alertas: out });
}

async function exportarCSV(req, res) {
  const { rows } = await query(`
    SELECT d.numero_protocolo, p.nome AS ponto, d.tipo_kit, d.quantidade,
           d.status, d.data_doacao_efetiva, d.data_validade,
           d.contato_nome, d.contato_telefone
      FROM doacoes d
      JOIN pontos_coleta p ON p.id = d.ponto_coleta_id
     ORDER BY d.data_doacao_efetiva DESC
     LIMIT 5000
  `);

  const header = [
    'protocolo','ponto','tipo_kit','quantidade','status',
    'data_doacao','validade','contato_nome','contato_telefone',
  ];
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const linhas = [header.join(';')];
  for (const r of rows) {
    linhas.push([
      r.numero_protocolo, r.ponto, r.tipo_kit, r.quantidade, r.status,
      r.data_doacao_efetiva ? new Date(r.data_doacao_efetiva).toISOString() : '',
      r.data_validade || '',
      r.contato_nome || '', r.contato_telefone || '',
    ].map(escape).join(';'));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition',
    `attachment; filename="doacoes-${new Date().toISOString().slice(0,10)}.csv"`);
  res.send('\uFEFF' + linhas.join('\n')); // BOM para Excel
}

module.exports = { resumo, serieDoacoes, alertas, exportarCSV };
