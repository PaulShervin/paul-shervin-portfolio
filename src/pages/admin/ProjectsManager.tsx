import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePortfolioData, ProjectData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Edit2, Trash2, ExternalLink, Github, Eye, Sparkles } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';

const ProjectsManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectsQuery } = usePortfolioData(true); // useDraft = true
  const projects = projectsQuery.data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [techString, setTechString] = useState('');
  const [approach, setApproach] = useState('');
  const [metrics, setMetrics] = useState('');
  const [repo, setRepo] = useState('');
  const [live, setLive] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [featured, setFeatured] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open dialog if "?add=true" in url
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      handleOpenAdd();
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setTitle('');
    setSummary('');
    setDescription('');
    setTechString('');
    setApproach('');
    setMetrics('');
    setRepo('');
    setLive('');
    setScreenshot('');
    setFeatured(true);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (project: ProjectData) => {
    setEditingProject(project);
    setTitle(project.title || '');
    setSummary(project.summary || '');
    setDescription(project.description || '');
    setTechString(project.tech ? project.tech.join(', ') : '');
    setApproach(project.approach || '');
    setMetrics(project.metrics || '');
    setRepo(project.repo || '');
    setLive(project.live || '');
    setScreenshot(project.screenshot || '');
    setFeatured(project.featured !== false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project from drafts?')) return;
    
    try {
      await deleteDoc(doc(db, 'draft_projects', projectId));
      toast.success('Project deleted from drafts');
      projectsQuery.refetch();
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !description) {
      toast.error('Please fill in all required fields (Title, Summary, Description)');
      return;
    }

    setIsSubmitting(true);
    const techArray = techString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const projectData = {
      title,
      summary,
      description,
      tech: techArray,
      approach,
      metrics,
      repo,
      live,
      screenshot,
      featured
    };

    try {
      if (editingProject) {
        // Edit existing project
        await setDoc(doc(db, 'draft_projects', editingProject.id), projectData);
        toast.success('Project updated successfully');
      } else {
        // Add new project
        const docId = `proj-${Date.now()}`;
        await setDoc(doc(db, 'draft_projects', docId), projectData);
        toast.success('Project added successfully');
      }
      setIsDialogOpen(false);
      projectsQuery.refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter projects by search
  const filteredProjects = projects.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.summary?.toLowerCase().includes(query) ||
      p.tech?.some(t => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Projects Management</h2>
          <CardDescription>Add, update, or remove projects in draft state</CardDescription>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" /> Add New Project
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
        <Input
          placeholder="Search by title, tech stack..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="border-border/70 shadow-sm relative overflow-hidden group flex flex-col justify-between">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {project.featured && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold py-0.5">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{project.summary}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Screenshot Preview */}
              <div className="w-full h-36 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden border border-border/50">
                {project.screenshot ? (
                  <img src={project.screenshot} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <Eye className="w-8 h-8 text-primary/40" />
                )}
              </div>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-1">
                {project.tech.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex gap-2">
                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpenEdit(project)}
                    className="h-8 text-xs font-semibold rounded-lg px-3 border-border/60 hover:bg-muted/40"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" /> Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDelete(project.id)}
                    className="h-8 text-xs font-semibold rounded-lg px-3 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-1.5 text-foreground leading-tight">
              {editingProject ? 'Modify Project details' : 'Add New Portfolio Project'}
            </DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update current project specs in draft state' : 'Fill project parameters to append a card'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="project-title" className="text-xs">Project Title *</Label>
                <Input
                  id="project-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Smart Traffic Control"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="project-tech" className="text-xs">Tech Stack (comma separated) *</Label>
                <Input
                  id="project-tech"
                  value={techString}
                  onChange={(e) => setTechString(e.target.value)}
                  placeholder="Python, PyTorch, SUMO"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="project-summary" className="text-xs">Short Summary *</Label>
              <Input
                id="project-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="RL-based adaptive traffic signal orchestrator"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="project-desc" className="text-xs">Detailed Description *</Label>
              <Textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a few paragraphs about the problem statement, code architecture, and solutions..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="project-approach" className="text-xs">Technical Approach (optional)</Label>
                <Input
                  id="project-approach"
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="DQN optimization pipeline with Prioritized Replay"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="project-metrics" className="text-xs">Key Results / Metrics (optional)</Label>
                <Input
                  id="project-metrics"
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  placeholder="35% less delay, 28% higher flow"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="project-repo" className="text-xs">GitHub Repository Link</Label>
                <Input
                  id="project-repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="project-live" className="text-xs">Live Site Link</Label>
                <Input
                  id="project-live"
                  value={live}
                  onChange={(e) => setLive(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <ImageUploader
              value={screenshot}
              onChange={setScreenshot}
              label="Project Cover / Screenshot"
            />

            <div className="flex items-center justify-between p-4 border border-border bg-muted/20 rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Featured Project</Label>
                <p className="text-xs text-muted-foreground">Highlight this project on portfolio page</p>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-accent text-primary-foreground">
                {isSubmitting ? 'Saving changes...' : 'Save to Drafts'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManager;
