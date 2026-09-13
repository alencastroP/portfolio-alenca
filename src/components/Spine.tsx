import type { RefObject } from 'react';

interface SpineProps {
  fillRef: RefObject<HTMLDivElement | null>;
}

/** Linha vertical da timeline: trilho estático + preenchimento por scroll. */
export function Spine({ fillRef }: SpineProps) {
  return (
    <div className="spine" aria-hidden="true">
      <div className="spine__track" />
      <div className="spine__fill" ref={fillRef} />
    </div>
  );
}
