import { CalendarDays, Flame, Star } from 'lucide-react';
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { ContributionGraph } from './ContributionGraph';
import { PanelCard, PanelError, PanelHeading, Skeleton, StatBlock, formatNumber } from './panelPrimitives';

const GITHUB_GREEN = '#3FB950';
const STAR_GOLD = '#E3B341';

interface GitHubDetailsProps {
  username: string;
  profileUrl: string;
}

const StreakBlock = ({ username, profileUrl }: GitHubDetailsProps) => {
  const { streakQuery } = useGitHubStats(username);
  const streak = streakQuery.data;

  return (
    <PanelCard className="p-5">
      <PanelHeading icon={Flame} title="Contribution streak" accent={GITHUB_GREEN} />
      {streakQuery.isError ? (
        <PanelError message="Streak data is unavailable right now." href={profileUrl} linkLabel="Open GitHub" />
      ) : streakQuery.isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatBlock value={streak?.currentStreak ?? 0} label="Current day streak" accent={GITHUB_GREEN} />
          <StatBlock value={streak?.longestStreak ?? 0} label="Longest streak" />
          <StatBlock value={formatNumber(streak?.contributionsLastYear ?? 0)} label="Contributions, last year" />
        </div>
      )}
    </PanelCard>
  );
};

const StarsBlock = ({ username, profileUrl }: GitHubDetailsProps) => {
  const { starsQuery } = useGitHubStats(username);
  const stars = starsQuery.data;

  return (
    <PanelCard className="p-5">
      <PanelHeading icon={Star} title="Stars" accent={STAR_GOLD} />
      {starsQuery.isError ? (
        <PanelError message="Repository data is unavailable right now." href={profileUrl} linkLabel="Browse on GitHub" />
      ) : starsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
          <StatBlock value={formatNumber(stars?.totalStars ?? 0)} label="Stars received" accent={STAR_GOLD} />
          <ul className="flex flex-col divide-y divide-white/10 rounded-xl border border-white/10 bg-black/30">
            {(stars?.topRepos ?? []).map(repo => (
              <li key={repo.name}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{repo.name}</span>
                  {repo.language && <span className="hidden text-xs text-white/50 sm:inline">{repo.language}</span>}
                  <span className="flex items-center gap-1 text-sm tabular-nums text-white/80">
                    <Star className="h-3.5 w-3.5" style={{ color: STAR_GOLD }} aria-hidden="true" />
                    {repo.stargazers_count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PanelCard>
  );
};

const ActivityBlock = ({ username, profileUrl }: GitHubDetailsProps) => {
  const { streakQuery } = useGitHubStats(username);

  return (
    <PanelCard className="p-5">
      <PanelHeading icon={CalendarDays} title="Contribution activity" accent={GITHUB_GREEN} />
      {streakQuery.isError ? (
        <PanelError message="Activity data is unavailable right now." href={profileUrl} linkLabel="Open GitHub" />
      ) : streakQuery.isLoading ? (
        <Skeleton className="h-[120px]" />
      ) : (
        <ContributionGraph counts={streakQuery.data?.counts ?? {}} accent={GITHUB_GREEN} unit="contribution" />
      )}
    </PanelCard>
  );
};

/** Right-hand column for the GitHub face: streak, contribution heatmap and stars. */
export const GitHubDetails = (props: GitHubDetailsProps) => (
  <div className="flex flex-col gap-5">
    <StreakBlock {...props} />
    <ActivityBlock {...props} />
    <StarsBlock {...props} />
  </div>
);
