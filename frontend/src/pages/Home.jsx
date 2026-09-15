// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MapaPontos from '../components/MapaPontos';
import CapacityBar, { corPorPct } from '../components/CapacityBar';
import { pontosApi, chuvaApi } from '../api/endpoints';

export default function Home() {
  const [pontos, setPontos] = useState([]);
  const [chuva, setChuva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([
          pontosApi.capacidade(),
          chuvaApi.sorocaba().catch(() => null),
        ]);
        setPontos(p);
        setChuva(c);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container-x py-10">
      {/* HERO */}
      <section className="grid lg:grid-cols-12 gap-8 items-end mb-12">
        <div className="lg:col-span-7">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-rust mb-4">
            Sorocaba/SP · período crítico: outubro
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[0.95] mb-6">
            Quando a água sobe,
            <br />
            <span className="italic font-medium">a logística</span> não pode falhar.
          </h1>
          <p className="text-lg text-ink/80 max-w-2xl">
            Plataforma de coordenação entre <strong>doadores, beneficiários e voluntários</strong> em
            três pontos de coleta da cidade. Capacidade em tempo real, alerta meteorológico e
            roteamento ao ponto mais próximo com estoque disponível.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/doar" className="btn">Quero doar →</Link>
            <Link to="/ajuda" className="btn-rust">Preciso de ajuda</Link>
            <a href="https://wa.me/5515999999999" className="btn-ghost">
              Ser voluntário
            </a>
          </div>
        </div>

        {/* Painel meteorológico compacto */}
        <div className="lg:col-span-5">
          <div className="card grain bg-ink text-paper border-ink relative overflow-hidden">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60 mb-3">
              Meteorologia · Open-Meteo
            </div>
            {chuva ? (
              <>
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="font-display text-6xl font-bold leading-none">
                    {Math.round(chuva.atual?.temperatura ?? 0)}°
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{chuva.atual?.condicao}</div>
                    <div className="text-xs text-paper/60">Umidade {chuva.atual?.umidade ?? '—'}%</div>
                  </div>
                </div>
                <hr className="border-paper/15 my-4" />
                <div className="grid grid-cols-7 gap-1">
                  {chuva.proximos_dias?.slice(0, 7).map((d) => {
                    const intensidade = Math.min(1, (d.precipitacao_mm || 0) / 40);
                    return (
                      <div key={d.data} className="text-center">
                        <div className="text-[10px] font-mono text-paper/50">
                          {new Date(d.data + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3)}
                        </div>
                        <div
                          className="h-12 w-full rounded mt-1"
                          style={{
                            background: `linear-gradient(180deg, rgba(42,92,245,${0.15 + intensidade*0.7}) 0%, rgba(42,92,245,${0.4 + intensidade*0.6}) 100%)`,
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                          title={`${d.precipitacao_mm?.toFixed(1) || 0}mm`}
                        />
                        <div className="text-[10px] font-mono text-paper/70 mt-1">
                          {Math.round(d.temp_max ?? 0)}°
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="pill bg-paper/15 text-paper">{chuva.alerta?.nivel}</span>
                  <span className="text-paper/80">{chuva.alerta?.mensagem}</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-paper/60">Carregando previsão…</div>
            )}
          </div>
        </div>
      </section>

      {/* CARDS DE CAPACIDADE */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Pontos de coleta</h2>
          <Link to="/pontos" className="text-sm font-semibold underline underline-offset-4">
            Ver detalhes →
          </Link>
        </div>

        {loading ? (
          <div className="text-ink/60">Carregando dados dos pontos…</div>
        ) : erro ? (
          <div className="card border-rust">
            <strong className="text-rust">Erro:</strong> {erro}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {pontos.map((p, i) => {
              const cor = corPorPct(p.ocupacao_media || 0);
              return (
                <div key={p.id} className="card relative">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-2">
                    Ponto 0{i + 1} · {p.tipo}
                  </div>
                  <h3 className="font-display font-bold text-2xl leading-tight mb-1">
                    {p.nome}
                  </h3>
                  <div className="text-xs text-ink/60 mb-5">{p.bairro}</div>

                  <div className="flex items-baseline justify-between mb-1">
                    <span className="label">Ocupação média</span>
                    <span className={`font-mono text-sm font-bold ${cor.text}`}>
                      {p.ocupacao_media}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-ink/10 overflow-hidden mb-5">
                    <div
                      className={`h-full ${cor.bg} transition-all duration-700`}
                      style={{ width: `${Math.min(100, p.ocupacao_media || 0)}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    {p.capacidade?.map((c) => <CapacityBar key={c.tipo_item} {...c} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MAPA */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Mapa da cidade</h2>
            <p className="text-sm text-ink/60 mt-1">
              Marcadores: pontos de coleta · círculos vermelhos: áreas de risco de enchente
            </p>
          </div>
        </div>
        <MapaPontos pontos={pontos} />
      </section>

      {/* FOOTER */}
      <Rodape />
    </div>
  );
}

function Rodape() {
  return (
    <footer className="mt-20 border-t-2 border-ink/90 pt-10 pb-6">
      <div className="grid md:grid-cols-4 gap-8 mb-10">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl font-bold mb-2">
            Em emergência? Ligue agora.
          </h3>
          <p className="text-ink/70 text-sm max-w-md">
            Esta plataforma coordena logística — não substitui os serviços de emergência.
          </p>
        </div>
        <Contato titulo="Defesa Civil" telefone="199" />
        <Contato titulo="Bombeiros"    telefone="193" />
        <Contato titulo="SAMU"         telefone="192" />
        <Contato titulo="Polícia"      telefone="190" />
      </div>
      <div className="text-xs text-ink/50 font-mono uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} Sorocaba Logística Humanitária · Dados Open-Meteo
      </div>
    </footer>
  );
}

function Contato({ titulo, telefone }) {
  return (
    <a href={`tel:${telefone}`} className="block group">
      <div className="label">{titulo}</div>
      <div className="font-display text-3xl font-bold group-hover:text-rust transition-colors">
        {telefone}
      </div>
    </a>
  );
}
