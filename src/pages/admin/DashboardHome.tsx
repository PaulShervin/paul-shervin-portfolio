import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { seedInitialData } from '../../lib/firebaseHelpers';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  FolderGit, 
  Wrench, 
  Trophy, 
  Award, 
  Terminal, 
  Plus, 
  DatabaseBackup,
  User,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  // Fetch draft counts
  const { 
    projectsQuery, 
    skillsQuery, 
    achievementsQuery, 
    certificationsQuery, 
    hackathonsQuery,
    profileQuery 
  } = usePortfolioData(true); // useDraft = true

  const [isSeeding, setIsSeeding] = useState(false);

  // Count raw skills (skills list is nested by category)
  const skillsCount = skillsQuery.data?.reduce((acc, cat) => acc + cat.items.length, 0) || 0;

  const stats = [
    { name: 'Projects', count: projectsQuery.data?.length || 0, icon: FolderGit, path: '/admin/projects', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Skills', count: skillsCount, icon: Wrench, path: '/admin/skills', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Certifications', count: certificationsQuery.data?.length || 0, icon: Award, path: '/admin/certificates', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Achievements', count: achievementsQuery.data?.length || 0, icon: Trophy, path: '/admin/achievements', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Hackathons', count: hackathonsQuery.data?.length || 0, icon: Terminal, path: '/admin/hackathons', color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedInitialData(true); // force seed draft data
      if (result) {
        toast.success('Database successfully seeded with portfolio data! Reloading...');
        // Refetch queries
        projectsQuery.refetch();
        skillsQuery.refetch();
        achievementsQuery.refetch();
        certificationsQuery.refetch();
        hackathonsQuery.refetch();
        profileQuery.refetch();
      } else {
        toast.info('Database already has data. Force seed was run.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to seed database.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/20 to-accent/20 p-6 rounded-2xl border border-primary/20">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-1.5 text-foreground leading-tight">
            Welcome back, Paul! <Sparkles className="w-5 h-5 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your personal profile details, projects, and skills dynamically.
          </p>
        </div>

        <Button
          onClick={handleSeed}
          disabled={isSeeding}
          variant="outline"
          className="border-primary/30 hover:bg-primary/10 text-xs flex items-center gap-1.5"
        >
          <DatabaseBackup className="w-4 h-4" />
          {isSeeding ? 'Seeding...' : 'Reset to Default (Seed Data)'}
        </Button>
      </div>

      {/* Stats counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.name} 
              onClick={() => navigate(stat.path)}
              className="cursor-pointer hover:border-primary/45 transition-colors border-border/70 shadow-sm"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.name}</span>
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-foreground">{stat.count}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Add Buttons */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          <CardDescription>Direct shortcuts to insert entries into draft collections</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/projects?add=true')} 
            className="rounded-xl h-14 justify-start px-4 border-border/60 hover:bg-muted/40 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2 text-primary" /> Add Project
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/skills?add=true')} 
            className="rounded-xl h-14 justify-start px-4 border-border/60 hover:bg-muted/40 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2 text-primary" /> Add Skill
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/certificates?add=true')} 
            className="rounded-xl h-14 justify-start px-4 border-border/60 hover:bg-muted/40 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2 text-primary" /> Add Certification
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/profile')} 
            className="rounded-xl h-14 justify-start px-4 border-border/60 hover:bg-muted/40 text-sm font-medium"
          >
            <User className="w-4 h-4 mr-2 text-primary" /> Edit Profile Card
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
