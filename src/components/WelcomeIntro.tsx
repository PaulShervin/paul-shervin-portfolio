import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';

interface WelcomeIntroProps {
  onIntroComplete: () => void;
}

/**
 * Full-screen welcome intro video overlay.
 *
 * Flow:
 *   VIDEO → cinematic golden wash → fade out → reveal existing hero underneath.
 *
 * The overlay sits on top of the already-rendered portfolio at z-index 99999.
 * Hero elements are rendered normally underneath; Framer Motion handles their own
 * entrance animations. When the overlay fades, we add a subtle GSAP stagger on
 * the hero children so the reveal feels alive — but we never reset or recreate
 * the hero layout.
 */
export const WelcomeIntro = ({ onIntroComplete }: WelcomeIntroProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lightWashRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const hasTransitionStarted = useRef(false);
  const [isVisible, setIsVisible] = useState(true);

  /* ─── Lock scrolling while intro is active ─── */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const originalPosition = document.body.style.position;
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
    };
  }, []);

  /* ─── Cinematic exit transition using GSAP ─── */
  const runExitTransition = useCallback(() => {
    if (hasTransitionStarted.current) return;
    hasTransitionStarted.current = true;

    const video = videoRef.current;
    const overlay = overlayRef.current;
    const lightWash = lightWashRef.current;
    const skipBtn = skipBtnRef.current;

    if (!overlay || !video || !lightWash) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.width = '';
        window.scrollTo(0, 0);

        // Cleanup video to free memory
        video.pause();
        video.removeAttribute('src');
        video.load();

        // Mark as played AFTER successful completion
        sessionStorage.setItem('portfolioIntroPlayed', 'true');

        // Remove overlay from DOM entirely
        setIsVisible(false);
        onIntroComplete();
      },
    });

    // ────────────────────────────────────────────
    // Phase 1 (0 – 0.4s): Golden light wash fades in
    // ────────────────────────────────────────────
    tl.to(
      lightWash,
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.inOut',
      },
      0
    );

    // ────────────────────────────────────────────
    // Phase 2 (0 – 0.8s): Video scales up slightly, blurs, and fades
    // ────────────────────────────────────────────
    tl.to(
      video,
      {
        scale: 1.03,
        filter: 'blur(8px)',
        opacity: 0.2,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      0
    );

    // ────────────────────────────────────────────
    // Phase 3 (0 – 0.3s): Skip button fades out
    // ────────────────────────────────────────────
    if (skipBtn) {
      tl.to(
        skipBtn,
        {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.3,
          ease: 'power2.out',
        },
        0
      );
    }

    // ────────────────────────────────────────────
    // Phase 4 (0.35 – 0.85s): Entire overlay fades to transparent
    // ────────────────────────────────────────────
    tl.to(
      overlay,
      {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0.35
    );

    // ────────────────────────────────────────────
    // Phase 5: Subtle hero reveal stagger (elements are already
    // rendered and visible underneath — this adds a polish pop)
    // ────────────────────────────────────────────
    const heroSection = document.getElementById('home');
    if (heroSection) {
      // Get the main content container within the hero
      const heroContainer = heroSection.querySelector('.container');
      if (heroContainer) {
        // Collect all direct-ish hero children for staggered reveal
        const heroElements = heroContainer.querySelectorAll(
          ':scope > div > div > *'
        );

        if (heroElements.length > 0) {
          // Temporarily set them to slightly below and transparent
          gsap.set(heroElements, {
            opacity: 0,
            y: 12,
          });

          tl.to(
            heroElements,
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.06,
              ease: 'power2.out',
            },
            0.3
          );
        }
      }

      // Portrait / right column (desktop only)
      const rightColumn = heroSection.querySelector(
        '.relative.hidden.lg\\:block'
      );
      if (rightColumn) {
        gsap.set(rightColumn, { opacity: 0, scale: 0.97 });
        tl.to(
          rightColumn,
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
          },
          0.35
        );
      }

      // Scroll indicator at the bottom
      const scrollIndicator = heroSection.querySelector('.absolute.bottom-6');
      if (scrollIndicator) {
        gsap.set(scrollIndicator, { opacity: 0 });
        tl.to(
          scrollIndicator,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          },
          0.6
        );
      }
    }

    // Navbar reveal
    const navbar = document.querySelector('nav');
    if (navbar) {
      gsap.set(navbar, { opacity: 0, y: -10 });
      tl.to(
        navbar,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        0.25
      );
    }
  }, [onIntroComplete]);

  /* ─── Video event listeners ─── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!video.duration || isNaN(video.duration) || hasTransitionStarted.current) return;

      const transitionStart = video.duration - 0.9;
      if (video.currentTime >= transitionStart) {
        runExitTransition();
      }
    };

    const handleEnded = () => {
      // Safety fallback — ensures transition fires even if timeupdate missed
      runExitTransition();
    };

    const handleError = () => {
      // If video fails to load, skip intro gracefully
      console.warn('WelcomeIntro: video failed to load, skipping intro.');
      runExitTransition();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Attempt autoplay (muted videos are allowed by all browsers)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay was prevented — user can still click Skip Intro
      });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [runExitTransition]);

  /* ─── Skip Intro handler ─── */
  const handleSkip = useCallback(() => {
    runExitTransition();
  }, [runExitTransition]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="welcome-intro-overlay"
      aria-live="polite"
      aria-label="Portfolio intro video"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Intro Video */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          transformOrigin: 'center center',
        }}
      >
        <source src="/portfolio video.mp4" type="video/mp4" />
      </video>

      {/* Golden / cream light wash (becomes visible during exit) */}
      <div
        ref={lightWashRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at center, hsla(152, 28%, 40%, 0.35) 0%, hsla(75, 20%, 95%, 0.3) 45%, hsla(16, 50%, 52%, 0.12) 100%)',
          opacity: 0,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Skip Intro — minimal, portfolio-themed button */}
      <button
        ref={skipBtnRef}
        onClick={handleSkip}
        aria-label="Skip intro video"
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3,
          padding: '0.5rem 1.25rem',
          fontSize: '0.8125rem',
          fontFamily: "'Karla', sans-serif",
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: 'hsl(152, 28%, 92%)',
          backgroundColor: 'rgba(10, 10, 10, 0.5)',
          border: '1px solid hsla(152, 28%, 40%, 0.4)',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'all 0.25s ease',
          textTransform: 'uppercase' as const,
        }}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          t.style.backgroundColor = 'rgba(74, 139, 111, 0.2)';
          t.style.borderColor = 'hsla(152, 28%, 40%, 0.7)';
          t.style.color = 'hsl(75, 20%, 96%)';
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.backgroundColor = 'rgba(10, 10, 10, 0.5)';
          t.style.borderColor = 'hsla(152, 28%, 40%, 0.4)';
          t.style.color = 'hsl(75, 20%, 92%)';
        }}
      >
        Skip Intro
      </button>
    </div>
  );
};
