import { HackathonPhoto } from '../hackathons/HackathonCardFace';
import type { SizeOption, StudioConfig } from '../hackathons/studioConfig';

const SIZES: SizeOption[] = [
  { id: 'auto', label: 'Auto', hint: 'Large for first place', cols: 0, rows: 0 },
  { id: 'normal', label: 'Normal', hint: '1 column', cols: 1, rows: 1 },
  { id: 'large', label: 'Large', hint: '2 columns', cols: 2, rows: 1 },
];

/** Photo Studio settings for a Hall of Fame photo. "Auto" makes first places large, matching the site. */
export const achievementStudio = (isFirstPlace: boolean): StudioConfig => ({
  sizes: SIZES,
  resolveSize: (size) => (size === 'large' || (size !== 'normal' && isFirstPlace) ? 'large' : 'normal'),
  aspectOf: (size) => (size === 'large' ? 16 / 10 : 4 / 3),
  sizeHelp: 'How wide this photo is on the Hall of Fame board. Auto makes first places large.',
  showOverlay: false,
  renderFace: ({ name, image, edit }) => (
    <div className="absolute inset-0 bg-[#e7e2d6]">{image ? <HackathonPhoto src={image} alt={name} edit={edit} /> : null}</div>
  ),
});
