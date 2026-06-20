import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import demoData from '../data/demo-data.json';

interface BadgeCardProps {
  name: string;
  source: string;
  image: string;
  delay: number;
}

const BadgeCard = ({ name, source, image, delay }: BadgeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        scale: 1.05,
        y: -8,
        transition: { duration: 0.25, ease: [0.34, 1.26, 0.64, 1] }
      }}
      className="group relative rounded-xl p-4 py-5 transition-all duration-300
        bg-[hsl(var(--skill-card-bg))] 
        hover:bg-[hsl(var(--skill-card-hover))]
        shadow-[var(--shadow-skill-card)]
        hover:shadow-[var(--shadow-skill-hover)]
        border border-border/10
        hover:border-[hsl(var(--cyber-teal))]/50
        cursor-default
        flex flex-col items-center justify-center gap-3
        overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cyber-teal))]/5 to-transparent" />
      </div>
      
      {/* Badge Image */}
      <motion.div 
        className="w-14 h-14 flex items-center justify-center relative z-10"
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -3, 3, 0],
          transition: { duration: 0.4 }
        }}
      >
        <div className="w-full h-full rounded-full bg-muted/20 flex items-center justify-center">
          <Award className="w-7 h-7 text-primary" />
        </div>
      </motion.div>
      
      {/* Badge Info */}
      <div className="text-center relative z-10">
        <h4 className="text-sm font-bold text-foreground mb-1">
          {name}
        </h4>
        <p className="text-xs text-muted-foreground">
          {source}
        </p>
      </div>
    </motion.div>
  );
};

export const Badges = () => {
  return (
    <section id="badges" className="py-16 md:py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">
            Achieved Badges
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Milestones that reflect the journey of continuous growth and mastery 🏆
          </p>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
          {demoData.badges.map((badge, index) => (
            <BadgeCard
              key={`${badge.name}-${index}`}
              name={badge.name}
              source={badge.source}
              image={badge.image}
              delay={index * 40}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
