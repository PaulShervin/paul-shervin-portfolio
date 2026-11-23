import { motion } from 'framer-motion';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { HackathonCardFace } from './hackathons/HackathonCardFace';
import { resolveCardSize, spanClassFor } from './hackathons/photoEdit';

export const Hackathons = () => {
  const { hackathonsQuery } = usePortfolioData();
  const hackathons = hackathonsQuery.data || [];

  return (
    <section id="hackathons" className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Hackathons</span>
          </h2>
          <p className="text-muted-foreground text-lg">Competitive coding experiences</p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 md:grid-flow-dense gap-4 auto-rows-[300px]">
          {hackathons.map((hackathon, index) => {
            // Bento grid: each card follows the default repeating pattern (2x2, 1x1, 1x1, 2x1, 2x1, 1x2, 1x1, 1x1)
            // unless a size was chosen for it in the admin Photo Studio.
            const spanClass = spanClassFor(resolveCardSize(hackathon.cardSize, index));

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 0.98, transition: { duration: 0.3 } }}
                className={`card-elevated p-0 overflow-hidden group relative flex flex-col ${spanClass}`}
              >
                <HackathonCardFace
                  name={hackathon.name}
                  year={hackathon.year}
                  image={hackathon.image}
                  photoEdit={hackathon.photoEdit}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Achievement Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          <div className="card-elevated p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-gradient mb-2">{hackathons.length}</div>
            <div className="text-sm text-muted-foreground">Hackathons</div>
          </div>
          <div className="card-elevated p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-gradient mb-2">48h+</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </div>
          <div className="card-elevated p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-gradient mb-2">5+</div>
            <div className="text-sm text-muted-foreground">Team Members</div>
          </div>
          <div className="card-elevated p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-gradient mb-2">2</div>
            <div className="text-sm text-muted-foreground">National Finals</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
