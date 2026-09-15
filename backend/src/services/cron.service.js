// src/services/cron.service.js
// Tarefas agendadas: atualização de previsão de chuva

const cron = require('node-cron');
const chuvaService = require('./chuva.service');

let started = false;

function start() {
  if (started) return;
  started = true;

  // A cada hora, no minuto 5 (evita pico exato da hora)
  cron.schedule('5 * * * *', async () => {
    try {
      const dados = await chuvaService.buscarDadosSorocaba();
      await chuvaService.persistirPrevisao(dados);
      const alerta = chuvaService.calcularNivelAlerta(dados.proximos_dias);
      console.log(`[cron] previsão atualizada — alerta=${alerta.nivel} (${alerta.precipitacao_48h_mm.toFixed(1)}mm/48h)`);
    } catch (err) {
      console.error('[cron] falha ao atualizar previsão:', err.message);
    }
  }, { timezone: 'America/Sao_Paulo' });

  console.log('[cron] tarefa de previsão de chuva agendada (a cada hora).');
}

module.exports = { start };
