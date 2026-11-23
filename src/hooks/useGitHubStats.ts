import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const GITHUB_API = 'https://api.github.com';
const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4';
const STALE_TIME = 1000 * 60 * 30;
const TOP_REPO_COUNT = 3;

const userSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.string().url(),
  html_url: z.string().url(),
  bio: z.string().nullable().optional(),
  followers: z.number(),
  following: z.number(),
  public_repos: z.number(),
});

const repoSchema = z.object({
  name: z.string(),
  html_url: z.string().url(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  fork: z.boolean(),
});

const contributionsSchema = z.object({
  total: z.record(z.number()),
  contributions: z.array(z.object({ date: z.string(), count: z.number() })),
});

export type GitHubUser = z.infer<typeof userSchema>;
export type GitHubRepo = z.infer<typeof repoSchema>;

export interface GitHubStars {
  totalStars: number;
  topRepos: GitHubRepo[];
}

export interface GitHubStreak {
  currentStreak: number;
  longestStreak: number;
  contributionsLastYear: number;
  /** 'YYYY-MM-DD' → contributions that day. */
  counts: Record<string, number>;
}

const fetchJson = async <T>(url: string, schema: z.ZodSchema<T>): Promise<T> => {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) {
    throw new Error(`Request to ${url} responded ${response.status}`);
  }
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Unexpected response shape from ${url}`);
  }
  return parsed.data;
};

/** Longest run of active days, and the run that ends today (or yesterday if today is still empty). */
export const computeStreaks = (days: Array<{ count: number }>): Pick<GitHubStreak, 'currentStreak' | 'longestStreak'> => {
  const longestStreak = days.reduce(
    (acc, day) => {
      const run = day.count > 0 ? acc.run + 1 : 0;
      return { run, best: Math.max(acc.best, run) };
    },
    { run: 0, best: 0 }
  ).best;

  const lastIndex = days.length - 1;
  const start = lastIndex >= 0 && days[lastIndex].count === 0 ? lastIndex - 1 : lastIndex;
  const currentStreak = days
    .slice(0, start + 1)
    .reverse()
    .findIndex(day => day.count === 0);

  return {
    currentStreak: currentStreak === -1 ? start + 1 : currentStreak,
    longestStreak,
  };
};

export const useGitHubStats = (username: string) => {
  const userQuery = useQuery<GitHubUser>({
    queryKey: ['github', 'user', username],
    queryFn: () => fetchJson(`${GITHUB_API}/users/${username}`, userSchema),
    staleTime: STALE_TIME,
    retry: 1,
  });

  const starsQuery = useQuery<GitHubStars>({
    queryKey: ['github', 'stars', username],
    queryFn: async () => {
      const repos = await fetchJson(`${GITHUB_API}/users/${username}/repos?per_page=100`, z.array(repoSchema));
      const own = repos.filter(repo => !repo.fork);
      const totalStars = own.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const topRepos = [...own]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, TOP_REPO_COUNT);
      return { totalStars, topRepos };
    },
    staleTime: STALE_TIME,
    retry: 1,
  });

  const streakQuery = useQuery<GitHubStreak>({
    queryKey: ['github', 'streak', username],
    queryFn: async () => {
      const data = await fetchJson(`${CONTRIBUTIONS_API}/${username}?y=last`, contributionsSchema);
      const days = data.contributions.map(day => ({ date: day.date ?? '', count: day.count ?? 0 }));
      const { currentStreak, longestStreak } = computeStreaks(days);
      const counts = days.reduce<Record<string, number>>((acc, day) => ({ ...acc, [day.date]: day.count }), {});
      return { currentStreak, longestStreak, contributionsLastYear: data.total.lastYear ?? 0, counts };
    },
    staleTime: STALE_TIME,
    retry: 1,
  });

  return { userQuery, starsQuery, streakQuery };
};
