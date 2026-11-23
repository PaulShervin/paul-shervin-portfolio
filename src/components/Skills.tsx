import { motion } from 'framer-motion';

import { usePortfolioData, type SkillCategory } from '@/hooks/usePortfolioData';
import { SkillCardDeck } from './skills/SkillCardDeck';
import { ToolsMarquee } from './skills/ToolsMarquee';
import { TOOLS, getCategoryMeta } from './skills/skillsMeta';

const serif = { fontFamily: '"Cormorant Garamond", serif' };

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay },
});

export const Skills = () => {
  const { skillsQuery } = usePortfolioData();
  const rawCategories = (skillsQuery.data ?? []) as SkillCategory[];

  const displayCategories = rawCategories.map(cat => ({
    title: cat.category,
    meta: getCategoryMeta(cat.category),
    items: cat.items.map(item => ({ name: item.name })),
  }));

  const totalSkills = displayCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const stats = [
    { label: 'Categories', value: displayCategories.length },
    { label: 'Skills', value: totalSkills },
    { label: 'Tools', value: TOOLS.length },
  ];

  return (
    <section id="skills" className="relative overflow-hidden bg-secondary/40 py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
        {/* Header: title left, summary stats right */}
        <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <motion.p
              {...fadeUp(0)}
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary"
            >
              Expertise
            </motion.p>
            <motion.h2
              {...fadeUp(0.1)}
              className="mb-4 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-6xl"
              style={serif}
            >
              My Skills
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="text-base leading-relaxed text-muted-foreground">
              A carefully curated stack of technologies I use to architect intelligent systems,
              scalable web applications, and data-driven solutions.
            </motion.p>
          </div>

          <motion.dl
            {...fadeUp(0.3)}
            className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card md:min-w-[320px]"
          >
            {stats.map(stat => (
              <div key={stat.label} className="flex flex-col items-center justify-center px-4 py-3">
                <dd className="text-2xl font-semibold text-foreground md:text-3xl" style={serif}>
                  {stat.value}
                </dd>
                <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Fanned deck of category cards; hover lifts and highlights one */}
        <div className="mb-14">
          <SkillCardDeck categories={displayCategories} />
        </div>

        {/* Tools block shares the same left edge as the grid above */}
        <ToolsMarquee />
      </div>
    </section>
  );
};
