import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';

/** Shared building blocks for the dark LeetCode / GitHub panels in the About section. */

export const PanelCard = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/[0.04] ${className}`}>{children}</div>
);

interface PanelHeadingProps {
  icon: LucideIcon | IconType;
  title: string;
  accent: string;
}

export const PanelHeading = ({ icon: Icon, title, accent }: PanelHeadingProps) => (
  <div className="mb-4 flex items-center gap-2.5">
    <Icon className="h-4 w-4" style={{ color: accent }} aria-hidden="true" />
    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{title}</h3>
  </div>
);

interface StatBlockProps {
  value: ReactNode;
  label: string;
  accent?: string;
}

export const StatBlock = ({ value, label, accent }: StatBlockProps) => (
  <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-4">
    <div className="text-3xl font-bold leading-none tabular-nums text-white md:text-4xl" style={accent ? { color: accent } : undefined}>
      {value}
    </div>
    <div className="mt-2 text-xs text-white/55">{label}</div>
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} aria-hidden="true" />
);

export const PanelError = ({ message, href, linkLabel }: { message: string; href: string; linkLabel: string }) => (
  <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white/70">
    {message}{' '}
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-white underline underline-offset-4">
      {linkLabel}
    </a>
  </div>
);

export const formatNumber = (value: number) => value.toLocaleString('en-US');
