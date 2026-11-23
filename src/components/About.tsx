import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Award, Code2, GraduationCap, Layers, Mail, Sparkles, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { AboutIDCard } from './AboutIDCard';
import { AboutFace, GitHubFace, LeetCodeFace, LinkedInFace } from './about/cardFaces';
import { CARD_THEMES, nextFace, type CardFace } from './about/cardTheme';
import { LeetCodeDetails } from './about/LeetCodePanel';
import { GitHubDetails } from './about/GitHubPanel';
import { LinkedInDetails } from './about/LinkedInPanel';
import { IDCardMascot } from './about/IDCardMascot';
import { DEFAULT_GITHUB_USERNAME, DEFAULT_LEETCODE_USERNAME, usernameFromUrl } from '@/lib/socialUsernames';
import demoData from '@/data/demo-data.json';

gsap.registerPlugin(ScrollTrigger);

const mono = { fontFamily: '"JetBrains Mono", "Courier New", monospace' };

const scrollToSection = (href: string) => {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
};

const panelMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35 },
};

export const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [face, setFace] = useState<CardFace>('about');
  const theme = CARD_THEMES[face];
  const isDark = theme.dark;

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = content.querySelectorAll('.animate-item');
    const tween = gsap.fromTo(
      elements,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none reverse' },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const { profileQuery, projectsQuery, hackathonsQuery, certificationsQuery } = usePortfolioData();
  const profile = profileQuery.data;

  const name = profile?.name || demoData.meta.name;
  const firstName = name.split(' ')[0];
  const role = profile?.role || demoData.meta.role;
  const location = profile?.location || demoData.meta.location;
  const tagline = profile?.tagline || demoData.meta.tagline;
  const aboutBio = profile?.about || demoData.about;
  const socials = profile?.socials || demoData.socials;
  const leetcode = profile?.leetcode || demoData.leetcode;
  const leetcodeUsername = usernameFromUrl(socials.leetcode, DEFAULT_LEETCODE_USERNAME);
  const githubUsername = usernameFromUrl(socials.github, DEFAULT_GITHUB_USERNAME);

  const stats = [
    { icon: Code2, value: `${leetcode.problems_solved || 247}+`, label: 'Problems Solved' },
    { icon: Layers, value: `${projectsQuery.data?.length || 4}+`, label: 'AI Projects' },
    { icon: Trophy, value: `${hackathonsQuery.data?.length || 5}`, label: 'Hackathons' },
    { icon: Award, value: `${certificationsQuery.data?.length || 4}+`, label: 'Certifications' },
  ];

  const cardFace = {
    about: <AboutFace name={name} role={role} location={location} socials={socials} leetcode={leetcode} />,
    leetcode: <LeetCodeFace username={leetcodeUsername} profileUrl={socials.leetcode} />,
    github: <GitHubFace username={githubUsername} profileUrl={socials.github} />,
    linkedin: <LinkedInFace name={name} role={role} location={location} profileUrl={socials.linkedin} />,
  }[face];

  return (
    <section
      id="about"
      ref={sectionRef}
      data-face={face}
      className={`relative overflow-hidden py-20 transition-colors duration-700 md:py-24 ${isDark ? 'bg-[#0a0a0b]' : 'bg-background'}`}
    >
      {/* Subtle dotted texture */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className={`absolute inset-0 [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] ${
            isDark
              ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)]'
              : 'bg-[radial-gradient(circle,hsl(var(--foreground)/0.07)_1px,transparent_1px)]'
          }`}
        />
      </div>

      <div ref={contentRef} className="container relative z-10 mx-auto px-6">
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* ── Left: flipping ID card + mascot ── */}
          <div className="animate-item relative z-20 flex flex-col items-center lg:col-span-4 lg:items-start">
            <div className="relative w-full max-w-[360px]">
              <AboutIDCard name={name} theme={theme} faceKey={face} onFlip={() => setFace(nextFace(face))}>
                {cardFace}
              </AboutIDCard>
              {/* Mascot reads the same `face` state that drives the card and previews the next face's logo.
                  Wide screens: beside the card's lower-left edge. Narrower: beside the lanyard, above the card. */}
              <IDCardMascot
                face={face}
                initial={firstName.charAt(0).toUpperCase()}
                className="left-0 top-4 min-[1440px]:-left-[88px] min-[1440px]:bottom-10 min-[1440px]:top-auto"
              />
            </div>
          </div>

          {/* ── Right: content follows the card face ── */}
          <div className="min-w-0 lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              {face === 'leetcode' && (
                <motion.div key="leetcode" {...panelMotion}>
                  <LeetCodeDetails username={leetcodeUsername} profileUrl={socials.leetcode} />
                </motion.div>
              )}
              {face === 'github' && (
                <motion.div key="github" {...panelMotion}>
                  <GitHubDetails username={githubUsername} profileUrl={socials.github} />
                </motion.div>
              )}
              {face === 'linkedin' && (
                <motion.div key="linkedin" {...panelMotion}>
                  <LinkedInDetails name={name} role={role} profileUrl={socials.linkedin} />
                </motion.div>
              )}
              {face === 'about' && (
                <motion.div key="about" {...panelMotion}>
                  <div className="animate-item">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                      About Me
                    </div>
                    <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                      Hello, I’m <span className="text-primary">{firstName}</span>
                    </h2>
                    <p className="mt-3 text-lg text-foreground/70 md:text-xl">{tagline}</p>
                  </div>

                  <div className="animate-item mt-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <GraduationCap className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Background</h3>
                    </div>
                    <p className="mt-4 max-w-[64ch] text-[15px] leading-[1.85] text-foreground/75 md:text-base">{aboutBio}</p>
                  </div>

                  <dl className="animate-item mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map(({ icon: Icon, value, label }) => (
                      <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_10px_-6px_rgba(30,58,44,0.18)]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <dd className="mt-4 text-3xl font-bold leading-none text-foreground">{value}</dd>
                        <dt className="mt-2 text-sm text-muted-foreground">{label}</dt>
                      </div>
                    ))}
                  </dl>

                  <div className="animate-item mt-8 flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      onClick={() => scrollToSection('#projects')}
                      className="h-12 rounded-xl bg-[#1e4d3a] px-6 text-base font-medium text-white shadow-[0_10px_24px_-12px_rgba(30,77,58,0.7)] hover:bg-[#173d2e]"
                    >
                      <Sparkles className="mr-1 h-4 w-4" aria-hidden="true" />
                      My Favorite Works
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => scrollToSection('#contact')}
                      className="h-12 rounded-xl border-border bg-card px-6 text-base font-medium shadow-sm hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      <Mail className="mr-1 h-4 w-4 text-primary" aria-hidden="true" />
                      Contact Me
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Handwritten-style annotation, desktop only, About face only */}
          {face === 'about' && (
            <div
              className="pointer-events-none absolute right-0 top-10 hidden select-none leading-[1.55] text-primary xl:block"
              style={{ ...mono, fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}
              aria-hidden="true"
            >
              <span className="block">Build</span>
              <span className="block">Learn</span>
              <span className="block">Iterate</span>
              <span className="block">→ Grow</span>
              <svg viewBox="0 0 40 44" className="ml-3 mt-1 h-11 w-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M34 2c6 14 2 28-18 38" />
                <path d="M24 32l-8 8 11 1" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
