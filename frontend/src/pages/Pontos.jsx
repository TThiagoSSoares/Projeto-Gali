// src/pages/Pontos.jsx
// Lista detalhada dos pontos de coleta + filtro por tipo de kit

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MapaPontos from '../components/MapaPontos';
import CapacityBar from '../components/CapacityBar';
import { pontosApi } from '../api/endpoints';
import { TIPO_KIT_LABEL } from '../components/CapacityBar';

export default function Pontos() {
  const [pontos, setPontos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pontosApi.capacidade()
      .then(setPontos)
      .finally(() => setLoading(false));
  }, []);

  const pontosFiltrados = useMemo(() => {
    if (filtro === 'todos') return pontos;
    return pontos.filter((p) =>
      p.capacidade?.some((c) => c.tipo_item === filtro && c.percentual < 95),
    );
  }, [pontos, filtro]);

  return (
    <div className="container-x py-10">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-rust mb-3">
        Pontos · Sorocaba/SP
      </div>
      <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
        Onde entregar, onde retirar.
      </h1>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FiltroChip ativo={filtro === 'todos'} onClick={() => setFiltro('todos')}>
          Todos
        </FiltroChip>
        {Object.entries(TIPO_KIT_LABEL).map(([k, label]) => (
          <FiltroChip key={k} ativo={filtro === k} onClick={() => setFiltro(k)}>
            {label}
          </FiltroChip>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <MapaPontos pontos={pontosFiltrados} alturaClass="h-[520px]" />

        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-ink/60">Carregando…</div>
          ) : (
            pontosFiltrados.map((p) => <PontoCard key={p.id} ponto={p} />)
          )}
          {!loading && pontosFiltrados.length === 0 && (
            <div className="card text-center">
              <strong>Nenhum ponto disponível</strong>
              <p className="text-sm text-ink/60 mt-2">
                Todos os pontos estão cheios para este tipo de kit. Tente outro filtro.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link to="/doar" className="btn">Registrar doação →</Link>
      </div>
    </div>
  );
}

function FiltroChip({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-semibold text-sm border-2 transition-all
        ${ativo
          ? 'bg-ink text-paper border-ink'
          : 'bg-white text-ink border-ink/30 hover:border-ink'}`}
    >
      {children}
    </button>
  );
}

function PontoCard({ ponto }) {
  return (
    <div className="card">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50 mb-1">
        {ponto.tipo}
      </div>
      <h3 className="font-display text-xl font-bold mb-1">{ponto.nome}</h3>
      <div className="text-xs text-ink/60 mb-1">{ponto.bairro}</div>
      <div className="text-sm mb-4 text-ink/80">{ponto.endereco}</div>
      <div className="space-y-2.5">
        {ponto.capacidade?.map((c) => <CapacityBar key={c.tipo_item} {...c} />)}
      </div>
    </div>
  );
}
