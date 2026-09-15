// src/pages/Doar.jsx
// Formulário de doação com validação de capacidade em tempo real

import { useEffect, useMemo, useState } from 'react';
import { doacoesApi, pontosApi } from '../api/endpoints';
import CapacityBar from '../components/CapacityBar';
import { TIPO_KIT_LABEL } from '../components/CapacityBar';

const KITS_INFO = {
  cesta_basica: {
    label: 'Cesta básica (alimentação 72h, 1 pessoa)',
    descricao: 'Arroz, feijão, macarrão, farinha, aveia, biscoito, açúcar, sal, café, leite em pó, óleo + enlatados.',
  },
  kit_higiene: {
    label: 'Kit de higiene (1 pessoa, 1 mês)',
    descricao: 'Sabonete, escova e creme dental, shampoo, papel higiênico, toalha, desodorante.',
  },
  kit_limpeza: {
    label: 'Kit de limpeza',
    descricao: 'Materiais para limpeza pós-enchente (sabão, água sanitária, pano, vassoura, luvas).',
  },
  agua_litros: {
    label: 'Água potável (litros)',
    descricao: 'Garrafas/galões de água mineral. Cada unidade equivale a 1 litro.',
  },
};

export default function Doar() {
  const [pontos, setPontos] = useState([]);
  const [form, setForm] = useState({
    ponto_coleta_id: '',
    tipo_kit: 'cesta_basica',
    quantidade: 1,
    data_prevista_entrega: '',
    data_validade: '',
    contato_nome: '',
    contato_telefone: '',
    observacoes: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    pontosApi.capacidade().then((p) => {
      setPontos(p);
      if (p.length && !form.ponto_coleta_id) {
        setForm((f) => ({ ...f, ponto_coleta_id: p[0].id }));
      }
    });
  }, []); // eslint-disable-line

  // Capacidade do ponto/tipo selecionado (live preview)
  const capacidadeSelecionada = useMemo(() => {
    const p = pontos.find((x) => x.id === parseInt(form.ponto_coleta_id, 10));
    return p?.capacidade.find((c) => c.tipo_item === form.tipo_kit);
  }, [pontos, form.ponto_coleta_id, form.tipo_kit]);

  const espacoDisponivel = capacidadeSelecionada
    ? capacidadeSelecionada.capacidade_maxima - capacidadeSelecionada.quantidade_atual
    : 0;
  const cabe = parseInt(form.quantidade, 10) <= espacoDisponivel;

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErro(null);
  }

  async function submeter(e) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    setResultado(null);
    try {
      const r = await doacoesApi.criar({
        ...form,
        ponto_coleta_id: parseInt(form.ponto_coleta_id, 10),
        quantidade: parseInt(form.quantidade, 10),
      });
      setResultado(r);
      // recarrega capacidades para refletir nova ocupação
      pontosApi.capacidade().then(setPontos);
    } catch (e) {
      setErro(e);
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return <Confirmacao resultado={resultado} onNovaDoacao={() => setResultado(null)} />;
  }

  return (
    <div className="container-x py-10">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-rust mb-3">
        Doar
      </div>
      <h1 className="font-display text-5xl md:text-6xl font-bold mb-2">
        Cada item pesa. <span className="italic font-medium">Cada item conta.</span>
      </h1>
      <p className="text-ink/70 mb-10 max-w-2xl">
        Antes de enviar fisicamente, registre o que você vai trazer. O sistema reserva o espaço
        no ponto escolhido e devolve um protocolo + QR code para apresentar na entrega.
      </p>

      <div className="grid lg:grid-cols-5 gap-8">
        <form onSubmit={submeter} className="lg:col-span-3 card">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Ponto de coleta</label>
              <select
                className="select"
                value={form.ponto_coleta_id}
                onChange={(e) => update('ponto_coleta_id', e.target.value)}
                required
              >
                {pontos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {p.bairro}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tipo de kit</label>
              <select
                className="select"
                value={form.tipo_kit}
                onChange={(e) => update('tipo_kit', e.target.value)}
              >
                {Object.entries(TIPO_KIT_LABEL).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-ink/60 mt-2">
                {KITS_INFO[form.tipo_kit]?.descricao}
              </p>
            </div>

            <div>
              <label className="label">Quantidade</label>
              <input
                type="number"
                min={1}
                max={espacoDisponivel || undefined}
                className="input"
                value={form.quantidade}
                onChange={(e) => update('quantidade', e.target.value)}
                required
              />
              {capacidadeSelecionada && (
                <p className={`text-xs mt-2 font-medium ${cabe ? 'text-emerald-700' : 'text-red-600'}`}>
                  {cabe
                    ? `✓ Cabem mais ${espacoDisponivel} unidades neste ponto.`
                    : `⚠ Excede o espaço disponível (${espacoDisponivel}). Reduza a quantidade ou escolha outro ponto.`}
                </p>
              )}
            </div>

            <div>
              <label className="label">Entrega prevista (opcional)</label>
              <input
                type="datetime-local"
                className="input"
                value={form.data_prevista_entrega}
                onChange={(e) => update('data_prevista_entrega', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Validade (alimentos)</label>
              <input
                type="date"
                className="input"
                value={form.data_validade}
                onChange={(e) => update('data_validade', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Seu nome</label>
              <input
                className="input"
                value={form.contato_nome}
                onChange={(e) => update('contato_nome', e.target.value)}
              />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input
                className="input"
                placeholder="(15) 9XXXX-XXXX"
                value={form.contato_telefone}
                onChange={(e) => update('contato_telefone', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Observações</label>
              <textarea
                rows={3}
                className="input"
                value={form.observacoes}
                onChange={(e) => update('observacoes', e.target.value)}
                placeholder="Ex.: enlatados, sem glúten, etc."
              />
            </div>
          </div>

          {erro && (
            <div className="mt-5 p-4 rounded-2xl border-2 border-rust/60 bg-rust/5">
              <strong className="text-rust">Não foi possível registrar:</strong>
              <p className="text-sm mt-1">{erro.message}</p>
              {erro.details?.sugestao_alternativa && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-ink/20">
                  <div className="font-semibold text-sm">
                    Sugestão: {erro.details.sugestao_alternativa.nome}
                  </div>
                  <div className="text-xs text-ink/60">
                    {erro.details.sugestao_alternativa.bairro} · {erro.details.sugestao_alternativa.espaco_disponivel} unidades de espaço
                  </div>
                  <button
                    type="button"
                    className="btn-ghost text-xs mt-2"
                    onClick={() => {
                      update('ponto_coleta_id', erro.details.sugestao_alternativa.id);
                      setErro(null);
                    }}
                  >
                    Usar este ponto →
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando || !cabe}
            className="btn mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? 'Registrando…' : 'Registrar doação'}
          </button>
        </form>

        {/* Painel lateral: capacidade do ponto selecionado */}
        <aside className="lg:col-span-2 card bg-ink text-paper border-ink">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60 mb-3">
            Capacidade do ponto
          </div>
          {capacidadeSelecionada ? (
            <>
              <h3 className="font-display text-2xl font-bold mb-4">
                {pontos.find((p) => p.id === parseInt(form.ponto_coleta_id,10))?.nome}
              </h3>
              <div className="space-y-3">
                {pontos.find((p) => p.id === parseInt(form.ponto_coleta_id,10))?.capacidade.map((c) => (
                  <div key={c.tipo_item} className={c.tipo_item === form.tipo_kit ? 'ring-2 ring-rust ring-offset-2 ring-offset-ink rounded-lg p-2 -m-2' : ''}>
                    <CapacityBar {...c} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-paper/60 text-sm">Selecione um ponto para ver a capacidade.</div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Confirmacao({ resultado, onNovaDoacao }) {
  return (
    <div className="container-x py-16">
      <div className="max-w-2xl mx-auto card text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="font-display text-4xl font-bold mb-2">Doação registrada!</h1>
        <p className="text-ink/70 mb-6">{resultado.mensagem}</p>
        <div className="bg-paper rounded-2xl p-6 border-2 border-ink/20 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-2">
            Protocolo
          </div>
          <div className="font-display font-bold text-3xl select-all mb-4">
            {resultado.protocolo}
          </div>
          {resultado.qr_code_data_url && (
            <img
              src={resultado.qr_code_data_url}
              alt="QR Code do protocolo"
              className="mx-auto w-44 h-44 border-2 border-ink rounded-xl"
            />
          )}
          <p className="text-xs text-ink/60 mt-4">
            Apresente este QR code (ou o número de protocolo) no momento da entrega.
          </p>
        </div>
        <button onClick={onNovaDoacao} className="btn">Registrar outra doação</button>
      </div>
    </div>
  );
}
