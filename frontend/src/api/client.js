// src/api/client.js
import axios from 'axios';

// Em dev usamos o proxy do Vite (/api -> backend:5000)
// Em produção a VITE_API_URL deve apontar para a API absoluta
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Anexa JWT automaticamente quando existir no localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('soro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Erro padronizado: sempre rejeita com { status, message, details }
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const payload = err.response?.data || {};
    return Promise.reject({
      status: err.response?.status || 0,
      message: payload.message || payload.error || err.message,
      details: payload.details,
      raw: err,
    });
  },
);
