import { useEffect, useState, useMemo, useCallback } from 'react';
import { setupSmoothScroll } from '@/utils/smoothScroll';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CustomCursor } from '@/components/CustomCursor';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { RibbonShowcase } from '@/components/RibbonShowcase';
import { WaveDivider } from '@/components/WaveDivider';
import { About } from '@/components/About';
import { Skills } from '@/components/Skills';
import { Projects } from '@/components/Projects';
import { Hackathons } from '@/components/Hackathons';
import { Achievements } from '@/components/Achievements';
import { Badges } from '@/components/Badges';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { ShervinAI, ShervinAIBubble } from '@/components/ShervinAI';
import { WelcomeIntro } from '@/components/WelcomeIntro';

/**
 * Determines whether the intro video should play:
 * - Respects prefers-reduced-motion (skip intro)
 * - Checks sessionStorage for previous playback
 * - Supports ?intro=true URL param to force replay (dev mode)
 */
const shouldShowIntro = (): boolean => {
  // Respect prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // Dev override: ?intro=true forces replay
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('intro') === 'true') {
    return true;
  }

  // Check sessionStorage
  const introPlayed = sessionStorage.getItem('portfolioIntroPlayed');
  return !introPlayed;
};

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const showIntro = useMemo(() => shouldShowIntro(), []);
  const [introActive, setIntroActive] = useState(showIntro);

  useEffect(() => {
    const lenis = setupSmoothScroll();
    
    return () => {
      lenis.destroy();
    };
  }, []);

  // Listen for the custom event from the Hero card
  useEffect(() => {
    const handleOpen = () => setIsChatOpen(true);
    window.addEventListener('open-shervin-ai', handleOpen);
    return () => window.removeEventListener('open-shervin-ai', handleOpen);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroActive(false);
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="relative min-h-screen cursor-none">
        {/* Welcome Intro Video Overlay */}
        {introActive && <WelcomeIntro onIntroComplete={handleIntroComplete} />}

        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main>
          <Hero />

          <RibbonShowcase />

          <About />
          {/* About (bg-background) → Skills (bg-secondary/40) */}
          <WaveDivider variant="wave1" className="bg-background" fillClass="fill-[hsl(var(--secondary)/0.4)]" />

          <Skills />
          {/* Skills (bg-secondary/40) → Projects (bg-background) */}
          <WaveDivider variant="wave2" className="bg-[hsl(var(--secondary)/0.4)]" fillClass="fill-background" />

          <Projects />
          {/* Projects (bg-background) → Hackathons (bg-background) */}
          <WaveDivider variant="wave3" className="bg-background" fillClass="fill-background" />

          <Hackathons />

          <Achievements />
          {/* Achievements (bg-background) → Badges (bg-background) */}
          <WaveDivider variant="wave1" className="bg-background" fillClass="fill-background" />

          <Badges />
          {/* Badges (bg-background) → Contact (bg-background) */}
          <WaveDivider variant="wave2" className="bg-background" fillClass="fill-background" />

          <Contact />
        </main>
        <Footer />

        {/* Shervin AI — floating bubble + drawer */}
        <ShervinAIBubble onClick={() => setIsChatOpen(true)} />
        <ShervinAI isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </ThemeProvider>
  );
};

export default Index;

