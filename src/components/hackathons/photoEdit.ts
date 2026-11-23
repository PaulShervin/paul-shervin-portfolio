import type { CSSProperties } from 'react';

/**
 * Non-destructive photo edits for the Hackathons bento cards.
 * The original image is never modified; only these settings are stored next to it.
 */
export interface PhotoEdit {
  /** 1 = fills the card at its natural fit. */
  zoom: number;
  /** Pan, as a percentage of the card width / height. */
  x: number;
  y: number;
  /** Degrees, -180..180. */
  rotate: number;
  flipX: boolean;
  fit: 'cover' | 'contain';
  /** Percentages; 100 = unchanged. */
  brightness: number;
  contrast: number;
  /** Strength of the dark gradient behind the title, 0..100. */
  overlay: number;
}

export const DEFAULT_PHOTO_EDIT: PhotoEdit = {
  zoom: 1,
  x: 0,
  y: 0,
  rotate: 0,
  flipX: false,
  fit: 'cover',
  brightness: 100,
  contrast: 100,
  overlay: 100,
};

const clampNum = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

/** Older cards showed these images letter-boxed; keep that when no edit has been saved. */
export const legacyFitFor = (image?: string, name?: string): 'cover' | 'contain' =>
  image?.includes('google-solution-challenge') || name?.toLowerCase().includes('syandsara') ? 'contain' : 'cover';

export const normalizePhotoEdit = (raw?: Partial<PhotoEdit> | null, fallbackFit: 'cover' | 'contain' = 'cover'): PhotoEdit => ({
  zoom: clampNum(raw?.zoom, 1, 0.3, 5),
  x: clampNum(raw?.x, 0, -150, 150),
  y: clampNum(raw?.y, 0, -150, 150),
  rotate: clampNum(raw?.rotate, 0, -180, 180),
  flipX: Boolean(raw?.flipX),
  fit: raw?.fit === 'contain' || raw?.fit === 'cover' ? raw.fit : fallbackFit,
  brightness: clampNum(raw?.brightness, 100, 40, 160),
  contrast: clampNum(raw?.contrast, 100, 40, 160),
  overlay: clampNum(raw?.overlay, 100, 0, 100),
});

export const photoEditEquals = (a: PhotoEdit, b: PhotoEdit): boolean =>
  (Object.keys(a) as (keyof PhotoEdit)[]).every((k) => a[k] === b[k]);

/** CSS for the photo layer. Identical on the site and in the studio preview. */
export const photoEditStyle = (edit: PhotoEdit): CSSProperties => ({
  objectFit: edit.fit,
  objectPosition: 'center',
  transformOrigin: 'center',
  transform: `translate(${edit.x}%, ${edit.y}%) scale(${edit.zoom}) rotate(${edit.rotate}deg) scaleX(${edit.flipX ? -1 : 1})`,
  filter: edit.brightness === 100 && edit.contrast === 100 ? undefined : `brightness(${edit.brightness}%) contrast(${edit.contrast}%)`,
});

/* ───────── card sizes in the bento grid ───────── */

export type CardSize = 'auto' | 'small' | 'wide' | 'tall' | 'large';
export type ConcreteCardSize = Exclude<CardSize, 'auto'>;

export const CARD_SIZES: { id: CardSize; label: string; hint: string; cols: number; rows: number }[] = [
  { id: 'auto', label: 'Auto', hint: 'Follows the default bento pattern', cols: 0, rows: 0 },
  { id: 'small', label: 'Small', hint: '1 × 1', cols: 1, rows: 1 },
  { id: 'wide', label: 'Wide', hint: '2 × 1', cols: 2, rows: 1 },
  { id: 'tall', label: 'Tall', hint: '1 × 2', cols: 1, rows: 2 },
  { id: 'large', label: 'Large', hint: '2 × 2', cols: 2, rows: 2 },
];

/** Grid spans (md and up). On phones every card is a single full-width tile. */
const SPAN_CLASS: Record<ConcreteCardSize, string> = {
  small: 'md:col-span-1 md:row-span-1',
  wide: 'md:col-span-2 md:row-span-1',
  tall: 'md:col-span-1 md:row-span-2',
  large: 'md:col-span-2 md:row-span-2',
};

/** Width / height of each size on the 4-column grid (276px columns, 300px rows, 16px gaps). */
const ASPECT: Record<ConcreteCardSize, number> = {
  small: 276 / 300,
  wide: 568 / 300,
  tall: 276 / 616,
  large: 568 / 616,
};

/** The original repeating bento pattern, by card position. */
export const autoSizeForIndex = (index: number): ConcreteCardSize => {
  switch (index % 8) {
    case 0:
      return 'large';
    case 3:
    case 4:
      return 'wide';
    case 5:
      return 'tall';
    default:
      return 'small';
  }
};

export const resolveCardSize = (size: CardSize | undefined, index: number): ConcreteCardSize =>
  !size || size === 'auto' ? autoSizeForIndex(index) : size;

export const spanClassFor = (size: ConcreteCardSize): string => SPAN_CLASS[size];
export const aspectFor = (size: ConcreteCardSize): number => ASPECT[size];
