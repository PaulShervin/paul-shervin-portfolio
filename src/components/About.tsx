import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, GraduationCap, Rocket, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import demoData from '../data/demo-data.json';
import { HangingIDCard } from './HangingIDCard';

gsap.registerPlugin(ScrollTrigger);

export const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const elements = content.querySelectorAll('.animate-item');
    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  const stats = [
    { value: demoData.leetcode.problems_solved, label: 'Problems Solved', suffix: '+' },
    { value: demoData.projects.length,           label: 'AI Projects',     suffix: '+' },
    { value: demoData.hackathons.length,         label: 'Hackathons',      suffix: ''  },
    { value: demoData.certificates.length,       label: 'Certifications',  suffix: '+' },
  ];

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
      </div>

      <div ref={contentRef} className="container mx-auto px-6 relative z-10">
        {/*
          Two-column grid starts right at the top — the centred section header
          has been removed and moved into the right column. This makes the card's
          anchor peg sit at the same vertical level as the "Hello, I'm Paul" heading.
        */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">

          {/* ── Left: Hanging ID card ── */}
          <div className="lg:col-span-4 animate-item flex justify-center">
            <HangingIDCard />
          </div>

          {/* ── Right: heading + all content ── */}
          <div className="lg:col-span-8 space-y-6 pt-2">

            {/* Section header (was the centred block above the grid) */}
            <div className="animate-item">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5"
                whileHover={{ scale: 1.05 }}
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">About Me</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
                Hello, I'm{' '}
                <span className="text-gradient">{demoData.meta.name.split(' ')[0]}</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                {demoData.meta.tagline}
              </p>
            </div>

            {/* Bio */}
            <div className="animate-item">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Background</h3>
              </div>
              <p className="text-foreground/80 leading-relaxed">{demoData.about}</p>
            </div>

            {/* Stats grid */}
            <div className="animate-item grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(({ value, label, suffix }) => (
                <motion.div
                  key={label}
                  className="relative group p-4 rounded-xl bg-card border border-border text-center overflow-hidden"
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <motion.div
                      className="text-3xl md:text-4xl font-bold text-gradient mb-1"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {value}{suffix}
                    </motion.div>
                    <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* What I Do */}
            <div className="animate-item">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Rocket className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">What I Do</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {['Machine Learning', 'Deep Learning', 'Generative AI'].map((skill) => (
                  <motion.div
                    key={skill}
                    className="px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-center text-sm font-medium"
                    whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--primary)/0.1)' }}
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="animate-item flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 group"
              >
                <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Download Resume
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border hover:bg-muted group"
                onClick={() => {
                  document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Projects
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
