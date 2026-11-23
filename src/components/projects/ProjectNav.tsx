import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
}

interface ProjectNavProps {
  items: NavItem[];
  active: number;
  onSelect: (index: number) => void;
  orientation: 'vertical' | 'horizontal';
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Vertical rail on desktop; a scrollable row of pills on small screens. */
export const ProjectNav = ({ items, active, onSelect, orientation }: ProjectNavProps) => {
  if (orientation === 'horizontal') {
    return (
      <nav aria-label="Projects" className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
          {items.map(({ id, title, icon: Icon }, i) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={i === active ? 'true' : undefined}
                className={cn(
                  'flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                  focusRing,
                  i === active
                    ? 'border-[#1e4d3a] bg-[#1e4d3a] text-white'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Projects" className="relative">
      <span className="absolute bottom-6 left-[5px] top-6 w-px bg-foreground/20" aria-hidden="true" />
      <ul className="relative flex flex-col gap-3.5">
        {items.map(({ id, title, icon: Icon }, i) => {
          const selected = i === active;
          return (
            <li key={id} className="flex items-center gap-3">
              <span
                className={cn(
                  'z-[1] h-[11px] w-[11px] shrink-0 rounded-full border-2 border-background transition-colors duration-300',
                  selected ? 'bg-[#1e4d3a]' : 'bg-foreground/35'
                )}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={selected ? 'true' : undefined}
                className={cn('group flex items-center gap-3 rounded-2xl text-left', focusRing)}
              >
                <span
                  className={cn(
                    'flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl border transition-all duration-300',
                    selected
                      ? 'border-[#1e4d3a] bg-[#1e4d3a] text-white shadow-[0_12px_24px_-12px_rgba(30,77,58,0.8)]'
                      : 'border-border/70 bg-card/80 text-foreground/70 group-hover:border-primary/40 group-hover:text-foreground'
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-[15px] font-medium transition-all duration-300',
                    selected
                      ? 'border border-foreground/25 bg-card text-foreground shadow-sm'
                      : 'text-foreground/75 group-hover:text-foreground'
                  )}
                >
                  {title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
