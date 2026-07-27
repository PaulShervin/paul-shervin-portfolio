import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';
import demoData from '../data/demo-data.json';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export const Hackathons = () => {
  const { hackathonsQuery } = usePortfolioData();
  const hackathons = hackathonsQuery.data || [];

  const plugin = useRef(
    Autoplay({ delay: 1000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4">
              {hackathons.map((hackathon, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="card-elevated p-0 overflow-hidden group h-full"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                      {hackathon.image ? (
                        <motion.img
                          src={hackathon.image}
                          alt={hackathon.name}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: (
                              hackathon.name?.toLowerCase().includes('solution') ||
                              hackathon.image?.includes('google-solution-challenge') ||
                              hackathon.image?.includes('solution-challenge')
                            )
                              ? 'right 15% top'
                              : 'center'
                          }}
                          whileHover={{ scale: 1.15 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🏆</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />

                      {/* Trophy Badge */}
                      <motion.div
                        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Trophy className="w-6 h-6 text-primary-foreground" />
                      </motion.div>

                      {/* Year Badge */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        viewport={{ once: true }}
                      >
                        <Badge variant="secondary" className="absolute top-4 left-4">
                          {hackathon.year}
                        </Badge>
                      </motion.div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <motion.h3
                        className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {hackathon.name}
                      </motion.h3>

                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{hackathon.position || 'Team Member'}</span>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {hackathon.description}
                      </p>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex items-center justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0 bg-card border-border hover:bg-primary hover:text-primary-foreground" />
              <CarouselNext className="static translate-y-0 bg-card border-border hover:bg-primary hover:text-primary-foreground" />
            </div>
          </Carousel>
        </motion.div>

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
