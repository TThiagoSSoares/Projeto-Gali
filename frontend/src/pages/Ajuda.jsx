// src/pages/Ajuda.jsx
// Formulário "Preciso de ajuda" para beneficiários

import { useState } from 'react';
import { beneficiariosApi } from '../api/endpoints';
import { TIPO_KIT_LABEL } from '../components/CapacityBar';

export default function Ajuda() {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    latitude: null,
    longitude: null,
    tipo_kit: 'cesta_basica',
    quantidade: 1,
    quantidade_pessoas: 1,
    modo_recebimento: 'retirada',
    observacoes: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [localizando, setLocalizando] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErro(null);
  }

  function pedirLocalizacao() {
    if (!navigator.geolocation) {
      setErro({ message: 'Geolocalização não suportada neste navegador.' });
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocalizando(false);
      },
      (err) => {
        setErro({ message: `Não foi possível obter localização: ${err.message}` });
        setLocalizando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submeter(e) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const r = await beneficiariosApi.solicitar({
        ...form,
        quantidade: parseInt(form.quantidade, 10),
        quantidade_pessoas: parseInt(form.quantidade_pessoas, 10),
      });
      setResultado(r);
    } catch (e) {
      setErro(e);
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return <ResultadoAjuda resultado={resultado} onNova={() => setResultado(null)} />;
  }

  return (
    <div className="container-x py-10">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-rust mb-3">
        Preciso de ajuda
      </div>
      <h1 className="font-display text-5xl md:text-6xl font-bold mb-2">
        Pedir é um direito. <span className="italic font-medium">Não hesite.</span>
      </h1>
      <p className="text-ink/70 mb-10 max-w-2xl">
        Conte o que você precisa e nós encontramos o ponto mais próximo com estoque disponível.
        Suas informações são tratadas com sigilo e usadas apenas para te atender.
      </p>

      <form onSubmit={submeter} className="card max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Seu nome *</label>
            <input
              className="input"
              required
              value={form.nome}
              onChange={(e) => update('nome', e.target.value)}
            />
          </div>
          <div>
            <label className="label">WhatsApp *</label>
            <input
              className="input"
              required
              placeholder="(15) 9XXXX-XXXX"
              value={form.telefone}
              onChange={(e) => update('telefone', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Endereço (ou referência)</label>
            <input
              className="input"
              placeholder="Rua, número, bairro"
              value={form.endereco}
              onChange={(e) => update('endereco', e.target.value)}
            />
            <button
              type="button"
              onClick={pedirLocalizacao}
              className="btn-ghost text-xs mt-3"
              disabled={localizando}
            >
              {localizando ? 'Obtendo localização…'
                : form.latitude ? '📍 Localização capturada ✓' : '📍 Usar minha localização'}
            </button>
          </div>

          <div>
            <label className="label">Tipo de kit *</label>
            <select
              className="select"
              value={form.tipo_kit}
              onChange={(e) => update('tipo_kit', e.target.value)}
            >
              {Object.entries(TIPO_KIT_LABEL).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quantidade</label>
            <input
              type="number" min={1}
              className="input"
              value={form.quantidade}
              onChange={(e) => update('quantidade', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Pessoas no domicílio</label>
            <input
              type="number" min={1}
              className="input"
              value={form.quantidade_pessoas}
              onChange={(e) => update('quantidade_pessoas', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Forma de recebimento</label>
            <select
              className="select"
              value={form.modo_recebimento}
              onChange={(e) => update('modo_recebimento', e.target.value)}
            >
              <option value="retirada">Retirar no ponto</option>
              <option value="entrega">Solicitar entrega</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Observações especiais (bebê, idoso, alergias…)</label>
            <textarea
              rows={3}
              className="input"
              value={form.observacoes}
              onChange={(e) => update('observacoes', e.target.value)}
            />
          </div>
        </div>

        {erro && (
          <div className="mt-5 p-4 rounded-2xl border-2 border-rust/60 bg-rust/5">
            <strong className="text-rust">{erro.message}</strong>
            {erro.details?.mensagem && (
              <p className="text-sm mt-1">{erro.details.mensagem}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="btn-rust mt-6 w-full disabled:opacity-50"
        >
          {enviando ? 'Buscando ponto…' : 'Solicitar atendimento'}
        </button>
      </form>
    </div>
  );
}

function ResultadoAjuda({ resultado, onNova }) {
  const p = resultado.ponto_atendimento;
  return (
    <div className="container-x py-16">
      <div className="max-w-2xl mx-auto card text-center">
        <div className="text-5xl mb-4">📍</div>
        <h1 className="font-display text-3xl font-bold mb-2">Encontramos um ponto pra você</h1>
        <p className="text-ink/70 mb-6">{resultado.mensagem}</p>

        <div className="bg-paper rounded-2xl p-6 border-2 border-ink/20 mb-6 text-left">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-1">
            Ponto de atendimento
          </div>
          <h3 className="font-display font-bold text-2xl mb-1">{p.nome}</h3>
          <div className="text-sm text-ink/70 mb-1">{p.bairro}</div>
          <div className="text-sm mb-3">{p.endereco}</div>
          {p.distancia_km != null && (
            <div className="text-xs text-ink/60">≈ {p.distancia_km} km da sua localização</div>
          )}
          {p.telefone && (
            <a href={`tel:${p.telefone}`} className="btn-ghost text-xs mt-3">
              ☎ {p.telefone}
            </a>
          )}
        </div>

        <div className="bg-ink text-paper rounded-2xl p-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60 mb-2">
            Protocolo
          </div>
          <div className="font-display font-bold text-3xl select-all">
            {resultado.protocolo}
          </div>
          <p className="text-xs text-paper/60 mt-2">
            Apresente este código no ponto de atendimento.
          </p>
        </div>

        <button onClick={onNova} className="btn-ghost">Fazer nova solicitação</button>
      </div>
    </div>
  );
}
