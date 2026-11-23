import type { HackathonData } from '@/hooks/usePortfolioData';

// words that say nothing about WHICH event it was (so "challenge" alone never links two different events)
const STOP = new Set([
  'hackathon', 'hackethon', 'hack', 'the', 'and', 'for', 'with', 'level', 'state', 'round', 'finals', 'final', 'place', 'top',
  'challenge', 'contest', 'award', 'awards', 'best', 'badge', 'project', 'weekly', 'long', 'college', 'tech', 'fest', 'star',
  'winner', 'team', 'open', 'cup', 'national', 'nationals', 'india', 'indian', 'coding', 'competition', 'event',
]);

const tokens = (text: string): Set<string> =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !/^\d/.test(w) && !/^(st|nd|rd|th)$/.test(w) && !STOP.has(w)),
  );

const usable = (url?: string) => Boolean(url && url !== '/placeholder.svg');

/**
 * When an achievement has no photo of its own, borrow the photo of the hackathon it obviously belongs to.
 * Only returns a photo when the match is unambiguous, so a wrong picture is never pinned.
 */
export const photoFromHackathons = (title: string, event: string, hackathons: HackathonData[]): string | undefined => {
  const wanted = tokens(`${title} ${event}`);
  const wantsNational = /national/i.test(`${title} ${event}`);

  const scored = hackathons
    .filter((h) => usable(h.image))
    .map((h) => {
      const names = tokens(h.name);
      let overlap = 0;
      names.forEach((w) => {
        if (wanted.has(w)) overlap += 1;
      });
      return { h, overlap };
    })
    .filter((x) => x.overlap > 0);
  if (!scored.length) return undefined;

  const best = Math.max(...scored.map((x) => x.overlap));
  let top = scored.filter((x) => x.overlap === best);
  if (top.length > 1) {
    // e.g. state-level vs nationals of the same event
    const byLevel = top.filter((x) => /national/i.test(x.h.name) === wantsNational);
    if (byLevel.length) top = byLevel;
  }
  return top.length === 1 ? top[0].h.image : undefined;
};
