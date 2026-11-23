import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download, Terminal } from 'lucide-react';
import { Button } from './ui/button';
import { HeroTerminal } from './HeroTerminal';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import foreground from '@/assets/hero-foreground.webp';

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

const FALLBACK_RESUME_URL = '/resume.pdf';

const scrollToSection = (href: string) => {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
};

const badgeItems = ['AI/ML Engineer', 'Builder', 'Problem Solver'];

export const Hero = () => {
  const reduceMotion = useReducedMotion();
  const { profileQuery } = usePortfolioData();
  const resumeUrl = profileQuery.data?.resumeUrl || FALLBACK_RESUME_URL;

  const enter = (delay: number, x = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18, x },
    animate: { opacity: 1, y: 0, x: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background pt-24 pb-14 md:pt-28 min-[1100px]:pt-[6.5rem] min-[1100px]:pb-16"
    >
      {/* Subtle dotted technical grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--foreground)/0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      <div className="container relative z-10 mx-auto w-full px-6">
        {/* Two-column hero grid above 1100px: 0.9fr intro / 1.1fr composition */}
        <div className="grid grid-cols-1 items-center gap-10 min-[1100px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] min-[1100px]:gap-[clamp(2rem,4vw,4rem)]">
          {/* ── Left: introduction ── */}
          <motion.div {...enter(0.05)} className="min-w-0">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              {badgeItems.map((item, i) => (
                <span key={item} className="flex items-center gap-2">
                  {i > 0 && <span className="text-muted-foreground/70" aria-hidden="true">·</span>}
                  {item}
                </span>
              ))}
            </div>

            <h1
              className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[2.9rem] xl:text-[3.4rem]"
              style={mono}
            >
              <span className="block text-foreground">Hi, I’m</span>
              <span className="mt-1 block text-primary">
                Paul Shervin
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] bg-foreground/70 animate-[blink_1s_steps(1)_infinite] motion-reduce:animate-none"
                />
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/80 sm:text-lg xl:text-xl" style={mono}>
              Solving real-world problems with <span className="text-primary">AI, ML</span> and{' '}
              <span className="text-primary">full-stack development</span>.
            </p>

            <div className="mt-4 max-w-lg space-y-1 text-sm leading-relaxed text-foreground/65" style={mono}>
              <p>B.Tech AI &amp; ML @ Saveetha Engineering College</p>
              <p>Building AI products, participating in hackathons, and contributing to open source.</p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => scrollToSection('#projects')}
                className="h-12 rounded-xl bg-foreground px-5 text-base xl:px-6 font-medium text-background shadow-[0_0_0_3px_hsl(var(--primary)/0.28),0_10px_24px_-12px_hsl(var(--primary)/0.6)] transition-all hover:-translate-y-0.5 hover:bg-foreground/90"
              >
                <Terminal className="mr-1 h-4 w-4 text-primary-glow" />
                View Projects
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open(resumeUrl, '_blank', 'noopener,noreferrer')}
                className="h-12 rounded-xl border-border bg-card px-5 text-base xl:px-6 font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
              >
                <Download className="mr-1 h-4 w-4 text-primary" />
                Download Resume
              </Button>
            </div>
          </motion.div>

          {/* ── Right: layered portrait + terminal + laptop composition ── */}
          <motion.div {...enter(0.2, 16)} className="min-w-0 min-[1100px]:-mr-6">
            {/*
              Composition box. Below md it is a plain stacking context (mobile portrait
              panel, then the terminal). From md up it becomes a fixed-aspect box and every
              layer is absolutely positioned inside it, in percentages, so the overlap
              geometry is identical at every width:
                z-0  emerald glow            z-[1] mint panel        z-[2] annotation
                z-10 terminal (HTML)         z-20 cut-out foreground (person, laptop, desk)
              The foreground is cut from the reference artwork; where the shoulder and
              laptop crossed the terminal those pixels are transparent, so the terminal
              must span from the top of the box down to the desk line (bottom-[8%]).
              Terminal type scales with the box via container-query units (cqw).
            */}
            <div className="relative mx-auto w-full max-w-[820px] [container-type:inline-size] md:aspect-[1/0.72] min-[1100px]:aspect-[1/0.78] xl:aspect-[1/0.72]">
              {/* z-0: restrained emerald glow behind the composition */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-6 z-0 hidden h-64 rounded-full bg-primary/30 blur-3xl md:left-[42%] md:right-[2%] md:top-[10%] md:bottom-[10%] md:block md:h-auto"
              />

              {/* z-1: pale mint panel with a dotted texture, behind the portrait */}
              <div
                aria-hidden="true"
                className="absolute left-[59%] right-[1%] top-[18%] bottom-[9.5%] z-[1] hidden rounded-[2rem] min-[1100px]:left-[59%] min-[1100px]:right-[2%] min-[1100px]:top-[26%] min-[1100px]:bottom-[8.5%] xl:left-[59%] xl:right-[1%] xl:top-[18%] xl:bottom-[9.5%] bg-emerald-100 [background-image:radial-gradient(circle,hsl(var(--primary)/0.28)_1px,transparent_1px)] [background-size:18px_18px] shadow-[var(--shadow-elegant)] dark:bg-emerald-900/40 md:block"
              />

              {/* z-2: handwritten-style annotation beside the portrait */}
              <div
                className="absolute right-[1%] top-[25%] z-[2] hidden select-none min-[1100px]:right-[2%] min-[1100px]:top-[28%] xl:right-[1%] xl:top-[25%] leading-[1.55] text-primary md:block"
                style={{ ...mono, fontSize: 'clamp(11px, 1.7cqw, 14px)', fontStyle: 'italic', fontWeight: 500 }}
              >
                <span className="block">Build</span>
                <span className="block">Learn</span>
                <span className="block">Iterate</span>
                <span className="block">→ Grow</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 40 44"
                  className="mt-1 ml-3 h-[3.4em] w-[3.1em]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M34 2c6 14 2 28-18 38" />
                  <path d="M24 32l-8 8 11 1" />
                </svg>
              </div>

              {/* Mobile-only portrait panel (stacked above the terminal) */}
              <div className="relative h-80 overflow-hidden rounded-3xl bg-emerald-100 [background-image:radial-gradient(circle,hsl(var(--primary)/0.28)_1px,transparent_1px)] [background-size:18px_18px] shadow-[var(--shadow-elegant)] dark:bg-emerald-900/40 md:hidden">
                <img
                  src={foreground}
                  alt="Paul Shervin at his desk with a laptop"
                  className="absolute bottom-0 left-1/2 h-[94%] w-auto max-w-none -translate-x-1/2"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* z-10: terminal (HTML, visual only) */}
              <HeroTerminal className="relative z-10 mt-4 md:absolute md:left-0 md:top-[4%] md:bottom-[8%] md:mt-0 md:w-[60%]" />

              {/* z-20: cut-out foreground — person, laptop and desk in front of the terminal */}
              <img
                src={foreground}
                alt="Paul Shervin at his desk with a laptop"
                className="pointer-events-none absolute bottom-0 z-20 hidden h-[86%] w-auto max-w-none -right-[5%] min-[1100px]:-right-[4%] min-[1100px]:h-[78%] xl:-right-[5%] xl:h-[86%] [mask-image:linear-gradient(to_bottom,black_82%,transparent_100%),linear-gradient(to_right,black_95%,transparent_100%)] [mask-composite:intersect] [-webkit-mask-composite:source-in] md:block"
                loading="eager"
                decoding="async"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
