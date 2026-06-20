import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
        backgroundSize: '200% 100%',
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 blur-sm opacity-70"
        style={{
          background: 'inherit',
        }}
      />
    </motion.div>
  );
};
