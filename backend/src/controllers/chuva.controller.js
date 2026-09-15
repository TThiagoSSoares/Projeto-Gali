// src/controllers/chuva.controller.js
const chuvaService = require('../services/chuva.service');

async function sorocaba(req, res) {
  const dados = await chuvaService.buscarDadosSorocaba();
  const alerta = chuvaService.calcularNivelAlerta(dados.proximos_dias);
  res.json({ ...dados, alerta });
}

async function alertaAtual(req, res) {
  const dados = await chuvaService.buscarDadosSorocaba();
  const alerta = chuvaService.calcularNivelAlerta(dados.proximos_dias);
  res.json(alerta);
}

module.exports = { sorocaba, alertaAtual };
