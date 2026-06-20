import { motion } from 'framer-motion';
import { Code2, Brain, Globe, Database } from 'lucide-react';
import {
  SiPython,
  SiGit,
  SiGithub,
  SiJupyter,
  SiFirebase,
  SiFigma,
  SiPostman,
  SiDocker,
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';

const serif = { fontFamily: '"Cormorant Garamond", serif' };

const categories = [
  {
    icon: Code2,
    title: 'Programming\nLanguages',
    items: [
      { name: 'Python', level: 5 },
      { name: 'Java', level: 4 },
      { name: 'C / C++', level: 3 },
      { name: 'SQL', level: 4 },
    ],
  },
  {
    icon: Brain,
    title: 'AI & Machine\nLearning',
    items: [
      { name: 'Machine Learning', level: 5 },
      { name: 'Deep Learning', level: 4 },
      { name: 'Data Analysis', level: 4 },
      { name: 'NLP', level: 3 },
    ],
  },
  {
    icon: Globe,
    title: 'Web\nDevelopment',
    items: [
      { name: 'HTML', level: 5 },
      { name: 'CSS', level: 5 },
      { name: 'JavaScript', level: 4 },
      { name: 'React', level: 4 },
      { name: 'Node.js', level: 3 },
    ],
  },
  {
    icon: Database,
    title: 'Databases &\nBackend',
    items: [
      { name: 'MySQL', level: 5 },
      { name: 'Firebase', level: 4 },
      { name: 'MongoDB', level: 4 },
      { name: 'REST APIs', level: 5 },
    ],
  },
];

const tools = [
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'Git', icon: SiGit, color: '#F05032' },
  { name: 'GitHub', icon: SiGithub, color: '#181717' },
  { name: 'VS Code', icon: VscVscode, color: '#007ACC' },
  { name: 'Jupyter', icon: SiJupyter, color: '#F37626' },
  { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
  { name: 'Docker', icon: SiDocker, color: '#2496ED' },
];

const Dots = ({ level }: { level: number }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < level ? 'bg-primary' : 'bg-primary/20'
        }`}
      />
    ))}
  </div>
);

export const Skills = () => {
  return (
    <section id="skills" className="relative py-24 overflow-hidden bg-secondary/40">
      {/* Decorative circle */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 pointer-events-none" />
      {/* Decorative dots */}
      <div
        className="absolute top-20 right-1/3 w-28 h-28 opacity-40 pointer-events-none hidden lg:block"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary)) 1.5px, transparent 1.5px)',
          backgroundSize: '12px 12px',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-14 items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm tracking-[0.25em] uppercase text-primary font-medium mb-4"
            >
              What I Do Best
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-7xl font-semibold text-foreground leading-none mb-6"
              style={serif}
            >
              My Skills
            </motion.h2>
            <div className="w-12 h-0.5 bg-primary/60 mb-6" />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-md leading-relaxed"
            >
              I work with a variety of technologies and tools to build intelligent
              systems, modern web applications and data-driven solutions.
            </motion.p>
          </div>

          {/* Icon badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden lg:flex justify-end"
          >
            <div className="w-28 h-28 rounded-3xl bg-card border border-border shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] flex items-center justify-center">
              <Brain className="w-12 h-12 text-primary" strokeWidth={1.5} />
            </div>
          </motion.div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-6 rounded-3xl bg-card border border-border shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] transition-shadow"
              >
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground whitespace-pre-line leading-tight">
                      {cat.title}
                    </h3>
                    <div className="w-8 h-0.5 bg-primary/60 mt-2" />
                  </div>
                </div>

                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {item.name}
                      </span>
                      <Dots level={item.level} />
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Tools & Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 md:p-8 rounded-3xl bg-card border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-foreground">Tools & Technologies</h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors">
                    <Icon className="w-7 h-7" style={{ color: tool.color }} />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {tool.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
