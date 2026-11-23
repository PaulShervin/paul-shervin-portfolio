export type CardFace = 'about' | 'leetcode' | 'github' | 'linkedin';

/** Tap order: each tap on the card advances to the next face and wraps around. */
export const FACE_ORDER: CardFace[] = ['about', 'leetcode', 'github', 'linkedin'];

export const nextFace = (face: CardFace): CardFace =>
  FACE_ORDER[(FACE_ORDER.indexOf(face) + 1) % FACE_ORDER.length];

export interface CardTheme {
  /** Woven strap colour and the colour of the repeated label printed on it. */
  strap: string;
  strapText: string;
  /** Word repeated along the strap; `null` uses the person's name. */
  strapLabel: string | null;
  /** Card shell classes (border, background). */
  shell: string;
  /** Header band classes. */
  header: string;
  /** Hint shown under the card describing what the next tap reveals. */
  hint: string;
  dark: boolean;
}

export const CARD_THEMES: Record<CardFace, CardTheme> = {
  about: {
    strap: '#0f4a35',
    strapText: '#eaf6ef',
    strapLabel: null,
    shell: 'border-primary/25 bg-[#f7faf7]',
    header:
      '[background-image:repeating-radial-gradient(circle_at_20%_140%,rgba(255,255,255,0.09)_0_1.5px,transparent_1.5px_16px),linear-gradient(135deg,#2f7a58,#1e5a40)]',
    hint: 'Click the card to view my LeetCode',
    dark: false,
  },
  leetcode: {
    strap: '#FFA116',
    strapText: '#1a1200',
    strapLabel: 'LEETCODE',
    shell: 'border-white/10 bg-[#141414]',
    header: 'bg-[linear-gradient(135deg,#3a2a0a,#141414)]',
    hint: 'Click again to view my GitHub',
    dark: true,
  },
  github: {
    strap: '#30363d',
    strapText: '#e6edf3',
    strapLabel: 'GITHUB',
    shell: 'border-white/10 bg-[#141414]',
    header: 'bg-[linear-gradient(135deg,#2b2b2b,#0e0e0e)]',
    hint: 'Click again to view my LinkedIn',
    dark: true,
  },
  linkedin: {
    strap: '#0A66C2',
    strapText: '#eaf3fc',
    strapLabel: 'LINKEDIN',
    shell: 'border-white/10 bg-[#141414]',
    header: 'bg-[linear-gradient(135deg,#0A66C2,#073f78)]',
    hint: 'Click again to go back to my profile',
    dark: true,
  },
};
