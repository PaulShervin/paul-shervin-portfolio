import { motion } from 'framer-motion';
import type { CategoryMeta } from './skillsMeta';

export interface DisplaySkill {
  name: string;
}

export interface DeckCategory {
  title: string;
  meta: CategoryMeta;
  items: DisplaySkill[];
}

const serif = { fontFamily: '"Cormorant Garamond", serif' };

/** Tilt and vertical offset per slot, so the four cards fan out like a hand of cards. */
const ROTATIONS = [-4, -1.5, 1.5, 4];
const BASE_LIFT = [12, 0, 0, 12];

const CardBody = ({ category }: { category: DeckCategory }) => {
  const Icon = category.meta.icon;
  const count = category.items.length;
  return (
    <>
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary 2xl:h-14 2xl:w-14">
        <Icon className="h-6 w-6 2xl:h-7 2xl:w-7" strokeWidth={1.75} style={{ color: category.meta.color }} />
      </span>

      <h3
        className="text-2xl font-medium leading-tight tracking-tight text-foreground xl:text-3xl 2xl:text-4xl"
        style={serif}
      >
        {category.title}
      </h3>
      <p className="mb-5 mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground 2xl:text-sm">
        {count} {count === 1 ? 'technology' : 'technologies'}
      </p>

      <ul className="divide-y divide-border/70 border-t border-border/70">
        {category.items.map(item => (
          <li
            key={item.name}
            className="py-3 text-[17px] font-medium leading-snug text-foreground/90 xl:text-lg 2xl:py-3.5 2xl:text-xl"
          >
            {item.name}
          </li>
        ))}
      </ul>
    </>
  );
};

const DeckCard = ({ category, index }: { category: DeckCategory; index: number }) => {
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const lift = BASE_LIFT[index % BASE_LIFT.length];

  return (
    <motion.div
      className="relative w-[260px] shrink-0 -ml-8 first:ml-0 hover:!z-40 xl:w-[330px] xl:-ml-10 2xl:w-[370px]"
      style={{ zIndex: index }}
      initial={{ opacity: 0, y: 48, rotate }}
      whileInView={{ opacity: 1, y: lift, rotate }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Slow bob gives the "floating" feel; each card drifts on its own rhythm */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5 + index * 0.7, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
      >
        {/* Hover straightens the card, lifts it above its neighbours and dims the others */}
        <motion.article
          whileHover={{ y: -24, scale: 1.05, rotate: -rotate }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-md transition-[opacity,box-shadow,border-color] xl:p-7 2xl:p-8 duration-300 group-hover/deck:opacity-55 hover:!opacity-100 hover:border-foreground/30 hover:shadow-xl"
        >
          <CardBody category={category} />
        </motion.article>
      </motion.div>
    </motion.div>
  );
};

export const SkillCardDeck = ({ categories }: { categories: DeckCategory[] }) => (
  <>
    {/* Fanned, floating deck on laptop widths and up */}
    <div className="group/deck hidden items-start justify-center pb-10 pt-14 lg:flex">
      {categories.map((category, idx) => (
        <DeckCard key={category.title} category={category} index={idx} />
      ))}
    </div>

    {/* Grid below laptop width so no card hides behind another */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:hidden">
      {categories.map((category, idx) => (
        <motion.article
          key={category.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.06, duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <CardBody category={category} />
        </motion.article>
      ))}
    </div>
  </>
);
