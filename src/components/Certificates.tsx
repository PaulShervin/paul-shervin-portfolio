import { motion } from 'framer-motion';
import { Award, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export const Certificates = () => {
  const { certificationsQuery } = usePortfolioData();
  const certificates = certificationsQuery.data || [];

  return (
    <section id="certificates" className="py-20 md:py-32 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Certificates</span>
          </h2>
          <p className="text-muted-foreground text-lg">Professional certifications & achievements</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {certificates.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card-elevated p-6 hover-lift group"
            >
              {/* Certificate Icon/Preview */}
              <div className="w-full h-48 mb-4 rounded-lg bg-gradient-to-br from-primary/10 via-accent/10 to-primary-glow/10 flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary transition-colors overflow-hidden">
                {cert.image ? (
                  <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                ) : (
                  <Award className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {cert.title}
              </h3>
              
              <p className="text-muted-foreground mb-3">{cert.issuer}</p>

              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">
                  {new Date(cert.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short' 
                  })}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {cert.url && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(cert.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verify Credential
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-8 card-elevated p-6">
            <div>
              <div className="text-4xl font-bold text-gradient mb-1">
                {certificates.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Certificates</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <div className="text-4xl font-bold text-gradient mb-1">4</div>
              <div className="text-sm text-muted-foreground">Major Platforms</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
