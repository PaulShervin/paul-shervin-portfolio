import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePortfolioData } from '@/hooks/usePortfolioData';

const serif = { fontFamily: '"Cormorant Garamond", serif' };

const AllProjects = () => {
  const { projectsQuery } = usePortfolioData();
  const projects = projectsQuery.data || [];
  const navigate = useNavigate();

  const isValidUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };

  const handleProjectClick = (projectTitle: string, projectId: string) => {
    const slug = projectTitle ? projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') : projectId;
    navigate(`/project/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* We can optionally render the global Navbar here if they want, 
          but for now we'll provide a minimal back button that acts as a header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 max-w-7xl flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="hover:bg-transparent hover:text-primary pl-0 text-muted-foreground group"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-12 md:py-16 max-w-7xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 tracking-tight text-foreground">
          Projects
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col h-full bg-card rounded-2xl border border-border/40 overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => handleProjectClick(project.title, project.id)}
            >
              {/* Image Area */}
              <div className="w-full h-[240px] bg-muted/20 relative overflow-hidden flex items-center justify-center">
                {project.screenshot ? (
                  <img 
                    src={project.screenshot} 
                    alt={project.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-4xl">🚀</div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {project.title}
                  </h3>
                  {/* Right side placeholder for date if available, else blank */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                    2024
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-6 text-sm line-clamp-2">
                  {project.summary}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tech.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="outline" className="bg-background/50 text-[11px] py-0.5 px-2.5 border-border/60 text-muted-foreground font-normal rounded-md">
                      {tech}
                    </Badge>
                  ))}
                  {project.tech.length > 5 && (
                    <Badge variant="outline" className="bg-background/50 text-[11px] py-0.5 px-2.5 border-border/60 text-muted-foreground font-normal rounded-md">
                      +{project.tech.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
