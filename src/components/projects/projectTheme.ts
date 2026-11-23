import { BarChart3, Bus, GraduationCap, Heart, Scale, type LucideIcon } from 'lucide-react';
import type { ProjectData } from '@/hooks/usePortfolioData';

/** The five miniature environments on the island. */
export type PlotKind = 'school' | 'scales' | 'station' | 'bars' | 'cottage';

export const PLOT_KINDS: PlotKind[] = ['school', 'scales', 'station', 'bars', 'cottage'];

export const PLOT_ICONS: Record<PlotKind, LucideIcon> = {
  school: GraduationCap,
  scales: Scale,
  station: Bus,
  bars: BarChart3,
  cottage: Heart,
};

const KEYWORDS: ReadonlyArray<readonly [RegExp, PlotKind]> = [
  [/edu|bridge|connect|mentor|student|college/i, 'school'],
  [/bias|fair|law|legal|ethic/i, 'scales'],
  [/jana|naadi|civic|transit|train|govern|citizen/i, 'station'],
  [/fin|money|budget|invest|wealth/i, 'bars'],
  [/senior|sage|health|care|elder|wellness/i, 'cottage'],
];

/**
 * Picks a distinct environment for every project: keyword matches on the title first,
 * then any project left over takes a plot style that is still unused.
 */
export const assignPlotKinds = (projects: Pick<ProjectData, 'title'>[]): PlotKind[] => {
  const used = new Set<PlotKind>();
  const kinds: (PlotKind | null)[] = projects.map(({ title }) => {
    const match = KEYWORDS.find(([pattern, kind]) => pattern.test(title) && !used.has(kind));
    if (match) used.add(match[1]);
    return match ? match[1] : null;
  });
  return kinds.map((kind, i) => {
    if (kind) return kind;
    const free = PLOT_KINDS.find((candidate) => !used.has(candidate)) ?? PLOT_KINDS[i % PLOT_KINDS.length];
    used.add(free);
    return free;
  });
};
