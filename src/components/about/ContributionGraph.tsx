import { useMemo } from 'react';

/** GitHub-style activity heatmap: 53 columns of weeks, 7 rows of days, ending today. */

interface ContributionGraphProps {
  /** Map of 'YYYY-MM-DD' (UTC) → count. */
  counts: Record<string, number>;
  accent: string;
  /** Singular noun for tooltips and the total line, e.g. "submission". */
  unit: string;
}

const WEEKS = 53;
const DAY_MS = 86_400_000;
const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_GUTTER = 28;
const TOP_GUTTER = 18;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS: Array<[number, string]> = [
  [1, 'Mon'],
  [3, 'Wed'],
  [5, 'Fri'],
];
const LEVEL_OPACITY = [0.08, 0.3, 0.55, 0.78, 1];

interface Cell {
  key: string;
  count: number;
  month: number;
}

const buildCells = (counts: Record<string, number>): Cell[] => {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const endDow = new Date(todayUtc).getUTCDay();
  const totalCells = (WEEKS - 1) * 7 + endDow + 1;
  const startUtc = todayUtc - (totalCells - 1) * DAY_MS;

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(startUtc + i * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    return { key, count: counts[key] ?? 0, month: date.getUTCMonth() };
  });
};

const toWeeks = (cells: Cell[]): Cell[][] =>
  Array.from({ length: Math.ceil(cells.length / 7) }, (_, w) => cells.slice(w * 7, w * 7 + 7));

const levelFor = (count: number, max: number) => {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
};

export const ContributionGraph = ({ counts, accent, unit }: ContributionGraphProps) => {
  const { weeks, total, max, monthLabels } = useMemo(() => {
    const cells = buildCells(counts);
    const weeks = toWeeks(cells);
    const total = cells.reduce((sum, c) => sum + c.count, 0);
    const max = cells.reduce((m, c) => Math.max(m, c.count), 0);
    const monthLabels = weeks.reduce<Array<{ x: number; label: string }>>((acc, week, w) => {
      const month = week[0].month;
      const prev = w > 0 ? weeks[w - 1][0].month : -1;
      return month !== prev && w < weeks.length - 1 ? [...acc, { x: w * STEP, label: MONTHS[month] }] : acc;
    }, []);
    return { weeks, total, max, monthLabels };
  }, [counts]);

  const width = LEFT_GUTTER + weeks.length * STEP;
  const height = TOP_GUTTER + 7 * STEP;
  const plural = total === 1 ? unit : `${unit}s`;

  return (
    <div>
      <div className="overflow-x-auto pb-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full h-auto min-w-[540px] sm:min-w-0"
          role="img"
          aria-label={`${total.toLocaleString('en-US')} ${plural} in the last year`}
        >
          {monthLabels.map(({ x, label }) => (
            <text key={`${label}-${x}`} x={LEFT_GUTTER + x} y={10} fontSize="10" fill="rgba(255,255,255,0.5)">
              {label}
            </text>
          ))}
          {DAY_LABELS.map(([row, label]) => (
            <text key={label} x={0} y={TOP_GUTTER + row * STEP + CELL - 2} fontSize="10" fill="rgba(255,255,255,0.5)">
              {label}
            </text>
          ))}
          {weeks.map((week, w) =>
            week.map((cell, d) => (
              <rect
                key={cell.key}
                x={LEFT_GUTTER + w * STEP}
                y={TOP_GUTTER + d * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                fill={accent}
                fillOpacity={LEVEL_OPACITY[levelFor(cell.count, max)]}
              >
                <title>{`${cell.count} ${cell.count === 1 ? unit : `${unit}s`} on ${cell.key}`}</title>
              </rect>
            ))
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-white/55">
        <span>
          <span className="font-semibold text-white/85">{total.toLocaleString('en-US')}</span> {plural} in the last year
        </span>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_OPACITY.map(opacity => (
            <span key={opacity} className="inline-block h-[10px] w-[10px] rounded-[2px]" style={{ background: accent, opacity }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
};
