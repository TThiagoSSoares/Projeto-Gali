// src/utils/distance.js
// Cálculo de distância entre dois pontos (Haversine, em km)

const R = 6371; // raio médio da Terra em km

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Distância em km entre dois pares (lat, lon).
 */
function haversine(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { haversine };
