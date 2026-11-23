import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AchievementData, HackathonData } from '@/hooks/usePortfolioData';
import { normalizePhotoEdit, photoEditStyle } from '../hackathons/photoEdit';
import { PIN_COLORS, Pin, corkStyle, frameStyle } from './decor';
import { CATEGORY } from './PinnedWin';
import { toWin } from './winUtils';

type Size = NonNullable<AchievementData['cardSize']>;
const SIZE_CHIPS: { id: Size; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'normal', label: 'Normal' },
  { id: 'large', label: 'Large' },
];

interface AchievementBoardProps {
  items: AchievementData[];
  hackathons: HackathonData[];
  onChange: (items: AchievementData[]) => void;
  /** Open the Photo Studio for the card at this position. */
  onEditPhoto: (index: number) => void;
}

/**
 * Admin Layout Board for the Hall of Fame: the same cork board visitors see, editable in place.
 * Drag a card onto another to swap places, drag its corner handle (or use the chips) to resize it,
 * and press Photo to change or adjust the picture.
 */
export const AchievementBoard = ({ items, hackathons, onChange, onEditPhoto }: AchievementBoardProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false); // a button / handle is pressed: don't start a card drag
  const [resizing, setResizing] = useState<{ id: string; label: string } | null>(null);
  const latest = useRef({ items, onChange });
  latest.current = { items, onChange };

  useEffect(() => {
    const release = () => setLocked(false);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  const swap = (a: number, b: number) => {
    if (a === b || a < 0 || b < 0 || a >= items.length || b >= items.length) return;
    const next = [...items];
    [next[a], next[b]] = [next[b], next[a]];
    onChange(next);
  };
  const setSize = (id: string, size: Size) => onChange(items.map((a) => (a.id === id ? { ...a, cardSize: size } : a)));

  /* drag the corner handle sideways: right makes the card large, left makes it normal */
  const startResize = (e: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    setResizing({ id, label: 'Drag sideways' });
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const size: Size | null = dx > 50 ? 'large' : dx < -50 ? 'normal' : null;
      if (!size) return;
      setResizing({ id, label: size === 'large' ? 'Large' : 'Normal' });
      const { items: current, onChange: change } = latest.current;
      if (current.some((a) => a.id === id && a.cardSize !== size)) {
        change(current.map((a) => (a.id === id ? { ...a, cardSize: size } : a)));
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

  const wins = items.map((a, i) => toWin(a, i, hackathons));

  return (
    <div className="rounded-[26px] p-3" style={frameStyle}>
      <div className="rounded-[18px] p-5 sm:p-7" style={corkStyle}>
        {items.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[#5c3a18]/40 p-10 text-center text-sm text-[#4a3722]">
            No achievements yet. Add one with “Add Achievement”, then arrange it here.
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-10 [grid-auto-flow:dense] sm:grid-cols-2 lg:grid-cols-3">
            {wins.map((win, index) => {
              const item = items[index];
              const place = win.rank && !win.rank.isTop ? win.rank.n : 0;
              const large = item.cardSize === 'large' || (item.cardSize !== 'normal' && place === 1);
              const edit = normalizePhotoEdit(win.photoEdit);
              const { icon: Icon } = CATEGORY[win.category];
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
                    'group relative cursor-grab select-none transition-[opacity,transform] duration-200 active:cursor-grabbing',
                    large && 'sm:col-span-2',
                    isDragging && 'opacity-40',
                    isTarget && 'scale-[0.97]',
                  )}
                >
                  {/* photo */}
                  <div
                    className={cn(
                      'relative bg-[#fdfcf8] p-2 shadow-[0_16px_24px_-14px_rgba(55,32,12,.6),0_2px_4px_rgba(55,32,12,.28)]',
                      isTarget && 'ring-4 ring-primary',
                      place === 1 && 'shadow-[0_0_0_2px_rgba(226,180,64,.85),0_24px_36px_-18px_rgba(150,105,20,.6)]',
                    )}
                  >
                    <div className={cn('relative overflow-hidden bg-[#e7e2d6]', large ? 'aspect-[16/10]' : 'aspect-[4/3]')}>
                      {win.image ? (
                        <img src={win.image} alt={win.title} draggable={false} className="h-full w-full select-none" style={photoEditStyle(edit)} />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[#176B4D]/55" style={{ background: 'linear-gradient(160deg, #eaf3ee, #cfe5d8)' }}>
                          <Icon className="h-10 w-10" strokeWidth={1.2} />
                          <span className="text-[10px] uppercase tracking-[0.16em]">No photo yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Pin color={place === 1 ? '#c9962f' : PIN_COLORS[index % PIN_COLORS.length]} className="-top-3 left-1/2 -translate-x-1/2" />

                  {/* note */}
                  <div
                    className="relative z-10 -mt-8 ml-[-6px] w-[84%] bg-[#fcf8ee] px-3 py-2.5 shadow-[0_12px_18px_-12px_rgba(55,32,12,.55),0_1px_3px_rgba(55,32,12,.25)]"
                    style={{ borderTop: place === 1 ? '3px solid #d9a93c' : undefined }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[#176B4D]',
                          place === 1 ? 'bg-gradient-to-br from-[#f3d27a] to-[#d4a32f] text-[#5b3d07]' : 'bg-[#176B4D]/10',
                        )}
                        style={{ fontFamily: '"Cormorant Garamond", serif', fontVariantNumeric: 'lining-nums' }}
                      >
                        {win.rank ? (
                          <span className="flex items-start leading-none">
                            <span className="text-lg font-semibold">{win.rank.big}</span>
                            <span className="text-[9px] italic">{win.rank.small}</span>
                          </span>
                        ) : (
                          <Icon className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold leading-tight text-[#1f2d27]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                          {win.title}
                        </p>
                        <p className="truncate text-[10px] uppercase tracking-[0.12em] text-[#1f2d27]/60">
                          {win.event}
                          {win.year ? ` · ${win.year}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* tools: on hover / focus, always on touch screens */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-1.5 p-3 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="pointer-events-auto flex items-center gap-1 rounded-lg bg-background/90 p-1 shadow-md backdrop-blur">
                        <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <button
                          type="button"
                          aria-label="Move earlier"
                          title="Move earlier"
                          disabled={index === 0}
                          onPointerDown={() => setLocked(true)}
                          onClick={() => swap(index, index - 1)}
                          className="rounded p-1 hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Move later"
                          title="Move later"
                          disabled={index === items.length - 1}
                          onPointerDown={() => setLocked(true)}
                          onClick={() => swap(index, index + 1)}
                          className="rounded p-1 hover:bg-muted disabled:opacity-30"
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
                    <div className="pointer-events-auto flex items-center gap-1 self-start rounded-lg bg-background/90 p-1 shadow-md backdrop-blur">
                      {SIZE_CHIPS.map((chip) => {
                        const active = (item.cardSize || 'auto') === chip.id;
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            onPointerDown={() => setLocked(true)}
                            onClick={() => setSize(item.id, chip.id)}
                            className={cn(
                              'rounded-md px-2 py-1 text-[11px] font-semibold leading-none transition-colors',
                              active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                            )}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* resize handle */}
                  <button
                    type="button"
                    aria-label="Drag sideways to make this photo larger or smaller"
                    title="Drag sideways to resize"
                    draggable={false}
                    onPointerDown={(e) => {
                      setLocked(true);
                      startResize(e, item.id);
                    }}
                    className="absolute bottom-1 right-1 z-40 flex h-7 w-7 cursor-ew-resize touch-none items-center justify-center rounded-md border-2 border-white bg-primary text-primary-foreground opacity-0 shadow-lg transition-opacity focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                      <path d="M10 4L4 10M10 8L8 10" />
                    </svg>
                  </button>
                  {resizing?.id === item.id && (
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
    </div>
  );
};
