import type { ReactNode } from 'react';
import { HackathonCardFace } from './HackathonCardFace';
import { CARD_SIZES, aspectFor, resolveCardSize, type CardSize, type ConcreteCardSize, type PhotoEdit } from './photoEdit';

export interface SizeOption {
  id: string;
  label: string;
  hint: string;
  cols: number;
  rows: number;
}

export interface StudioFaceProps {
  name: string;
  year: string;
  image: string;
  edit: PhotoEdit;
}

/** What the Photo Studio needs to know about the card it is editing. */
export interface StudioConfig {
  sizes: SizeOption[];
  /** Turn a stored size (possibly "auto") into the concrete size used for the preview. */
  resolveSize: (size: string | undefined, index: number) => string;
  /** Width / height of the preview frame for a concrete size. */
  aspectOf: (size: string) => number;
  sizeHelp: string;
  /** Show the "title shadow" slider (only hackathon cards have a title over the photo). */
  showOverlay: boolean;
  renderFace: (props: StudioFaceProps) => ReactNode;
}

/** Hackathon bento cards: the original behaviour of the studio. */
export const HACKATHON_STUDIO: StudioConfig = {
  sizes: CARD_SIZES,
  resolveSize: (size, index) => resolveCardSize(size as CardSize | undefined, index),
  aspectOf: (size) => aspectFor(size as ConcreteCardSize),
  sizeHelp: 'How big this card is in the Hackathons grid on desktop.',
  showOverlay: true,
  renderFace: ({ name, year, image, edit }) => (
    <HackathonCardFace name={name || 'Hackathon name'} year={year || String(new Date().getFullYear())} image={image} photoEdit={edit} hoverEffects={false} />
  ),
};
