import type { AchievementData, HackathonData } from '@/hooks/usePortfolioData';
import { photoFromHackathons } from './photoMatch';
import { CATEGORY, type Win } from './PinnedWin';

export const extractYear = (text?: string) => text?.match(/\b(20\d{2})\b/)?.[0] ?? '';

/** "1st Place", "3 rd place" -> {big:"1", small:"st", n:1}; "Top 15" -> {big:"15", small:"top"} */
export const extractRank = (title: string): Win['rank'] => {
  const ord = title.match(/\b(\d+)\s*(st|nd|rd|th)\b/i);
  if (ord) return { big: ord[1], small: ord[2].toLowerCase(), n: Number(ord[1]), podium: Number(ord[1]) <= 3, isTop: false };
  const top = title.match(/\btop\s*(\d+)\b/i);
  if (top) return { big: top[1], small: 'top', n: Number(top[1]), podium: false, isTop: true };
  return null;
};

/** "1st Place - Smart India Hackathon" -> "Smart India Hackathon" (the result is shown on the note instead). */
export const cleanTitle = (title: string) => {
  const parts = title.split(/\s[-–—]\s/);
  return parts.length > 1 && extractRank(parts[0]) ? parts.slice(1).join(' - ') : title;
};

/** Everything the Hall of Fame needs to draw one achievement. Shared by the site and the admin board. */
export const toWin = (a: AchievementData, index: number, hackathons: HackathonData[]): Win => {
  const event = a.organization || '';
  return {
    id: a.id ?? String(index),
    title: cleanTitle(a.title),
    event,
    year: String(a.year ?? '') || extractYear(a.organization) || extractYear(a.title),
    category: CATEGORY[a.category] ? a.category : 'other',
    description: a.description || '',
    // the photo set in the admin wins; otherwise borrow the matching hackathon's photo (only if unambiguous)
    image: a.image || photoFromHackathons(a.title, event, hackathons),
    photoEdit: a.photoEdit,
    cardSize: a.cardSize,
    rank: extractRank(a.title),
  };
};
