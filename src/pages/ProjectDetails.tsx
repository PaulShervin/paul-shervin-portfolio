import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Github, TerminalSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projectsQuery } = usePortfolioData();
  
  const projects = projectsQuery.data || [];
  const project = projects.find(p => p.id === projectId || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === projectId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (projectsQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-muted-foreground">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <Button onClick={() => navigate('/')}>Return to Portfolio</Button>
      </div>
    );
  }

  const isValidUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Portfolio
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 mt-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gradient">
              {project.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {project.summary}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {isValidUrl(project.repo) && (
                <Button asChild size="lg" className="rounded-full">
                  <a href={project.repo} target="_blank" rel="noopener noreferrer">
                    <Github className="w-5 h-5 mr-2" />
                    View Source Code
                  </a>
                </Button>
              )}
              {isValidUrl(project.live) && (
                <Button variant="outline" size="lg" className="rounded-full" asChild>
                  <a href={project.live} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Screenshot Hero */}
          <div className="w-full aspect-video md:h-[500px] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden shadow-2xl border border-border/50">
            {project.screenshot ? (
              <img src={project.screenshot} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-9xl opacity-50">🚀</div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <TerminalSquare className="w-6 h-6 mr-3 text-primary" />
                  About the Project
                </h2>
                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
                  <p>{project.description}</p>
                  
                  {project.approach && (
                    <>
                      <h3 className="text-xl font-medium text-foreground mt-8 mb-3">Technical Approach</h3>
                      <p>{project.approach}</p>
                    </>
                  )}
                </div>
              </section>

              {/* GitHub Structure Placeholder if needed */}
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <Github className="w-6 h-6 mr-3 text-primary" />
                  GitHub Structure & Architecture
                </h2>
                <div className="card-elevated p-6 bg-card/50 font-mono text-sm text-muted-foreground overflow-x-auto">
                  <pre>
{`.
├── src/
│   ├── components/      # UI components and layout
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Application routes
│   └── lib/             # Utilities and configs
├── public/              # Static assets
├── package.json         # Project dependencies
└── README.md            # Project documentation`}
                  </pre>
                  <p className="mt-4 text-xs italic text-center opacity-70">
                    * Note: This is a general structural representation. View the repository for the exact file tree.
                  </p>
                </div>
              </section>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-8">
              <div className="card-elevated p-6 border-primary/20">
                <h3 className="text-lg font-bold mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {project.metrics && (
                <div className="card-elevated p-6 bg-accent/5 border-accent/20">
                  <h3 className="text-lg font-bold mb-4">Key Metrics & Results</h3>
                  <p className="text-muted-foreground font-medium">
                    {project.metrics}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
