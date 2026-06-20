import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ArrowRight, Download, Sparkles, Code2, Brain, Wand2, Database, Flame } from 'lucide-react';
import { SiPython, SiTensorflow } from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import { Button } from './ui/button';
import demoData from '../data/demo-data.json';
import portrait from '@/assets/hero-main.jpg';

const serif = { fontFamily: '"Cormorant Garamond", serif' };

const scrollToSection = (href: string) => {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
};

const typewriterPhrases = [
  'Building Intelligent Digital Experiences with AI.',
  'Solving Real-World Problems with Deep Learning.',
  'Creating the Future with Generative AI.',
  'Engineering Agentic AI Systems.',
];

const useTypewriter = (phrases: string[], typingSpeed = 60, deletingSpeed = 35, pauseTime = 2000) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState('');

  const tick = useCallback(() => {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      setDisplayText(currentPhrase.substring(0, charIndex + 1));
      setCharIndex((prev) => prev + 1);

      if (charIndex + 1 === currentPhrase.length) {
        setTimeout(() => setIsDeleting(true), pauseTime);
        return;
      }
    } else {
      setDisplayText(currentPhrase.substring(0, charIndex - 1));
      setCharIndex((prev) => prev - 1);

      if (charIndex - 1 === 0) {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        return;
      }
    }
  }, [phrases, phraseIndex, charIndex, isDeleting, pauseTime]);

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, typingSpeed, deletingSpeed]);

  return displayText;
};

const FloatingCard = ({
  icon: Icon,
  title,
  text,
  className,
  delay,
}: {
  icon: any;
  title: string;
  text: string;
  className?: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className={`absolute hidden md:block w-56 lg:w-64 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] ${className}`}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
      className="flex items-start gap-3"
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
        <div className="w-8 h-0.5 bg-primary/60 mt-2" />
      </div>
    </motion.div>
  </motion.div>
);



const TechPill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground/80 hover:border-primary/50 transition-colors">
    <span className="text-primary">{icon}</span>
    {label}
  </div>
);

export const Hero = () => {
  const typedText = useTypewriter(typewriterPhrases, 60, 35, 2000);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-background pt-24 pb-12">
      {/* Soft warm background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* LEFT */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 text-primary text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Available for Collaboration
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="leading-[0.9] mb-8"
              style={serif}
            >
              <span className="block text-6xl md:text-7xl lg:text-8xl font-semibold text-foreground tracking-tight">
                PAUL
              </span>
              <span className="block text-6xl md:text-7xl lg:text-8xl font-semibold text-primary tracking-tight">
                SHERVIN
              </span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl lg:text-3xl font-medium text-foreground mb-5 min-h-[4rem] md:min-h-[4.5rem]"
            >
              <span>{typedText}</span>
              <span className="inline-block w-[3px] h-[1.1em] bg-primary ml-1 align-middle animate-[blink_0.8s_ease-in-out_infinite]" />
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base text-muted-foreground max-w-md mb-8 border-l-2 border-primary/40 pl-4"
            >
              AI &amp; ML student passionate about building innovative solutions that solve real-world problems and create meaningful impact.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <Button
                size="lg"
                onClick={() => scrollToSection('#projects')}
                className="bg-primary hover:bg-accent text-primary-foreground rounded-xl px-7 shadow-[var(--shadow-elegant)]"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Projects
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('#contact')}
                className="rounded-xl px-7 border-primary/40 text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -4 }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-shervin-ai'));
              }}
              className="group max-w-xl mb-8 p-5 rounded-[20px] bg-card/80 border border-border/60
                shadow-[0_4px_20px_-6px_hsl(var(--primary)/0.12)]
                hover:shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.3)]
                hover:border-primary/30
                cursor-pointer transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors duration-300">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Ask Shervin AI
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Explore my journey, projects, skills, certifications and achievements through an interactive experience.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-accent text-primary-foreground rounded-xl px-5 shadow-sm group-hover:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.4)] transition-shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('open-shervin-ai'));
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Start Exploring
                </Button>
                <span className="text-xs text-muted-foreground/60 group-hover:text-primary/50 transition-colors">
                  Fully interactive ✨
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="text-sm font-medium text-foreground mr-2">Tech Stack</span>
              <TechPill icon={<SiPython className="w-4 h-4" />} label="Python" />
              <TechPill icon={<Brain className="w-4 h-4" />} label="Machine Learning" />
              <TechPill icon={<SiTensorflow className="w-4 h-4" />} label="Deep Learning" />
              <TechPill icon={<FaJava className="w-4 h-4" />} label="Java" />
              <TechPill icon={<Database className="w-4 h-4" />} label="SQL" />
              <TechPill icon={<Flame className="w-4 h-4" />} label="Firebase" />
            </motion.div>
          </div>

          {/* RIGHT — portrait + floating cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[560px] lg:h-[640px] hidden lg:block lg:-mt-24"
          >
            {/* organic blob */}
            <div className="absolute inset-6 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-primary/10" />
            {/* dotted decoration */}
            <div
              className="absolute top-8 left-8 w-24 h-24 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(hsl(var(--primary)) 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />

            {/* portrait frame */}
            <div className="absolute inset-12 rounded-[2rem] overflow-hidden bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
              <img
                src={portrait}
                alt="Paul Shervin portrait"
                className="w-full h-full object-cover"
                width={1024}
                height={1024}
              />
            </div>

            {/* dashed curve */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 600" fill="none">
              <path
                d="M 80 320 Q 140 240 200 290 T 320 340"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                fill="none"
                opacity="0.5"
              />
              <circle cx="320" cy="340" r="4" fill="hsl(var(--primary))" />
            </svg>

            <FloatingCard
              icon={Brain}
              title="Machine Learning"
              text="Building models that learn and improve."
              className="top-4 right-0"
              delay={0.6}
            />
            <FloatingCard
              icon={Code2}
              title="Web Development"
              text="Crafting responsive and user-friendly web apps."
              className="top-1/2 -left-4 -translate-y-1/2"
              delay={0.8}
            />
            <FloatingCard
              icon={Wand2}
              title="Generative AI"
              text="Exploring the power of generative models."
              className="bottom-8 right-0"
              delay={1}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
        onClick={() => scrollToSection('#about')}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-card/60"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
        <span className="text-xs text-muted-foreground">Scroll Down</span>
      </motion.div>
    </section>
  );
};
