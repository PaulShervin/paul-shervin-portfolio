import { motion } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, Github, X } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { usePortfolioData, ProjectData } from '@/hooks/usePortfolioData';

export const Projects = () => {
  const { projectsQuery } = usePortfolioData();
  const projects = projectsQuery.data || [];
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  const isValidUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };

  return (
    <section id="projects" className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground text-lg">AI & ML projects I've built</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group card-elevated p-6 cursor-pointer hover-lift"
              onClick={() => setSelectedProject(project)}
            >
              {/* Project Screenshot */}
              <div className="w-full h-64 mb-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                {project.screenshot ? (
                  <img src={project.screenshot} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-6xl">🚀</div>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {project.summary}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.slice(0, 4).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.tech.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tech.length - 4}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  View Details
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                
                <div className="flex items-center gap-2">
                  {isValidUrl(project.repo) && (
                    <a 
                      href={project.repo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                      title="View GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {isValidUrl(project.live) && (
                    <a 
                      href={project.live} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                      title="View Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-lenis-prevent>
          {selectedProject && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedProject.title}</h2>
                <p className="text-lg text-muted-foreground">{selectedProject.summary}</p>
              </div>

              {/* Screenshot */}
              <div className="w-full h-96 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                {selectedProject.screenshot ? (
                  <img src={selectedProject.screenshot} alt={selectedProject.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-8xl">🚀</div>
                )}
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="text-xl font-bold mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Approach */}
              <div>
                <h3 className="text-xl font-bold mb-3">Technical Approach</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProject.approach}
                </p>
              </div>

              {/* Metrics */}
              <div className="card-elevated p-4 bg-primary/5">
                <h3 className="text-xl font-bold mb-3">Key Results</h3>
                <p className="text-muted-foreground">
                  {selectedProject.metrics}
                </p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {isValidUrl(selectedProject.repo) && (
                  <Button asChild>
                    <a href={selectedProject.repo} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      View Repository
                    </a>
                  </Button>
                )}
                {isValidUrl(selectedProject.live) && (
                  <Button variant="outline" asChild>
                    <a href={selectedProject.live} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
