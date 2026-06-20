interface WaveDividerProps {
  flip?: boolean;
  variant?: 'wave1' | 'wave2' | 'wave3';
  className?: string;
  fillClass?: string;
}

export const WaveDivider = ({
  flip = false,
  variant = 'wave1',
  className = '',
  fillClass = 'fill-background',
}: WaveDividerProps) => {
  const waves: Record<string, JSX.Element> = {
    wave1: (
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={`w-full h-full ${fillClass}`}
      >
        <path d="M0,40 C120,80 240,0 360,40 C480,80 600,0 720,40 C840,80 960,0 1080,40 C1200,80 1320,0 1440,40 L1440,100 L0,100 Z" />
      </svg>
    ),
    wave2: (
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={`w-full h-full ${fillClass}`}
      >
        <path d="M0,60 C180,20 360,80 540,40 C720,0 900,60 1080,30 C1200,10 1320,50 1440,40 L1440,100 L0,100 Z" />
      </svg>
    ),
    wave3: (
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className={`w-full h-full ${fillClass}`}
      >
        <path d="M0,50 C200,90 400,10 600,50 C800,90 1000,10 1200,50 C1320,70 1380,30 1440,50 L1440,100 L0,100 Z" />
      </svg>
    ),
  };

  return (
    <div
      className={`relative w-full h-[60px] md:h-[80px] -mb-px overflow-hidden pointer-events-none select-none ${
        flip ? 'rotate-180' : ''
      } ${className}`}
      aria-hidden="true"
    >
      {waves[variant]}
    </div>
  );
};
