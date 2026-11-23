type TerminalBlock = {
  command: string;
  output: string[];
  bulleted?: boolean;
};

const terminalBlocks: TerminalBlock[] = [
  { command: 'whoami', output: ['Paul Shervin'] },
  { command: 'role', output: ['AI/ML Engineer | Full-Stack Developer'] },
  { command: 'education', output: ['B.Tech AI & ML @ Saveetha Engineering College'] },
  {
    command: 'current_focus',
    bulleted: true,
    output: [
      'Building AI products',
      'Hackathons & competitions',
      'Open-source contributions',
      'Learning and growing',
    ],
  },
  { command: 'mission', output: ['"Learn with purpose, build with progress."'] },
];

const REVEAL_START_SECONDS = 0.5;
const REVEAL_STEP_SECONDS = 0.11;

/** Sequential line reveal; disabled automatically under prefers-reduced-motion. */
const revealClass = 'animate-fade-in fill-mode-both motion-reduce:animate-none';
const revealDelay = (index: number) => ({
  animationDelay: `${REVEAL_START_SECONDS + index * REVEAL_STEP_SECONDS}s`,
});

const countLines = (blocks: TerminalBlock[]) =>
  blocks.reduce((count, block) => count + 1 + block.output.length, 0);

/** Index of each block's command line within the flattened line sequence. */
const blockStartIndex = terminalBlocks.map((_, i) => countLines(terminalBlocks.slice(0, i)));
const totalLines = countLines(terminalBlocks);

/**
 * Visual-only developer terminal for the hero. It renders static content and
 * never executes anything.
 */
export const HeroTerminal = ({ className = '' }: { className?: string }) => {
  return (
    <div
      aria-label="Terminal-style summary of Paul Shervin"
      className={`flex flex-col overflow-hidden rounded-2xl bg-[#0c1718] text-zinc-200 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10 ${className}`}
      /* Type scales with the composition box (cqw); falls back to the viewport width on mobile. */
      style={{ fontSize: 'clamp(11.5px, 1.75cqw, 14px)' }}
    >
      {/* Title bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#132021] px-4 py-1.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-[0.92em] tracking-wide text-zinc-300">paul@portfolio:~</span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-3.5 py-2.5 font-mono leading-[1.6]">
        <div className="space-y-[5px]">
          {terminalBlocks.map((block, blockIdx) => (
            <div key={block.command}>
              <div className={revealClass} style={revealDelay(blockStartIndex[blockIdx])}>
                <span className="text-emerald-400">&gt; </span>
                <span className="text-emerald-400">{block.command}</span>
              </div>
              {block.output.map((line, lineIdx) => (
                <div
                  key={line}
                  className={`whitespace-pre-wrap break-words pl-3 ${revealClass}`}
                  style={revealDelay(blockStartIndex[blockIdx] + 1 + lineIdx)}
                >
                  {block.bulleted && <span className="text-emerald-400/70">→ </span>}
                  <span className="text-zinc-100/90">{line}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Idle prompt: pinned to the bottom of the panel when the terminal has a fixed height */}
        <div className={`mt-3 flex items-center md:mt-auto ${revealClass}`} style={revealDelay(totalLines)}>
          <span className="text-emerald-400">paul@portfolio</span>
          <span className="text-zinc-400">:~$</span>
          <span
            aria-hidden="true"
            className="ml-2 inline-block h-[1.1em] w-[0.55em] bg-emerald-400 animate-[blink_1s_steps(1)_infinite] motion-reduce:animate-none"
          />
        </div>
      </div>
    </div>
  );
};
