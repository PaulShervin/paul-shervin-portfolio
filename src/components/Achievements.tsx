import { motion } from 'framer-motion';
import { Trophy, Medal, Code, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import demoData from '../data/demo-data.json';

const getIcon = (type: string) => {
  switch (type) {
    case 'hackathon':
      return Trophy;
    case 'coding':
      return Code;
    case 'project':
      return Sparkles;
    default:
      return Medal;
  }
};

const getGradient = (type: string) => {
  switch (type) {
    case 'hackathon':
      return 'from-yellow-500/20 to-orange-500/20';
    case 'coding':
      return 'from-blue-500/20 to-cyan-500/20';
    case 'project':
      return 'from-purple-500/20 to-pink-500/20';
    default:
      return 'from-primary/20 to-accent/20';
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'hackathon':
      return 'text-yellow-500';
    case 'coding':
      return 'text-blue-500';
    case 'project':
      return 'text-purple-500';
    default:
      return 'text-primary';
  }
};

export const Achievements = () => {
  return (
    <section id="achievements" className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Achievements</span>
          </h2>
          <p className="text-muted-foreground text-lg">Wins & Recognition</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {demoData.achievements.map((achievement, index) => {
            const Icon = getIcon(achievement.type);
            const gradient = getGradient(achievement.type);
            const iconColor = getIconColor(achievement.type);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card-elevated p-6 group relative overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                    >
                      <Icon className={`w-7 h-7 ${iconColor}`} />
                    </motion.div>
                    <Badge variant="outline" className="capitalize">
                      {achievement.type}
                    </Badge>
                  </div>

                  {/* Title */}
                  <motion.h3
                    className="text-xl font-bold mb-2 group-hover:text-primary transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {achievement.title}
                  </motion.h3>

                  {/* Event */}
                  <p className="text-sm text-primary/80 font-medium mb-3">
                    {achievement.event}
                  </p>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {achievement.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-medium">
              <span className="text-2xl font-bold text-gradient">3</span> Hackathon Wins
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-medium">
              <span className="text-2xl font-bold text-gradient">2</span> Coding Awards
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-lg font-medium">
              <span className="text-2xl font-bold text-gradient">1</span> Project Award
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
