// src/components/CapacityBar.jsx
// Barra horizontal de ocupação com cores por threshold

const LABEL = {
  cesta_basica: 'Cestas básicas',
  kit_higiene:  'Kits de higiene',
  kit_limpeza:  'Kits de limpeza',
  agua_litros:  'Água (litros)',
};

export function corPorPct(pct) {
  if (pct >= 90) return { bg: 'bg-red-500',     text: 'text-red-700',    label: 'crítico' };
  if (pct >= 75) return { bg: 'bg-orange-500',  text: 'text-orange-700', label: 'alto'    };
  if (pct >= 50) return { bg: 'bg-amber-400',   text: 'text-amber-700',  label: 'médio'   };
  return            { bg: 'bg-emerald-500', text: 'text-emerald-700',label: 'baixo' };
}

export default function CapacityBar({ tipo_item, quantidade_atual, capacidade_maxima, percentual }) {
  const pct = Math.min(100, percentual ?? 0);
  const cor = corPorPct(pct);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold">{LABEL[tipo_item] || tipo_item}</span>
        <span className={`font-mono text-xs ${cor.text}`}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-ink/10 overflow-hidden">
        <div
          className={`h-full ${cor.bg} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] font-mono text-ink/60">
        {quantidade_atual} / {capacidade_maxima}
      </div>
    </div>
  );
}

export { LABEL as TIPO_KIT_LABEL };
