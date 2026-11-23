import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Cpu, ExternalLink, Github, Hash, Layers, Maximize2, Database, TrendingUp, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/hooks/usePortfolioData';
import { isValidUrl, parseProjectMetrics, projectSlug } from '@/lib/projectPresentation';

const serif = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const MAX_TAGS = 3;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card';

/** Picks a fitting icon for a technology chip from its name; falls back to a neutral mark. */
const techIcon = (name: string): LucideIcon => {
  if (/fire|sql|mongo|postgres|supabase|redis|db|data/i.test(name)) return Database;
  if (/fast|api|node|flask|django|express|server|spring/i.test(name)) return Layers;
  if (/rag|llm|gpt|bert|torch|tensor|ml|ai|model|python|vision|nlp/i.test(name)) return Cpu;
  return Hash;
};

interface ProjectPanelProps {
  project: ProjectData;
  className?: string;
}

/** Floating glass card with the selected project's preview, summary, stack, metrics and actions. */
export const ProjectPanel = ({ project, className }: ProjectPanelProps) => {
  const href = `/project/${projectSlug(project)}`;
  const metrics = parseProjectMetrics(project.metrics, 2);
  const tags = project.tech.slice(0, MAX_TAGS);
  const hiddenTags = project.tech.length - tags.length;
  const hasLive = isValidUrl(project.live);
  const hasRepo = isValidUrl(project.repo);

  return (
    <div
      className={cn(
        'rounded-[28px] border border-white/70 bg-card/80 p-4 shadow-[0_30px_80px_-40px_rgba(39,52,59,0.45),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:p-5 xl:p-6',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={project.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          aria-labelledby={`panel-title-${project.id}`}
          aria-live="polite"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-secondary/50">
            {project.screenshot ? (
              <img
                src={project.screenshot}
                alt={`${project.title} interface`}
                decoding="async"
                draggable={false}
                className="block aspect-[16/9] w-full object-cover object-top"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full flex-col items-center justify-center bg-card text-center">
                <span className="text-6xl leading-none text-primary/70" style={serif}>
                  {project.title.charAt(0)}
                </span>
                <span className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview coming soon</span>
              </div>
            )}
            <Link
              to={href}
              aria-label={`Open the ${project.title} case study`}
              className={cn(
                'absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white',
                focusRing
              )}
            >
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <h3 id={`panel-title-${project.id}`} className="mt-4 text-[1.9rem] font-semibold leading-none tracking-tight text-foreground xl:text-[2.2rem]" style={serif}>
            {project.title}
          </h3>
          <p className="mt-2.5 line-clamp-3 text-[14px] leading-relaxed text-muted-foreground xl:text-[15px]">{project.summary}</p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
            {tags.map((tech) => {
              const Icon = techIcon(tech);
              return (
                <li key={tech} className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-[13px] font-medium text-foreground/85">
                  <Icon className="h-3.5 w-3.5 text-foreground/60" aria-hidden="true" />
                  {tech}
                </li>
              );
            })}
            {hiddenTags > 0 && (
              <li className="flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary" aria-label={`${hiddenTags} more technologies`}>
                +{hiddenTags}
              </li>
            )}
          </ul>

          {metrics.length > 0 && (
            <dl className="mt-4 grid grid-flow-col auto-cols-fr divide-x divide-border/70 border-t border-border/60 pt-4">
              {metrics.map(({ value, label }) => (
                <div key={`${value}-${label}`} className="flex items-center gap-3 pr-3 [&:not(:first-child)]:pl-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                    <TrendingUp className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <dd className="text-xl font-semibold leading-none text-foreground">{value}</dd>
                    <dt className="mt-1 text-xs leading-snug text-muted-foreground">{label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              to={href}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full bg-[#1e4d3a] px-5 text-[15px] font-medium text-white shadow-[0_12px_26px_-12px_rgba(30,77,58,0.75)] transition-colors hover:bg-[#173d2e]',
                focusRing
              )}
            >
              View Case Study
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {hasLive && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-[15px] font-medium text-foreground transition-colors hover:border-primary/50',
                  focusRing
                )}
              >
                Live Demo
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            {hasRepo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary/50 hover:text-primary',
                  focusRing
                )}
              >
                <Github className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">GitHub repository for {project.title} (opens in a new tab)</span>
              </a>
            )}
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
};
