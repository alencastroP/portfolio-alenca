import { SYMBOL_BRACKETS, SYMBOL_LETTER } from '@/lib/brand';

interface BrandMarkProps {
  className?: string;
}

/** O selo <A>. Decorativo: quem nomeia o link é o `aria-label` dele. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg className={className} viewBox="0 0 44 44" aria-hidden="true" focusable="false">
      {/* Traço fixo em 1px: escalado com o selo, ele afinaria até borrar. */}
      <rect
        className="brand-mark__frame"
        x="0.5"
        y="0.5"
        width="43"
        height="43"
        rx="12.5"
        fill="#2A1142"
        stroke="#5A3691"
        vectorEffect="non-scaling-stroke"
      />
      <path d={SYMBOL_BRACKETS} fill="#C9A6FF" />
      <path d={SYMBOL_LETTER} fill="#FBF7FF" />
    </svg>
  );
}
