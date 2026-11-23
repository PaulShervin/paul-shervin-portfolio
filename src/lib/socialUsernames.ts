/** Extracts the trailing path segment of a profile URL, e.g. ".../u/paulshervinp/" → "paulshervinp". */
export const usernameFromUrl = (url: string | undefined, fallback: string): string => {
  if (!url) return fallback;
  const segment = url.replace(/\/$/, '').split('/').pop();
  return segment && segment.length > 0 ? segment : fallback;
};

export const DEFAULT_LEETCODE_USERNAME = 'paulshervinp';
export const DEFAULT_GITHUB_USERNAME = 'PaulShervin';
