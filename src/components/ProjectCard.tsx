import { useRef, type MouseEvent } from 'react';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/hooks/usePortfolioData';
import { isValidUrl, parseProjectMetrics, projectCategory, projectSlug } from '@/lib/projectPresentation';

const serif = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const MAX_TAGS = 4;

const pad = (n: number) => String(n).padStart(2, '0');

const TILT_X = 5;
const TILT_Y = 4;
const REST_TRANSFORM = 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1)';

/** Short host label shown on the preview chip (live site first, then the repo). */
const previewHost = (project: ProjectData): string => {
  const url = isValidUrl(project.live) ? project.live : isValidUrl(project.repo) ? project.repo : '';
  if (!url) return project.title.toLowerCase().replace(/\s+/g, '-');
  try {
    return new URL(url, window.location.origin).host.replace(/^www\./, '');
  } catch {
    return project.title.toLowerCase().replace(/\s+/g, '-');
  }
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card';

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  total: number;
  className?: string;
}

export const ProjectCard = ({ project, index, total, className }: ProjectCardProps) => {
  const href = `/project/${projectSlug(project)}`;
  const category = projectCategory(project);
  const metrics = parseProjectMetrics(project.metrics);
  const visibleTags = project.tech.slice(0, MAX_TAGS);
  const hiddenTagCount = project.tech.length - visibleTags.length;
  const hasRepo = isValidUrl(project.repo);
  const hasLive = isValidUrl(project.live);
  const imageRef = useRef<HTMLImageElement>(null);

  /* Gentle 3D tilt that follows the pointer; skipped for reduced motion. */
  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const image = imageRef.current;
    if (!image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    image.style.transform = `perspective(1200px) rotateY(${(px * TILT_X).toFixed(2)}deg) rotateX(${(-py * TILT_Y).toFixed(2)}deg) scale(1.015)`;
  };
  const handleLeave = () => {
    if (imageRef.current) imageRef.current.style.transform = REST_TRANSFORM;
  };

  return (
    <article
      className={cn(
        'group relative grid overflow-hidden rounded-[28px] border border-border/80 bg-card',
        'shadow-[0_1px_2px_rgba(39,52,59,0.04),0_32px_80px_-48px_rgba(39,52,59,0.28)]',
        'lg:grid-cols-[57fr_43fr]',
        className
      )}
      aria-labelledby={`project-title-${project.id}`}
    >
      {/* ── Product showcase ── */}
      <div
        className="relative flex aspect-[16/10] min-h-0 items-center justify-center overflow-hidden border-b border-border/70 bg-secondary/60 p-5 sm:p-8 lg:aspect-auto lg:border-b-0 lg:border-r lg:p-8"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_18%,hsl(var(--primary)/0.12),transparent_62%)]"
          aria-hidden="true"
        />
        {/* faint dot grid for texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(hsl(var(--foreground)/0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,transparent_35%,#000_100%)]"
          aria-hidden="true"
        />
        {/* oversized outlined project number */}
        <span
          className="pointer-events-none absolute -bottom-6 -right-2 select-none text-[clamp(7rem,13vw,13rem)] font-semibold leading-none text-transparent"
          style={{ ...serif, WebkitTextStroke: '1px hsl(var(--foreground) / 0.12)' }}
          aria-hidden="true"
        >
          {pad(index + 1)}
        </span>
        {/* preview chip */}
        <span className="absolute left-4 top-4 z-10 flex max-w-[70%] items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur sm:left-5 sm:top-5">
          <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
            {hasLive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f9e6b] opacity-60" />}
            <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', hasLive ? 'bg-[#2f9e6b]' : 'bg-muted-foreground/50')} />
          </span>
          <span className="truncate font-mono">{previewHost(project)}</span>
        </span>
        <Link
          to={href}
          aria-label={`Open the ${project.title} case study`}
          className="relative flex h-full w-full items-center justify-center outline-none [&:focus-visible>*]:ring-2 [&:focus-visible>*]:ring-primary [&:focus-visible>*]:ring-offset-2"
        >
          {project.screenshot ? (
            <img
              ref={imageRef}
              src={project.screenshot}
              alt={`${project.title} interface`}
              decoding="async"
              draggable={false}
              style={{ transform: REST_TRANSFORM }}
              className="block h-auto max-h-full w-auto max-w-full rounded-2xl border border-foreground/[0.07] shadow-[0_28px_60px_-30px_rgba(39,52,59,0.45)] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
            />
          ) : (
            <div className="flex aspect-[16/10] w-full max-w-[520px] flex-col items-center justify-center rounded-2xl border border-foreground/[0.07] bg-card text-center shadow-[0_28px_60px_-30px_rgba(39,52,59,0.35)]">
              <span className="text-7xl leading-none text-primary/70" style={serif}>
                {project.title.charAt(0)}
              </span>
              <span className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview coming soon</span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Project information ── */}
      <div className="flex min-h-0 flex-col p-6 sm:p-8 lg:p-8 xl:p-11 2xl:p-14">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-mono tabular-nums tracking-wide text-foreground">
            {pad(index + 1)} <span className="text-muted-foreground">/ {pad(total)}</span>
          </span>
          <span className="h-px w-10 bg-border" aria-hidden="true" />
          <span className="text-[13px] font-medium tracking-wide text-muted-foreground">{category}</span>
        </div>

        <h3
          id={`project-title-${project.id}`}
          className="mt-5 text-[2.5rem] font-semibold leading-[0.98] tracking-tight text-foreground sm:text-5xl lg:mt-6 lg:text-[clamp(2.4rem,4.6vw,5.25rem)]"
          style={serif}
        >
          {project.title}
        </h3>

        <p className="mt-4 max-w-[46ch] shrink-0 text-[15px] leading-[1.75] text-muted-foreground lg:mt-5 lg:line-clamp-3 xl:line-clamp-4 xl:text-[17px] xl:leading-[1.8]">
          {project.summary}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2 lg:mt-6" aria-label="Technologies">
          {visibleTags.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-[13px] font-medium text-foreground/80 xl:px-4 xl:py-2 xl:text-sm"
            >
              {tech}
            </li>
          ))}
          {hiddenTagCount > 0 && (
            <li
              className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-[13px] font-medium text-primary xl:px-4 xl:py-2 xl:text-sm"
              aria-label={`${hiddenTagCount} more technologies`}
            >
              +{hiddenTagCount}
            </li>
          )}
        </ul>

        {metrics.length > 0 && (
          <dl className="mt-6 grid grid-flow-col auto-cols-fr divide-x divide-border/70 border-t border-border/70 pt-5 xl:mt-8 xl:pt-6">
            {metrics.map(({ value, label }) => (
              <div key={`${value}-${label}`} className="pr-4 first:pl-0 [&:not(:first-child)]:pl-5">
                <dd className="text-2xl font-semibold leading-none text-foreground xl:text-[2rem]">{value}</dd>
                <dt className="mt-2 text-[13px] leading-snug text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-4 border-t border-border/70 pt-5 lg:mt-auto xl:gap-x-6 xl:pt-6">
          <Link
            to={href}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full bg-[#1e4d3a] px-5 text-sm font-medium text-white xl:h-12 xl:px-6 xl:text-[15px]',
              'shadow-[0_10px_24px_-12px_rgba(30,77,58,0.7)] transition-colors hover:bg-[#173d2e]',
              focusRing
            )}
          >
            View Case Study
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          {(hasRepo || hasLive) && (
            <div className="flex items-center gap-3 xl:gap-5">
              {hasRepo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('group/link flex flex-col items-center gap-1.5 rounded-xl text-xs text-muted-foreground', focusRing)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors group-hover/link:border-primary/50 group-hover/link:text-primary xl:h-12 xl:w-12">
                    <Github className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="lg:hidden xl:block" aria-hidden="true">GitHub</span>
                  <span className="sr-only">GitHub repository for {project.title} (opens in a new tab)</span>
                </a>
              )}
              {hasLive && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('group/link flex flex-col items-center gap-1.5 rounded-xl text-xs text-muted-foreground', focusRing)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors group-hover/link:border-primary/50 group-hover/link:text-primary xl:h-12 xl:w-12">
                    <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="lg:hidden xl:block" aria-hidden="true">Live Demo</span>
                  <span className="sr-only">Live demo of {project.title} (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
