import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, Mouse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ProjectCard } from './ProjectCard';
import { ProjectNav } from './projects/ProjectNav';
import { ProjectPanel } from './projects/ProjectPanel';
import { PLOT_ICONS, assignPlotKinds } from './projects/projectTheme';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/** The 3D engine is large: it loads only when the section is about to come into view. */
const IslandScene = lazy(() => import('./projects/IslandScene'));

const serif = { fontFamily: '"Cormorant Garamond", serif' };
const FEATURED_LIMIT = 5;
/** Viewport heights of scrolling spent on each project while the stage is pinned. */
const SCROLL_PER_PROJECT = 0.7;
const SWIPE_DISTANCE = 50;

const pad = (n: number) => String(n).padStart(2, '0');

const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

const detectWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
};

const useInView = (ref: RefObject<Element>, rootMargin: string) => {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
};

const roundButton =
  'flex h-14 w-14 items-center justify-center rounded-full border border-border/70 bg-card text-foreground shadow-[0_10px_24px_-14px_rgba(39,52,59,0.5)] transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40';

const SectionHeader = ({ className }: { className?: string }) => (
  <header className={className}>
    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1e4d3a]">Projects</p>
    <h2 className="mt-3 text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-6xl xl:text-[4.25rem]" style={serif}>
      My Work in Action
    </h2>
    <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
      Real problems. Practical AI solutions. Measurable impact.
    </p>
  </header>
);

export const Projects = () => {
  const { projectsQuery } = usePortfolioData();
  const data = projectsQuery.data;
  const projects = useMemo(() => (data || []).slice(0, FEATURED_LIMIT), [data]);
  const count = projects.length;
  const navigate = useNavigate();

  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const desktop = useMedia('(min-width: 1024px)');
  const webgl = useMemo(() => (typeof document === 'undefined' ? true : detectWebGL()), []);
  const pinned = desktop && !reduced && count > 1;

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const tweeningRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);
  const touchStartRef = useRef<number | null>(null);

  const near = useInView(sectionRef, '900px 0px');
  const [everNear, setEverNear] = useState(false);
  useEffect(() => {
    if (near) setEverNear(true);
  }, [near]);
  const onScreen = useInView(islandRef, '120px 0px');

  const items = useMemo(() => {
    const kinds = assignPlotKinds(projects);
    return projects.map((project, i) => ({
      id: project.id,
      title: project.title,
      kind: kinds[i],
      icon: PLOT_ICONS[kinds[i]],
    }));
  }, [projects]);

  const commit = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);

  /* Pinned desktop stage: scrolling walks through the projects. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !pinned || !webgl) {
      triggerRef.current = null;
      return;
    }

    const ctx = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * SCROLL_PER_PROJECT * count)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (tweeningRef.current) return;
          const next = Math.min(count - 1, Math.floor(self.progress * count));
          if (next !== activeRef.current) commit(next);
        },
      });
    }, stage);

    const refresh = () => ScrollTrigger.refresh();
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      scrollTweenRef.current?.kill();
      tweeningRef.current = false;
      ctx.revert();
      triggerRef.current = null;
    };
  }, [pinned, webgl, count, commit]);

  /** Select a project. While pinned this also scrolls to that project's slice of the pin. */
  const select = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(count - 1, index));
      commit(next);
      const trigger = triggerRef.current;
      if (!trigger) return;
      const top = trigger.start + ((trigger.end - trigger.start) * (next + 0.5)) / count;
      scrollTweenRef.current?.kill();
      tweeningRef.current = true;
      const proxy = { y: window.scrollY };
      scrollTweenRef.current = gsap.to(proxy, {
        y: top,
        duration: 0.9,
        ease: 'power2.inOut',
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete: () => {
          tweeningRef.current = false;
        },
      });
    },
    [count, commit]
  );

  const step = (delta: number) => select(activeRef.current + delta);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartRef.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (start === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(dx) >= SWIPE_DISTANCE) step(dx < 0 ? 1 : -1);
  };

  const current = projects[Math.min(active, Math.max(0, count - 1))];

  /* No WebGL (or nothing to show): the original stacked cards. */
  if (!webgl || count === 0) {
    return (
      <section id="projects" className="relative bg-background">
        <div className="px-6 pb-10 pt-24 text-center md:pb-12 md:pt-32">
          <SectionHeader className="mx-auto max-w-2xl" />
        </div>
        <div className="relative px-4 pb-4 sm:px-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:gap-10">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} total={count} className="w-full" />
            ))}
          </div>
        </div>
        <ShowMore onClick={() => navigate('/projects')} />
      </section>
    );
  }

  const progress = ((active + 1) / count) * 100;

  const controls = (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-5">
        <button type="button" onClick={() => step(-1)} disabled={active === 0} aria-label="Previous project" className={roundButton}>
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="h-[5px] w-[min(280px,38vw)] overflow-hidden rounded-full bg-foreground/10" aria-hidden="true">
          <div className="h-full rounded-full bg-[#1e4d3a] transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <button type="button" onClick={() => step(1)} disabled={active === count - 1} aria-label="Next project" className={roundButton}>
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-3 font-mono text-sm tabular-nums text-foreground" aria-live="polite">
        {pad(active + 1)} <span className="text-muted-foreground">/ {pad(count)}</span>
      </p>
    </div>
  );

  const island = (
    <div
      ref={islandRef}
      role="group"
      aria-label="Interactive 3D island of featured projects"
      className={cn('relative min-h-0 touch-pan-y', pinned ? 'h-full' : 'h-[300px] sm:h-[430px]')}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {everNear && (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center" role="status" aria-label="Loading 3D island">
              <div className="h-40 w-40 animate-pulse rounded-full bg-primary/10" />
            </div>
          }
        >
          <IslandScene plots={items} activeIndex={active} onSelect={select} visible={onScreen} reduced={reduced} compact={!desktop} />
        </Suspense>
      )}
    </div>
  );

  return (
    <section id="projects" ref={sectionRef} className="relative bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,hsl(var(--card)),transparent_68%)] opacity-90"
        aria-hidden="true"
      />

      <div
        ref={stageRef}
        className={cn('relative', pinned ? 'flex h-screen items-center px-10 pb-6 pt-[96px] xl:px-14' : 'px-4 pb-6 pt-20 sm:px-6 md:pt-28')}
      >
        <div
          className={cn(
            'mx-auto w-full max-w-[1500px]',
            pinned
              ? 'grid h-full max-h-[840px] grid-cols-[210px_minmax(0,1fr)_390px] grid-rows-[auto_minmax(0,1fr)_auto] gap-x-6 xl:grid-cols-[240px_minmax(0,1fr)_440px]'
              : 'flex flex-col gap-6 sm:gap-8'
          )}
        >
          <SectionHeader className={cn(pinned && 'col-span-2 row-start-1')} />

          {pinned ? (
            <>
              <div className="col-start-1 row-start-2 self-center">
                <ProjectNav items={items} active={active} onSelect={select} orientation="vertical" />
              </div>
              <div className="col-start-2 row-start-2 min-h-0">{island}</div>
              <div className="col-start-3 row-span-3 row-start-1 flex items-center">
                {current && <ProjectPanel project={current} className="w-full" />}
              </div>
              <div className="col-start-1 row-start-3 flex items-end gap-3 pb-1 text-sm text-muted-foreground">
                <Mouse className="h-9 w-9 shrink-0 text-foreground/70" strokeWidth={1.4} aria-hidden="true" />
                <span className="leading-snug">
                  Scroll or click a project
                  <br />
                  to explore
                </span>
              </div>
              <div className="col-start-2 row-start-3 pt-2">{controls}</div>
            </>
          ) : (
            <>
              {island}
              <ProjectNav items={items} active={active} onSelect={select} orientation="horizontal" />
              {current && <ProjectPanel project={current} className="mx-auto w-full max-w-[520px]" />}
              {controls}
            </>
          )}
        </div>
      </div>

      <ShowMore onClick={() => navigate('/projects')} />
    </section>
  );
};

const ShowMore = ({ onClick }: { onClick: () => void }) => (
  <div className="relative z-20 flex justify-center border-t border-border/20 bg-background py-16 md:py-24">
    <Button
      variant="outline"
      size="lg"
      className="rounded-full border-border/60 px-12 py-6 text-base font-medium transition-all duration-300 hover:bg-secondary/50 md:text-lg"
      onClick={onClick}
    >
      Show More
    </Button>
  </div>
);
