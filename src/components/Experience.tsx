import { motion } from 'framer-motion';
import { Briefcase, Calendar } from 'lucide-react';
import demoData from '../data/demo-data.json';

export const Experience = () => {
  return (
    <section id="experience" className="py-20 md:py-32 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Work <span className="text-gradient">Experience</span>
          </h2>
          <p className="text-muted-foreground text-lg">My professional journey</p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary-glow hidden md:block" />

          {demoData.experience.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative mb-12 md:pl-20"
            >
              {/* Timeline Node */}
              <div className="hidden md:flex absolute left-6 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-[var(--shadow-glow)]" />

              {/* Content Card */}
              <div className="card-elevated p-6 hover-lift">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <h3 className="text-2xl font-bold">{exp.role}</h3>
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-medium mt-2 md:mt-0">
                    <Calendar className="w-4 h-4" />
                    <span>{exp.from} - {exp.to}</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {exp.bullets.map((bullet, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * i }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="text-primary mt-1 text-xl">→</span>
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
