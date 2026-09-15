// src/services/protocolo.service.js
// Geração de números de protocolo únicos para doações/distribuições

/**
 * Formato: PRE-AAAAMMDD-XXXXXX (XXXXXX = random base36 uppercase)
 * Ex.: DOA-20251014-7K3L9P
 */
function gerarProtocolo(prefixo = 'DOA') {
  const data = new Date();
  const yyyy = data.getFullYear();
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  const dd = String(data.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefixo}-${yyyy}${mm}${dd}-${rand}`;
}

module.exports = { gerarProtocolo };
