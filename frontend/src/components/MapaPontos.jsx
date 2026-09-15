// src/components/MapaPontos.jsx
// Mapa interativo dos 3 pontos de coleta (React-Leaflet)

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import CapacityBar from './CapacityBar';

// Corrige ícones padrão do Leaflet quando empacotado por Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Cria um ícone customizado em SVG (divIcon) por nível de ocupação
function iconePorOcupacao(pct) {
  const cor = pct >= 90 ? '#e74c3c' : pct >= 75 ? '#e67e22' : pct >= 50 ? '#f1c40f' : '#27ae60';
  const html = `
    <div style="
      transform: translate(-50%,-100%);
      display:flex; flex-direction:column; align-items:center; gap:2px;">
      <div style="
        background:${cor}; color:white; font-weight:700; font-size:12px;
        padding:4px 10px; border-radius:999px; border:2px solid #0b1020;
        font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing:.02em;
        box-shadow: 0 2px 0 0 rgba(11,16,32,.9);">
        ${pct.toFixed(0)}%
      </div>
      <div style="
        width:0; height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:10px solid #0b1020;"></div>
    </div>`;
  return L.divIcon({ className: '', html, iconSize: [40, 50], iconAnchor: [20, 50] });
}

export default function MapaPontos({ pontos, alturaClass = 'h-[480px]', onSelect }) {
  // Centroide dos pontos para centralizar o mapa
  const centro = useMemo(() => {
    if (!pontos || pontos.length === 0) return [-23.5015, -47.4526];
    const lat = pontos.reduce((s, p) => s + p.latitude, 0) / pontos.length;
    const lon = pontos.reduce((s, p) => s + p.longitude, 0) / pontos.length;
    return [lat, lon];
  }, [pontos]);

  return (
    <div className={`${alturaClass} w-full rounded-3xl overflow-hidden border-2 border-ink/90 shadow-soft`}>
      <MapContainer center={centro} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pontos?.map((p) => {
          const pct = p.ocupacao_media ?? 0;
          return (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={iconePorOcupacao(pct)}
              eventHandlers={onSelect ? { click: () => onSelect(p) } : undefined}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="font-display font-bold text-base mb-1">{p.nome}</div>
                  <div className="text-xs text-gray-600 mb-2">{p.bairro || ''}</div>
                  {p.endereco && <div className="text-xs mb-3">{p.endereco}</div>}
                  <div className="space-y-2">
                    {p.capacidade?.map((c) => (
                      <CapacityBar key={c.tipo_item} {...c} />
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Áreas de risco em Sorocaba (círculos vermelhos sutis) */}
        {AREAS_RISCO.map((a) => (
          <CircleMarker
            key={a.nome}
            center={[a.lat, a.lon]}
            radius={10}
            pathOptions={{ color: '#c4513a', fillColor: '#c4513a', fillOpacity: 0.18, weight: 1 }}
          >
            <Popup>
              <div className="text-xs font-semibold">⚠ Área de risco</div>
              <div className="text-sm">{a.nome}</div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

// Áreas de risco listadas na especificação
const AREAS_RISCO = [
  { nome: 'Avenida Dom Aguirre',           lat: -23.5034, lon: -47.4602 },
  { nome: 'Avenida Ipanema',               lat: -23.4837, lon: -47.4716 },
  { nome: 'Avenida Afonso Vergueiro',      lat: -23.5095, lon: -47.4548 },
  { nome: 'Terminal Rodoviário Sto Antonio', lat: -23.5064, lon: -47.4571 },
  { nome: 'Jardim Abaeté',                 lat: -23.5408, lon: -47.4348 },
  { nome: 'Vitória Régia',                 lat: -23.5588, lon: -47.4625 },
];
