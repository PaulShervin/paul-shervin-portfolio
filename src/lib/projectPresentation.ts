import type { ProjectData } from '@/hooks/usePortfolioData';

/** Slug used by the /project/:projectId route (mirrors ProjectDetails lookup). */
export const projectSlug = (project: Pick<ProjectData, 'id' | 'title'>) =>
  project.title ? project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : project.id;

export const isValidUrl = (url?: string) =>
  Boolean(url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')));

const CATEGORY_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\b(bias|fairness|unbiased|explainab)/i, 'Responsible AI'],
  [/\b(civic|governance|citizen|democracy|policy)/i, 'Civic Intelligence'],
  [/\b(mentor|college|student|edu)/i, 'EdTech Platform'],
  [/\b(finance|financial|budget|invest|money)/i, 'Personal Finance'],
  [/\b(traffic|reinforcement)/i, 'Reinforcement Learning'],
  [/\b(summar|document|nlp|language)/i, 'Natural Language'],
  [/\b(medical|segmentation|scan|clinical)/i, 'Medical Imaging'],
  [/\b(agent|workflow|orchestrat)/i, 'Agentic AI'],
];

/**
 * Category label for the card eyebrow. Uses an explicit `category` field when
 * the data provides one; otherwise derives it from the project's own title and
 * summary so nothing is invented.
 */
export const projectCategory = (project: ProjectData & { category?: string }) => {
  if (project.category?.trim()) return project.category.trim();
  const haystack = `${project.title} ${project.summary}`;
  const match = CATEGORY_RULES.find(([pattern]) => pattern.test(haystack));
  return match ? match[1] : 'AI Project';
};

export interface ProjectMetric {
  value: string;
  label: string;
}

const METRIC_PATTERN = /^(\d[\d.,]*(?:\s?%|\+|x|[kKmM]\+?)?)\s+(\S.*)$/;

/**
 * Pulls quantified items (e.g. "92% fairness score") out of the free-text
 * `metrics` field. Qualitative items are dropped so the row only ever shows
 * figures the data actually states. Returns [] when nothing quantified exists.
 */
export const parseProjectMetrics = (metrics?: string, limit = 3): ProjectMetric[] => {
  if (!metrics) return [];
  return metrics
    .split(/[,;|•]|\band\b/)
    .map((item) => item.trim().replace(/\.$/, ''))
    .map((item) => item.match(METRIC_PATTERN))
    .filter((match): match is RegExpMatchArray => match !== null)
    .slice(0, limit)
    .map((match) => ({ value: match[1], label: match[2] }));
};
