// src/components/AlertBanner.jsx
import { useEffect, useState } from 'react';
import { chuvaApi } from '../api/endpoints';

const CLASSES = {
  VERDE:    'banner-verde',
  AMARELO:  'banner-amarelo',
  LARANJA:  'banner-laranja',
  VERMELHO: 'banner-vermelho',
};

export default function AlertBanner() {
  const [alerta, setAlerta] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const a = await chuvaApi.alerta();
        if (!cancel) setAlerta(a);
      } catch (e) {
        if (!cancel) setErro(e.message);
      }
    }
    load();
    const t = setInterval(load, 5 * 60 * 1000); // refresh a cada 5min
    return () => { cancel = true; clearInterval(t); };
  }, []);

  if (erro && !alerta) {
    return (
      <div className="banner-amarelo py-2 text-sm font-medium text-center">
        Não foi possível carregar o alerta meteorológico. ({erro})
      </div>
    );
  }
  if (!alerta) {
    return <div className="bg-ink/5 py-3 text-sm text-center text-ink/60">Carregando alerta…</div>;
  }

  const cls = CLASSES[alerta.nivel] || 'banner-verde';
  return (
    <div className={`${cls} py-3 text-sm font-semibold border-b-2 border-ink/90 marquee`}>
      <span>
        Alerta <strong className="font-mono">{alerta.nivel}</strong> · {alerta.mensagem}
        &nbsp;·&nbsp; Previsão 48h: <strong>{alerta.precipitacao_48h_mm.toFixed(1)} mm</strong>
        &nbsp;·&nbsp; Cidade: Sorocaba/SP
        &nbsp;·&nbsp; Áreas de risco: Av. Dom Aguirre · Av. Ipanema · Av. Afonso Vergueiro · Terminal Rodoviário · Jardim Abaeté · Vitória Régia
      </span>
    </div>
  );
}
