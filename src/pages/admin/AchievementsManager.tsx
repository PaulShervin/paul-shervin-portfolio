import React, { useState } from 'react';
import { usePortfolioData, AchievementData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Edit2, Trash2, Trophy, Award, Sparkles } from 'lucide-react';

const AchievementsManager: React.FC = () => {
  const { achievementsQuery } = usePortfolioData(true); // useDraft = true
  const achievements = achievementsQuery.data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementData | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hackathon');
  const [icon, setIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingAchievement(null);
    setTitle('');
    setOrganization('');
    setYear(new Date().getFullYear().toString());
    setDescription('');
    setCategory('hackathon');
    setIcon('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (achievement: AchievementData) => {
    setEditingAchievement(achievement);
    setTitle(achievement.title || '');
    setOrganization(achievement.organization || '');
    setYear(achievement.year?.toString() || '');
    setDescription(achievement.description || '');
    setCategory(achievement.category || 'hackathon');
    setIcon(achievement.icon || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (achievementId: string) => {
    if (!window.confirm('Delete this achievement from drafts?')) return;

    try {
      await deleteDoc(doc(db, 'draft_achievements', achievementId));
      toast.success('Achievement deleted from drafts');
      achievementsQuery.refetch();
    } catch (e) {
      toast.error('Failed to delete achievement');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !organization || !description) {
      toast.error('Please enter Title, Organization, and Description');
      return;
    }

    setIsSubmitting(true);
    const achievementData = {
      title,
      organization,
      year: year || '2024',
      description,
      category,
      icon
    };

    try {
      if (editingAchievement) {
        await setDoc(doc(db, 'draft_achievements', editingAchievement.id), achievementData);
        toast.success('Achievement updated in drafts');
      } else {
        const docId = `ach-${Date.now()}`;
        await setDoc(doc(db, 'draft_achievements', docId), achievementData);
        toast.success('Achievement added to drafts');
      }
      setIsDialogOpen(false);
      achievementsQuery.refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save achievement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.title?.toLowerCase().includes(query) ||
      a.organization?.toLowerCase().includes(query) ||
      a.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Achievements Management</h2>
          <CardDescription>Manage wins, coding accolades, and awards</CardDescription>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" /> Add Achievement
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
        <Input
          placeholder="Search achievements..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <Card key={achievement.id} className="border-border/70 shadow-sm relative flex flex-col justify-between">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary capitalize">
                  {achievement.category}
                </Badge>
                <span className="text-xs font-mono font-bold text-muted-foreground">{achievement.year}</span>
              </div>
              <CardTitle className="text-base font-bold pt-2">{achievement.title}</CardTitle>
              <p className="text-xs text-primary/80 font-medium">{achievement.organization}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {achievement.description}
              </p>
              
              <div className="flex justify-end gap-1.5 pt-4 border-t border-border/40 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleOpenEdit(achievement)}
                  className="h-8 text-xs font-semibold rounded-lg px-3 border-border/60 hover:bg-muted/40"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" /> Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleDelete(achievement.id)}
                  className="h-8 text-xs font-semibold rounded-lg px-3 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingAchievement ? 'Edit Achievement details' : 'Add New Achievement'}
            </DialogTitle>
            <DialogDescription>
              {editingAchievement ? 'Modify achievement parameters in drafts' : 'Fill details to add achievement card'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="ach-title">Title *</Label>
              <Input
                id="ach-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="1st Place - SIH 2024"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="ach-org">Event / Organization *</Label>
                <Input
                  id="ach-org"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Smart India Hackathon"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ach-year">Year</Label>
                <Input
                  id="ach-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="ach-category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="ach-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="coding">Coding Platform</SelectItem>
                    <SelectItem value="project">Project Award</SelectItem>
                    <SelectItem value="other">Other/Academics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ach-icon">Custom Icon Name</Label>
                <Input
                  id="ach-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. Trophy, Medal"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="ach-desc">Description / Description *</Label>
              <Textarea
                id="ach-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of how you achieved this, team roles, or platform rating improvements..."
                className="min-h-[90px]"
                required
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-accent text-primary-foreground">
                {isSubmitting ? 'Saving...' : 'Save to Drafts'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementsManager;
