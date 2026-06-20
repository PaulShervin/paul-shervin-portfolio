import { useEffect, useState } from 'react';
import { setupSmoothScroll } from '@/utils/smoothScroll';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CustomCursor } from '@/components/CustomCursor';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { WaveDivider } from '@/components/WaveDivider';
import { About } from '@/components/About';
import { Skills } from '@/components/Skills';
import { Projects } from '@/components/Projects';
import { Hackathons } from '@/components/Hackathons';
import { Achievements } from '@/components/Achievements';
import { Badges } from '@/components/Badges';
import { Certificates } from '@/components/Certificates';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { ShervinAI, ShervinAIBubble } from '@/components/ShervinAI';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  return (
    <ThemeProvider defaultTheme="light">
      <div className="relative min-h-screen cursor-none">
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main>
          <Hero />

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
          {/* Badges (bg-background) → Certificates (bg-muted/20) */}
          <WaveDivider variant="wave2" className="bg-background" fillClass="fill-[hsl(var(--muted)/0.2)]" />

          <Certificates />
          {/* Certificates (bg-muted/20) → Contact (bg-background) */}
          <WaveDivider variant="wave3" className="bg-[hsl(var(--muted)/0.2)]" fillClass="fill-background" />

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
