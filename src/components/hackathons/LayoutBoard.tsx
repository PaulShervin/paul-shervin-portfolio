import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HackathonData } from '@/hooks/usePortfolioData';
import { HackathonCardFace } from './HackathonCardFace';
import { CARD_SIZES, resolveCardSize, type CardSize, type ConcreteCardSize } from './photoEdit';

const GAP = 12;
const COLS_ROWS: Record<ConcreteCardSize, [number, number]> = { small: [1, 1], wide: [2, 1], tall: [1, 2], large: [2, 2] };
const sizeFor = (cols: number, rows: number): ConcreteCardSize =>
  cols === 2 ? (rows === 2 ? 'large' : 'wide') : rows === 2 ? 'tall' : 'small';
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

interface LayoutBoardProps {
  items: HackathonData[];
  onChange: (items: HackathonData[]) => void;
  /** Open the Photo Studio for the card at this position. */
  onEditPhoto: (index: number) => void;
}

/**
 * Admin layout board: the real bento grid, editable in place.
 * Drag a card onto another to swap their places, drag the corner handle to resize a card,
 * use the size chips for exact sizes, and open the Photo Studio to change or adjust its photo.
 */
export const LayoutBoard = ({ items, onChange, onEditPhoto }: LayoutBoardProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false); // true while a handle / button is pressed, so it doesn't start a card drag
  const [resizing, setResizing] = useState<{ index: number; label: string } | null>(null);
  // always-current values for the window listeners used while resizing
  const latest = useRef({ items, colW: 0, rowH: 0, onChange });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const release = () => setLocked(false);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  // same proportions as the live site: 4 columns on wide screens, one column on narrow ones
  const multi = width >= 560;
  const cols = multi ? 4 : 1;
  const colW = Math.max(0, (width - GAP * (cols - 1)) / cols);
  const rowH = multi ? (colW * 300) / 276 : 170;

  const update = (index: number, patch: Partial<HackathonData>) =>
    onChange(items.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  const swap = (a: number, b: number) => {
    if (a === b || a < 0 || b < 0 || a >= items.length || b >= items.length) return;
    const next = [...items];
    [next[a], next[b]] = [next[b], next[a]];
    onChange(next);
  };

  latest.current = { items, colW, rowH, onChange };

  /* ── resize by dragging the corner handle (window listeners, so it never depends on pointer capture) ── */
  const startResize = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = items[index].id;
    const [startCols, startRows] = COLS_ROWS[resolveCardSize(items[index].cardSize, index)];
    const startX = e.clientX;
    const startY = e.clientY;
    setResizing({ index, label: `${startCols} × ${startRows}` });

    const move = (ev: PointerEvent) => {
      const { items: current, colW: cw, rowH: rh, onChange: change } = latest.current;
      const nc = clamp(Math.round(startCols + (ev.clientX - startX) / (cw + GAP)), 1, 2);
      const nr = clamp(Math.round(startRows + (ev.clientY - startY) / (rh + GAP)), 1, 2);
      const size = sizeFor(nc, nr);
      setResizing({ index: current.findIndex((h) => h.id === id), label: `${nc} × ${nr}` });
      if (current.some((h) => h.id === id && h.cardSize !== size)) {
        change(current.map((h) => (h.id === id ? { ...h, cardSize: size } : h)));
      }
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      setResizing(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  return (
    <div ref={wrapRef} className="w-full">
      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hackathons yet. Add one with “Add Hackathon”, then arrange it here.
        </div>
      )}
      {width > 0 && items.length > 0 && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridAutoRows: `${rowH}px`,
            gridAutoFlow: 'dense',
            gap: GAP,
          }}
        >
          {items.map((item, index) => {
            const size = resolveCardSize(item.cardSize, index);
            const [spanC, spanR] = COLS_ROWS[size];
            const isDragging = dragIndex === index;
            const isTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

            return (
              <div
                key={item.id}
                draggable={!locked}
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', item.id);
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (overIndex !== index) setOverIndex(index);
                }}
                onDragLeave={() => setOverIndex((o) => (o === index ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) swap(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={cn(
                  'card-elevated group relative flex select-none flex-col overflow-hidden p-0 transition-[opacity,box-shadow,transform] duration-200',
                  multi ? 'cursor-grab active:cursor-grabbing' : '',
                  isDragging && 'opacity-40',
                  isTarget && 'scale-[0.97] ring-4 ring-primary',
                )}
                style={multi ? { gridColumn: `span ${spanC}`, gridRow: `span ${spanR}` } : undefined}
              >
                <HackathonCardFace name={item.name} year={item.year} image={item.image} photoEdit={item.photoEdit} hoverEffects={false} />

                {/* tools: visible on hover / focus, always on touch screens */}
                <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-2 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="pointer-events-auto flex items-center gap-1 rounded-lg bg-background/90 p-1 shadow-md backdrop-blur">
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <button
                        type="button"
                        title="Move earlier"
                        aria-label="Move earlier"
                        disabled={index === 0}
                        onPointerDown={() => setLocked(true)}
                        onClick={() => swap(index, index - 1)}
                        className="rounded p-1 text-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Move later"
                        aria-label="Move later"
                        disabled={index === items.length - 1}
                        onPointerDown={() => setLocked(true)}
                        onClick={() => swap(index, index + 1)}
                        className="rounded p-1 text-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onPointerDown={() => setLocked(true)}
                      onClick={() => onEditPhoto(index)}
                      className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-accent"
                    >
                      <ImagePlus className="h-3.5 w-3.5" /> Photo
                    </button>
                  </div>

                  <div className="pointer-events-auto mr-9 flex flex-wrap items-center gap-1 self-start rounded-lg bg-background/90 p-1 shadow-md backdrop-blur">
                    {CARD_SIZES.map((s) => {
                      const active = (item.cardSize || 'auto') === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          title={`${s.label} ${s.id === 'auto' ? '' : `(${s.hint})`}`}
                          onPointerDown={() => setLocked(true)}
                          onClick={() => update(index, { cardSize: s.id as CardSize })}
                          className={cn(
                            'rounded-md px-2 py-1 text-[11px] font-semibold leading-none transition-colors',
                            active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                          )}
                        >
                          {s.id === 'auto' ? 'Auto' : s.hint.replace(/ /g, '')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* corner resize handle */}
                {multi && (
                  <button
                    type="button"
                    aria-label="Drag to resize this card"
                    title="Drag to resize"
                    draggable={false}
                    onPointerDown={(e) => {
                      setLocked(true);
                      startResize(e, index);
                    }}
                    className="absolute bottom-1.5 right-1.5 z-40 flex h-7 w-7 cursor-nwse-resize touch-none items-center justify-center rounded-md border-2 border-white bg-primary text-primary-foreground opacity-0 shadow-lg transition-opacity focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                      <path d="M10 4L4 10M10 8L8 10" />
                    </svg>
                  </button>
                )}

                {resizing?.index === index && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/75 px-3 py-1.5 text-sm font-semibold text-white">
                    {resizing.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
