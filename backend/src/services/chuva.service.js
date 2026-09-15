// src/services/chuva.service.js
// Integração com Open-Meteo (gratuita, sem chave) + lógica de alerta

const axios = require('axios');
const { query } = require('../config/db');

const SOROCABA_LAT = parseFloat(process.env.SOROCABA_LAT || '-23.5015');
const SOROCABA_LON = parseFloat(process.env.SOROCABA_LON || '-47.4526');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// Cache em memória (TTL: 15 min) para evitar martelar a API a cada request
let cache = { at: 0, data: null };
const TTL_MS = 15 * 60 * 1000;

/**
 * Busca dados atuais + previsão para Sorocaba.
 * Retorna { atual, proximas_horas[], proximos_dias[] }
 */
async function buscarDadosSorocaba() {
  if (cache.data && Date.now() - cache.at < TTL_MS) {
    return cache.data;
  }

  const { data } = await axios.get(OPEN_METEO_URL, {
    timeout: 8000,
    params: {
      latitude: SOROCABA_LAT,
      longitude: SOROCABA_LON,
      current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
      hourly: 'precipitation,precipitation_probability,temperature_2m,weather_code',
      daily:
        'precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code',
      forecast_days: 7,
      timezone: 'America/Sao_Paulo',
    },
  });

  const atual = {
    temperatura: data.current?.temperature_2m,
    umidade: data.current?.relative_humidity_2m,
    precipitacao_mm: data.current?.precipitation,
    vento_kmh: data.current?.wind_speed_10m,
    codigo_tempo: data.current?.weather_code,
    condicao: descreverWMO(data.current?.weather_code),
    momento: data.current?.time,
  };

  const proximas_horas = (data.hourly?.time || []).slice(0, 24).map((t, i) => ({
    hora: t,
    precipitacao_mm: data.hourly.precipitation?.[i] ?? 0,
    probabilidade_chuva: data.hourly.precipitation_probability?.[i] ?? 0,
    temperatura: data.hourly.temperature_2m?.[i],
    condicao: descreverWMO(data.hourly.weather_code?.[i]),
  }));

  const proximos_dias = (data.daily?.time || []).map((d, i) => ({
    data: d,
    precipitacao_mm: data.daily.precipitation_sum?.[i] ?? 0,
    probabilidade_chuva: data.daily.precipitation_probability_max?.[i] ?? 0,
    temp_max: data.daily.temperature_2m_max?.[i],
    temp_min: data.daily.temperature_2m_min?.[i],
    condicao: descreverWMO(data.daily.weather_code?.[i]),
  }));

  const resultado = { atual, proximas_horas, proximos_dias };
  cache = { at: Date.now(), data: resultado };
  return resultado;
}

/**
 * Calcula nível de alerta de chuva.
 * Soma a precipitação prevista para os próximos 2 dias e aplica limiares:
 *   < 5mm    → VERDE
 *   5-20mm   → AMARELO
 *   20-50mm  → LARANJA
 *   > 50mm   → VERMELHO
 */
function calcularNivelAlerta(proximos_dias) {
  const total2dias = (proximos_dias || [])
    .slice(0, 2)
    .reduce((s, d) => s + (Number(d.precipitacao_mm) || 0), 0);

  let nivel = 'VERDE';
  let cor = '#2ecc71';
  let mensagem = 'Sem alertas. Condições normais.';

  if (total2dias >= 50) {
    nivel = 'VERMELHO';
    cor = '#e74c3c';
    mensagem = `Chuva intensa prevista (${total2dias.toFixed(1)}mm em 48h). Áreas de risco em alerta máximo.`;
  } else if (total2dias >= 20) {
    nivel = 'LARANJA';
    cor = '#e67e22';
    mensagem = `Chuva forte prevista (${total2dias.toFixed(1)}mm em 48h). Acompanhe os pontos de coleta.`;
  } else if (total2dias >= 5) {
    nivel = 'AMARELO';
    cor = '#f1c40f';
    mensagem = `Chuva moderada prevista (${total2dias.toFixed(1)}mm em 48h).`;
  }

  return { nivel, cor, mensagem, precipitacao_48h_mm: total2dias };
}

/**
 * Persiste a previsão no banco (chamada pelo cron a cada hora).
 */
async function persistirPrevisao(dados) {
  for (const d of dados.proximos_dias || []) {
    await query(
      `INSERT INTO previsao_chuva
         (data_previsao, hora, precipitacao_esperada_mm,
          temperatura_minima, temperatura_maxima,
          condicao_prevista, probabilidade_chuva_percent, data_atualizacao)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (data_previsao, hora) DO UPDATE SET
         precipitacao_esperada_mm = EXCLUDED.precipitacao_esperada_mm,
         temperatura_minima = EXCLUDED.temperatura_minima,
         temperatura_maxima = EXCLUDED.temperatura_maxima,
         condicao_prevista = EXCLUDED.condicao_prevista,
         probabilidade_chuva_percent = EXCLUDED.probabilidade_chuva_percent,
         data_atualizacao = CURRENT_TIMESTAMP`,
      [
        d.data,
        d.precipitacao_mm,
        d.temp_min,
        d.temp_max,
        d.condicao,
        d.probabilidade_chuva,
      ],
    );
  }
}

/**
 * Tabela WMO Weather interpretation codes (Open-Meteo).
 * https://open-meteo.com/en/docs
 */
function descreverWMO(code) {
  const map = {
    0: 'Céu limpo',
    1: 'Predominantemente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro com geada',
    51: 'Garoa fraca',
    53: 'Garoa moderada',
    55: 'Garoa densa',
    61: 'Chuva fraca',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva congelante leve',
    67: 'Chuva congelante forte',
    71: 'Neve fraca',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Grãos de neve',
    80: 'Pancadas de chuva fracas',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva fortes',
    95: 'Tempestade',
    96: 'Tempestade com granizo leve',
    99: 'Tempestade com granizo forte',
  };
  return map[code] || '—';
}

module.exports = {
  buscarDadosSorocaba,
  calcularNivelAlerta,
  persistirPrevisao,
};
