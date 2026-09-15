// src/api/endpoints.js
import { api } from './client';

// --- Auth ---
export const authApi = {
  login: (email, senha)       => api.post('/auth/login', { email, senha }).then(r => r.data),
  register: (body)            => api.post('/auth/register', body).then(r => r.data),
  me: ()                      => api.get('/auth/me').then(r => r.data),
};

// --- Pontos ---
export const pontosApi = {
  listar: ()                  => api.get('/pontos-coleta').then(r => r.data),
  detalhar: (id)              => api.get(`/pontos-coleta/${id}`).then(r => r.data),
  capacidade: ()              => api.get('/capacidade').then(r => r.data),
};

// --- Doações ---
export const doacoesApi = {
  criar: (body)               => api.post('/doacoes', body).then(r => r.data),
  buscarPorProtocolo: (p)     => api.get(`/doacoes/protocolo/${p}`).then(r => r.data),
};

// --- Beneficiários ---
export const beneficiariosApi = {
  solicitar: (body)           => api.post('/beneficiarios/solicitar-ajuda', body).then(r => r.data),
};

// --- Chuva ---
export const chuvaApi = {
  sorocaba: ()                => api.get('/chuva/sorocaba').then(r => r.data),
  alerta:   ()                => api.get('/chuva/alerta-atual').then(r => r.data),
};

// --- Admin ---
export const adminApi = {
  resumo:        ()           => api.get('/admin/resumo').then(r => r.data),
  doacoes:       (q = {})     => api.get('/admin/doacoes', { params: q }).then(r => r.data),
  serieDoacoes:  ()           => api.get('/admin/serie-doacoes').then(r => r.data),
  alertas:       ()           => api.get('/admin/alertas').then(r => r.data),
  exportarCSV:   ()           => api.get('/admin/exportar', { responseType: 'blob' }).then(r => r.data),
};
