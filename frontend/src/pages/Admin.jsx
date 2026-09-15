// src/pages/Admin.jsx
// Dashboard administrativo: resumo, capacidade, doações, alertas, exportação CSV

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, CartesianGrid,
} from 'recharts';
import { adminApi } from '../api/endpoints';
import { TIPO_KIT_LABEL, corPorPct } from '../components/CapacityBar';

export default function Admin() {
  const [resumo, setResumo] = useState(null);
  const [doacoes, setDoacoes] = useState([]);
  const [serie, setSerie] = useState([]);
  const [alertas, setAlertas] = useState(null);
  const [filtros, setFiltros] = useState({ ponto: '', status: '' });
  const [erro, setErro] = useState(null);

  async function carregar() {
    try {
      const [r, d, s, a] = await Promise.all([
        adminApi.resumo(),
        adminApi.doacoes({ ...filtros, limit: 30 }),
        adminApi.serieDoacoes(),
        adminApi.alertas(),
      ]);
      setResumo(r); setDoacoes(d); setSerie(s); setAlertas(a);
    } catch (e) { setErro(e.message); }
  }

  useEffect(() => { carregar(); }, [filtros]); // eslint-disable-line

  async function exportar() {
    const blob = await adminApi.exportarCSV();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doacoes-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const serieFmt = formatarSerie(serie);

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-rust mb-2">
            Painel administrativo
          </div>
          <h1 className="font-display text-5xl font-bold">Operação em tempo real</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-ghost text-xs">↻ Atualizar</button>
          <button onClick={exportar} className="btn text-xs">⬇ Exportar CSV</button>
        </div>
      </div>

      {erro && <div className="card border-rust mb-6"><strong className="text-rust">Erro:</strong> {erro}</div>}

      {/* CARDS DE RESUMO */}
      {resumo && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <StatCard
            titulo="Total de doações"
            valor={resumo.doacoes?.total || 0}
            sub={`${resumo.doacoes?.semana || 0} nos últimos 7 dias`}
          />
          <StatCard
            titulo="Doações pendentes"
            valor={resumo.doacoes?.pendentes || 0}
            sub="Aguardando recebimento"
            destaque
          />
          <StatCard
            titulo="Distribuições agendadas"
            valor={resumo.distribuicoes?.agendadas || 0}
            sub={`${resumo.distribuicoes?.total || 0} no total`}
          />
        </div>
      )}

      {/* CAPACIDADE POR PONTO (barras) */}
      <section className="card mb-8">
        <h2 className="font-display text-2xl font-bold mb-1">Ocupação por ponto</h2>
        <p className="text-xs text-ink/60 mb-5">Atualizada em tempo real conforme novas doações chegam.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {resumo?.pontos?.map((p) => {
            const cor = corPorPct(p.ocupacao_media);
            return (
              <div key={p.id} className="border-2 border-ink/20 rounded-2xl p-4">
                <div className="text-xs text-ink/50 mb-1">{p.bairro}</div>
                <div className="font-display font-bold text-lg leading-tight mb-3">{p.nome}</div>

                {p.capacidade.map((c) => {
                  const itemCor = corPorPct(c.percentual);
                  return (
                    <div key={c.tipo_item} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>{TIPO_KIT_LABEL[c.tipo_item]}</span>
                        <span className={`font-mono ${itemCor.text}`}>{c.percentual.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
                        <div className={`h-full ${itemCor.bg}`} style={{ width: `${Math.min(100, c.percentual)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {/* GRÁFICO DE LINHA - DOAÇÕES POR DIA */}
      <section className="card mb-8">
        <h2 className="font-display text-2xl font-bold mb-1">Doações últimos 30 dias</h2>
        <p className="text-xs text-ink/60 mb-5">Quantidades agregadas por tipo de kit, por dia.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serieFmt}>
              <CartesianGrid stroke="#0b102015" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ border: '2px solid #0b1020', borderRadius: 10 }} />
              <Legend />
              <Line type="monotone" dataKey="cesta_basica" stroke="#c4513a" strokeWidth={2.5} name="Cestas" dot={false}/>
              <Line type="monotone" dataKey="kit_higiene" stroke="#2a5cf5" strokeWidth={2.5} name="Higiene" dot={false}/>
              <Line type="monotone" dataKey="kit_limpeza" stroke="#3e6b4a" strokeWidth={2.5} name="Limpeza" dot={false}/>
              <Line type="monotone" dataKey="agua_litros" stroke="#d99211" strokeWidth={2.5} name="Água (L)" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ALERTAS */}
      <section className="card mb-8">
        <h2 className="font-display text-2xl font-bold mb-1">
          Alertas {alertas && <span className="text-base font-mono text-rust">({alertas.total})</span>}
        </h2>
        <p className="text-xs text-ink/60 mb-5">Capacidade ≥80%, doações próximas do vencimento e itens vencidos.</p>
        {alertas?.alertas?.length ? (
          <ul className="space-y-2">
            {alertas.alertas.map((a, i) => (
              <li key={i} className={`p-3 rounded-xl border-2 ${
                a.severidade === 'alta' ? 'border-rust bg-rust/5' : 'border-amber/60 bg-amber/5'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`pill ${a.severidade === 'alta' ? 'bg-rust text-paper' : 'bg-amber-100 text-amber-800'}`}>
                    {a.tipo}
                  </span>
                  <span className="text-sm">{a.mensagem}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-ink/60">Nenhum alerta no momento.</div>
        )}
      </section>

      {/* TABELA DE DOAÇÕES */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">Últimas doações</h2>
          <div className="flex gap-2">
            <select className="select py-1.5 text-xs" value={filtros.ponto}
                    onChange={(e) => setFiltros({ ...filtros, ponto: e.target.value })}>
              <option value="">Todos os pontos</option>
              {resumo?.pontos?.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            <select className="select py-1.5 text-xs" value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
              <option value="">Todos status</option>
              <option value="pendente">Pendente</option>
              <option value="recebida">Recebida</option>
              <option value="conferida">Conferida</option>
              <option value="distribuida">Distribuída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-ink/20">
                <th className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Protocolo</th>
                <th className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Ponto</th>
                <th className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Kit</th>
                <th className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Qtde</th>
                <th className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Status</th>
                <th className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Data</th>
              </tr>
            </thead>
            <tbody>
              {doacoes.map((d) => (
                <tr key={d.id} className="border-b border-ink/10">
                  <td className="py-2 pr-3 font-mono text-xs">{d.numero_protocolo}</td>
                  <td className="py-2 pr-3">{d.ponto_nome}</td>
                  <td className="py-2 pr-3">{TIPO_KIT_LABEL[d.tipo_kit] || d.tipo_kit}</td>
                  <td className="py-2 pr-3 font-mono">{d.quantidade}</td>
                  <td className="py-2 pr-3">
                    <span className={`pill ${statusColor(d.status)}`}>{d.status}</span>
                  </td>
                  <td className="py-2 pr-3 text-ink/70">
                    {new Date(d.data_doacao_efetiva).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              {doacoes.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-ink/60">Nenhuma doação registrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ titulo, valor, sub, destaque }) {
  return (
    <div className={`card ${destaque ? 'bg-rust text-paper border-rust' : ''}`}>
      <div className={`font-mono text-[10px] uppercase tracking-[0.3em] mb-2 ${destaque ? 'text-paper/60' : 'text-ink/50'}`}>
        {titulo}
      </div>
      <div className="font-display text-5xl font-bold leading-none">{valor}</div>
      <div className={`text-xs mt-3 ${destaque ? 'text-paper/70' : 'text-ink/60'}`}>{sub}</div>
    </div>
  );
}

function statusColor(s) {
  switch (s) {
    case 'pendente':   return 'bg-amber-100 text-amber-800';
    case 'recebida':   return 'bg-blue-100 text-blue-800';
    case 'conferida':  return 'bg-emerald-100 text-emerald-800';
    case 'distribuida':return 'bg-ink text-paper';
    case 'cancelada':  return 'bg-rust/15 text-rust';
    default: return 'bg-ink/10 text-ink';
  }
}

/**
 * Converte série "longa" (uma linha por dia x tipo) em "wide" (uma linha por dia,
 * com colunas: cesta_basica, kit_higiene, kit_limpeza, agua_litros).
 */
function formatarSerie(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.dia)) map.set(r.dia, { dia: r.dia });
    map.get(r.dia)[r.tipo_kit] = r.total;
  }
  return Array.from(map.values()).sort((a, b) => a.dia.localeCompare(b.dia));
}
