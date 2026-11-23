import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const API_BASE = 'https://alfa-leetcode-api.onrender.com';
const STALE_TIME = 1000 * 60 * 30;

const profileSchema = z.object({
  username: z.string(),
  name: z.string().nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  ranking: z.number().nullable().optional(),
  country: z.string().nullable().optional(),
});

const calendarSchema = z.object({
  streak: z.number(),
  totalActiveDays: z.number(),
  activeYears: z.array(z.number()).optional(),
  /** JSON string of { unixSeconds: submissionCount }. */
  submissionCalendar: z.string().optional(),
});

const badgesSchema = z.object({
  badgesCount: z.number().optional(),
  badges: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      icon: z.string(),
      creationDate: z.string().optional(),
    })
  ),
});

export type LeetCodeProfile = z.infer<typeof profileSchema>;
export interface LeetCodeCalendar {
  streak: number;
  totalActiveDays: number;
  /** 'YYYY-MM-DD' (UTC) → submissions that day. */
  counts: Record<string, number>;
}
export interface LeetCodeBadge {
  id: string;
  name: string;
  image: string;
  earnedOn?: string;
}

const fetchJson = async <T>(path: string, schema: z.ZodSchema<T>): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`LeetCode API responded ${response.status} for ${path}`);
  }
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`LeetCode API returned an unexpected shape for ${path}`);
  }
  return parsed.data;
};

/** Turns LeetCode's { unixSeconds: count } JSON string into a date-keyed map. */
const parseSubmissionCalendar = (raw: string | undefined): Record<string, number> => {
  if (!raw) return {};
  try {
    const parsed = z.record(z.number()).parse(JSON.parse(raw));
    return Object.entries(parsed).reduce<Record<string, number>>((acc, [seconds, count]) => {
      const key = new Date(Number(seconds) * 1000).toISOString().slice(0, 10);
      return { ...acc, [key]: (acc[key] ?? 0) + count };
    }, {});
  } catch {
    return {};
  }
};

/** Badge icons sometimes come back as site-relative paths. */
const absoluteIcon = (icon: string) => (icon.startsWith('/') ? `https://leetcode.com${icon}` : icon);

export const useLeetCodeStats = (username: string) => {
  const profileQuery = useQuery<LeetCodeProfile>({
    queryKey: ['leetcode', 'profile', username],
    queryFn: () => fetchJson(`/${username}`, profileSchema),
    staleTime: STALE_TIME,
    retry: 2,
  });

  const calendarQuery = useQuery<LeetCodeCalendar>({
    queryKey: ['leetcode', 'calendar', username],
    queryFn: async () => {
      const data = await fetchJson(`/${username}/calendar`, calendarSchema);
      return {
        streak: data.streak,
        totalActiveDays: data.totalActiveDays,
        counts: parseSubmissionCalendar(data.submissionCalendar),
      };
    },
    staleTime: STALE_TIME,
    retry: 2,
  });

  const badgesQuery = useQuery<LeetCodeBadge[]>({
    queryKey: ['leetcode', 'badges', username],
    queryFn: async () => {
      const data = await fetchJson(`/${username}/badges`, badgesSchema);
      return data.badges.map(badge => ({
        id: badge.id,
        name: badge.displayName,
        image: absoluteIcon(badge.icon),
        earnedOn: badge.creationDate,
      }));
    },
    staleTime: STALE_TIME,
    retry: 2,
  });

  return { profileQuery, calendarQuery, badgesQuery };
};
