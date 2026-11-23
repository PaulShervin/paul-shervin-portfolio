import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  FlipHorizontal2,
  Maximize2,
  Move,
  Redo2,
  RotateCcw,
  RotateCw,
  Sun,
  Undo2,
  ZoomIn,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageUploader } from '../ImageUploader';
import { cn } from '@/lib/utils';
import { HACKATHON_STUDIO, type StudioConfig } from './studioConfig';
import { MediaPicker } from './MediaPicker';
import {
  DEFAULT_PHOTO_EDIT,
  legacyFitFor,
  normalizePhotoEdit,
  photoEditEquals,
  type PhotoEdit,
} from './photoEdit';

export interface StudioValue {
  image: string;
  photoEdit: PhotoEdit;
  cardSize: string;
}

interface PhotoStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: StudioValue;
  /** Shown on the preview card. */
  name: string;
  year: string;
  /** Position of this card in the grid, used to resolve "Auto" size. */
  index: number;
  onApply: (value: StudioValue) => void;
  /** How this kind of card is sized and drawn. Defaults to the hackathon bento card. */
  config?: StudioConfig;
}

const SNAP = 1.5; // % within which a dragged photo snaps back to the centre

const sameValue = (a: StudioValue, b: StudioValue) =>
  a.image === b.image && a.cardSize === b.cardSize && photoEditEquals(a.photoEdit, b.photoEdit);

const SliderRow = ({
  label,
  icon: Icon,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onCommit,
}: {
  label: string;
  icon?: typeof Sun;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  onCommit: () => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-1.5 text-xs font-semibold">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />}
        {label}
      </Label>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {Number.isInteger(value) ? value : value.toFixed(2)}
        {unit}
      </span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} onValueCommit={onCommit} aria-label={label} />
  </div>
);

export const PhotoStudio = ({ open, onOpenChange, value, name, year, index, onApply, config = HACKATHON_STUDIO }: PhotoStudioProps) => {
  const [draft, setDraft] = useState<StudioValue>(value);
  const [past, setPast] = useState<StudioValue[]>([]);
  const [future, setFuture] = useState<StudioValue[]>([]);
  const [dragging, setDragging] = useState(false);

  const draftRef = useRef(draft);
  draftRef.current = draft;
  /** Snapshot taken at the start of a drag / slider gesture so one gesture = one undo step. */
  const gesture = useRef<StudioValue | null>(null);
  const wheelTimer = useRef<ReturnType<typeof setTimeout>>();
  // state (not a plain ref): the dialog renders in a portal, so the frame appears after the first effect pass
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  // start fresh every time the studio opens
  useEffect(() => {
    if (!open) return;
    setDraft({ ...value, photoEdit: normalizePhotoEdit(value.photoEdit, legacyFitFor(value.image, name)) });
    setPast([]);
    setFuture([]);
    gesture.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const beginGesture = () => {
    if (!gesture.current) gesture.current = draftRef.current;
  };
  const endGesture = useCallback(() => {
    const start = gesture.current;
    gesture.current = null;
    if (start && !sameValue(start, draftRef.current)) {
      setPast((p) => [...p, start]);
      setFuture([]);
    }
  }, []);

  /** Live edit (drag / slider): updates the preview now, counted as a single undo step on release. */
  const live = useCallback((patch: Partial<PhotoEdit>) => {
    beginGesture();
    setDraft((d) => ({ ...d, photoEdit: { ...d.photoEdit, ...patch } }));
  }, []);

  /** Discrete change (button / tile): its own undo step. */
  const commit = (next: StudioValue) => {
    setPast((p) => [...p, draftRef.current]);
    setFuture([]);
    setDraft(next);
  };
  const commitEdit = (patch: Partial<PhotoEdit>) => commit({ ...draft, photoEdit: { ...draft.photoEdit, ...patch } });

  const undo = () => {
    if (!past.length) return;
    setFuture((f) => [draft, ...f]);
    setPast((p) => p.slice(0, -1));
    setDraft(past[past.length - 1]);
  };
  const redo = () => {
    if (!future.length) return;
    setPast((p) => [...p, draft]);
    setFuture((f) => f.slice(1));
    setDraft(future[0]);
  };

  const { photoEdit: edit } = draft;
  const size = config.resolveSize(draft.cardSize, index);
  const aspect = config.aspectOf(size);

  /* wheel = zoom (needs a non-passive listener to stop the dialog from scrolling) */
  useEffect(() => {
    const el = frameEl;
    if (!el || !open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      beginGesture();
      const next = Math.min(5, Math.max(0.3, draftRef.current.photoEdit.zoom * (e.deltaY < 0 ? 1.06 : 0.94)));
      setDraft((d) => ({ ...d, photoEdit: { ...d.photoEdit, zoom: Math.round(next * 100) / 100 } }));
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(endGesture, 350);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, frameEl, endGesture]);

  /* drag = pan */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draft.image) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    beginGesture();
    drag.current = { px: e.clientX, py: e.clientY, x: edit.x, y: edit.y };
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const rect = frameEl?.getBoundingClientRect();
    if (!d || !rect) return;
    let x = d.x + ((e.clientX - d.px) / rect.width) * 100;
    let y = d.y + ((e.clientY - d.py) / rect.height) * 100;
    if (Math.abs(x) < SNAP) x = 0;
    if (Math.abs(y) < SNAP) y = 0;
    live({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    endGesture();
  };

  const setPhoto = (url: string) =>
    commit({ ...draft, image: url, photoEdit: { ...DEFAULT_PHOTO_EDIT, fit: legacyFitFor(url, name) } });

  const reset = () => commit({ ...draft, photoEdit: { ...DEFAULT_PHOTO_EDIT, fit: legacyFitFor(draft.image, name) }, cardSize: config.sizes[0].id });

  const wrapRotation = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;
  const centred = edit.x === 0 && edit.y === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] w-[96vw] max-w-5xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Photo Studio</DialogTitle>
          <DialogDescription>
            Drag the photo to move it, scroll to zoom, and the preview is exactly how the card looks on your site. Your original photo is never changed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* ── workspace ── */}
          <div className="rounded-2xl border border-border/60 bg-[repeating-conic-gradient(hsl(var(--muted)/0.5)_0%_25%,transparent_0%_50%)] [background-size:20px_20px] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0" onClick={undo} disabled={!past.length} aria-label="Undo">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0" onClick={redo} disabled={!future.length} aria-label="Redo">
                  <Redo2 className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={reset} disabled={!draft.image}>
                  <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
                </Button>
              </div>
              <p className="rounded-full bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                {config.sizes.find((s) => s.id === size)?.hint} card
              </p>
            </div>

            <div className="flex min-h-[300px] items-center justify-center py-2 sm:min-h-[460px]">
              <div
                ref={setFrameEl}
                className={cn(
                  'card-elevated group relative flex touch-none select-none flex-col overflow-hidden p-0 shadow-xl',
                  draft.image ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default',
                )}
                style={{ aspectRatio: String(aspect), width: `min(100%, ${460 * aspect}px)` }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {config.renderFace({ name, year, image: draft.image, edit })}
                {dragging && (
                  <>
                    <div className={cn('pointer-events-none absolute inset-y-0 left-1/2 z-30 w-px', centred || edit.x === 0 ? 'bg-primary' : 'bg-white/40')} />
                    <div className={cn('pointer-events-none absolute inset-x-0 top-1/2 z-30 h-px', edit.y === 0 ? 'bg-primary' : 'bg-white/40')} />
                  </>
                )}
                {!draft.image && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-6 text-center text-sm text-white">
                    Choose a photo from the “Photo” tab
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Move className="h-3 w-3" /> Drag to move</span>
              <span className="flex items-center gap-1"><ZoomIn className="h-3 w-3" /> Scroll to zoom</span>
            </p>
          </div>

          {/* ── tools ── */}
          <Tabs defaultValue="adjust" className="min-w-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="photo">Photo</TabsTrigger>
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
              <TabsTrigger value="layout">Card size</TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="mt-4 space-y-5">
              <ImageUploader value={draft.image} onChange={setPhoto} label="Upload a new photo" folder="hackathons" />
              <MediaPicker value={draft.image} onPick={setPhoto} />
            </TabsContent>

            <TabsContent value="adjust" className="mt-4 space-y-5">
              <SliderRow label="Size" icon={ZoomIn} value={edit.zoom} min={0.3} max={5} step={0.05} unit="×" onChange={(v) => live({ zoom: v })} onCommit={endGesture} />

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={() => commitEdit({ rotate: wrapRotation(edit.rotate - 90) })}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Rotate 90°
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={() => commitEdit({ rotate: wrapRotation(edit.rotate + 90) })}>
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Rotate 90°
                </Button>
              </div>
              <SliderRow label="Fine rotate" value={edit.rotate} min={-180} max={180} step={1} unit="°" onChange={(v) => live({ rotate: v })} onCommit={endGesture} />

              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant={edit.flipX ? 'default' : 'outline'} size="sm" className="h-9 text-xs" onClick={() => commitEdit({ flipX: !edit.flipX })}>
                  <FlipHorizontal2 className="mr-1 h-3.5 w-3.5" /> Flip
                </Button>
                <Button type="button" variant={edit.fit === 'cover' ? 'default' : 'outline'} size="sm" className="h-9 text-xs" onClick={() => commitEdit({ fit: 'cover' })}>
                  <Maximize2 className="mr-1 h-3.5 w-3.5" /> Fill
                </Button>
                <Button type="button" variant={edit.fit === 'contain' ? 'default' : 'outline'} size="sm" className="h-9 text-xs" onClick={() => commitEdit({ fit: 'contain' })}>
                  Fit
                </Button>
              </div>

              <Button type="button" variant="outline" size="sm" className="h-9 w-full text-xs" onClick={() => commitEdit({ x: 0, y: 0 })} disabled={centred}>
                <Move className="mr-1.5 h-3.5 w-3.5" /> Centre the photo
              </Button>

              <div className="space-y-5 border-t border-border/60 pt-5">
                <SliderRow label="Brightness" icon={Sun} value={edit.brightness} min={40} max={160} unit="%" onChange={(v) => live({ brightness: v })} onCommit={endGesture} />
                <SliderRow label="Contrast" value={edit.contrast} min={40} max={160} unit="%" onChange={(v) => live({ contrast: v })} onCommit={endGesture} />
                {config.showOverlay && (
                  <SliderRow label="Title shadow" value={edit.overlay} min={0} max={100} unit="%" onChange={(v) => live({ overlay: v })} onCommit={endGesture} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="layout" className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">{config.sizeHelp}</p>
              <div className="grid grid-cols-2 gap-3">
                {config.sizes.map((s) => {
                  const active = draft.cardSize === s.id || (s.id === 'auto' && !draft.cardSize);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => commit({ ...draft, cardSize: s.id })}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        active ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50',
                      )}
                      aria-pressed={active}
                    >
                      <span className="flex h-12 w-12 items-center justify-center">
                        {s.id === 'auto' ? (
                          <span className="text-lg font-bold text-primary">A</span>
                        ) : (
                          <span
                            className="rounded-[4px] bg-primary/70"
                            style={{ width: `${s.cols * 20}px`, height: `${s.rows * 20}px` }}
                          />
                        )}
                      </span>
                      <span className="text-xs font-semibold">{s.label}</span>
                      <span className="text-[10px] text-muted-foreground">{s.hint}</span>
                    </button>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-2 gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-accent"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
          >
            Apply to card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
