import type { CardFace } from './cardTheme';

/** What the robot's helmet display can show. */
export type HelmetIconKey = 'leetcode' | 'github' | 'linkedin' | 'avatar';

/** What the speech bubble's single platform icon can show. */
export type BubbleIconKey = 'leetcode' | 'github' | 'linkedin' | 'home';

/**
 * The robot always advertises the destination of the NEXT card click
 * (about → leetcode → github → linkedin → about), so both mappings are keyed by the current face
 * and describe where a click will take the visitor.
 */
export const HELMET_ICON_BY_FACE: Record<CardFace, HelmetIconKey> = {
  about: 'leetcode',
  leetcode: 'github',
  github: 'linkedin',
  linkedin: 'avatar',
};

/** Speech-bubble message and icon per ID-card state (exactly one of each is ever shown). */
export const SPEECH_BUBBLE_BY_FACE: Record<CardFace, { text: string; icon: BubbleIconKey }> = {
  about: { text: 'Click the ID card for LeetCode', icon: 'leetcode' },
  leetcode: { text: 'Click the ID card for GitHub', icon: 'github' },
  github: { text: 'Click the ID card for LinkedIn', icon: 'linkedin' },
  linkedin: { text: 'Click the ID card to go back', icon: 'home' },
};
