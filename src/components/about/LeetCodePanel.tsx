import { Award, CalendarDays, Flame } from 'lucide-react';
import { useLeetCodeStats } from '@/hooks/useLeetCodeStats';
import { ContributionGraph } from './ContributionGraph';
import { PanelCard, PanelError, PanelHeading, Skeleton, StatBlock } from './panelPrimitives';

const LEETCODE_ORANGE = '#FFA116';
const LEETCODE_GREEN = '#2cbb5d';

interface LeetCodeDetailsProps {
  username: string;
  profileUrl: string;
}

const StreakBlock = ({ username, profileUrl }: LeetCodeDetailsProps) => {
  const { calendarQuery } = useLeetCodeStats(username);
  const calendar = calendarQuery.data;

  return (
    <PanelCard className="p-5">
      <PanelHeading icon={Flame} title="Streak" accent={LEETCODE_ORANGE} />
      {calendarQuery.isError ? (
        <PanelError message="Streak data is unavailable right now." href={profileUrl} linkLabel="Open LeetCode" />
      ) : calendarQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatBlock value={calendar?.streak ?? 0} label="Current day streak" accent={LEETCODE_ORANGE} />
          <StatBlock value={calendar?.totalActiveDays ?? 0} label="Total active days" />
        </div>
      )}
    </PanelCard>
  );
};

const BadgesBlock = ({ username, profileUrl }: LeetCodeDetailsProps) => {
  const { badgesQuery } = useLeetCodeStats(username);
  const badges = badgesQuery.data ?? [];

  return (
    <PanelCard className="p-5">
      <PanelHeading icon={Award} title={`Badges${badges.length ? ` · ${badges.length}` : ''}`} accent={LEETCODE_ORANGE} />
      {badgesQuery.isError ? (
        <PanelError message="Badges could not be loaded." href={profileUrl} linkLabel="See them on LeetCode" />
      ) : badgesQuery.isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {badges.map(badge => (
            <li key={badge.id} className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-3 text-center">
              <img src={badge.image} alt={badge.name} className="h-14 w-14 object-contain" loading="lazy" />
              <span className="line-clamp-2 text-[11px] leading-tight text-white/70">{badge.name}</span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
};

const ActivityBlock = ({ username, profileUrl }: LeetCodeDetailsProps) => {
  const { calendarQuery } = useLeetCodeStats(username);

  return (
    <PanelCard className="p-5">
      <PanelHeading icon={CalendarDays} title="Submission activity" accent={LEETCODE_GREEN} />
      {calendarQuery.isError ? (
        <PanelError message="Activity data is unavailable right now." href={profileUrl} linkLabel="Open LeetCode" />
      ) : calendarQuery.isLoading ? (
        <Skeleton className="h-[120px]" />
      ) : (
        <ContributionGraph counts={calendarQuery.data?.counts ?? {}} accent={LEETCODE_GREEN} unit="submission" />
      )}
    </PanelCard>
  );
};

/** Right-hand column for the LeetCode face: streak, activity heatmap and badges. */
export const LeetCodeDetails = (props: LeetCodeDetailsProps) => (
  <div className="flex flex-col gap-5">
    <StreakBlock {...props} />
    <ActivityBlock {...props} />
    <BadgesBlock {...props} />
  </div>
);
