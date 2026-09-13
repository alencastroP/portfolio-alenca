import type { TechIconData } from '@/lib/techIcons';

interface TechIconProps {
  icon: TechIconData;
  className?: string;
}

/** Logo de uma tecnologia, em `currentColor` — quem pinta é o CSS. */
export function TechIcon({ icon, className }: TechIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={icon.path} />
    </svg>
  );
}
