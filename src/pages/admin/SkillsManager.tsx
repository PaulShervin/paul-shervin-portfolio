import React, { useState } from 'react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, Edit2, Trash2, ShieldAlert } from 'lucide-react';

interface SkillFlattened {
  id: string;
  name: string;
  category: string;
  level: number;
  icon?: string;
}

const SkillsManager: React.FC = () => {
  const { skillsQuery } = usePortfolioData(true); // useDraft = true
  const rawCategories = skillsQuery.data || [];

  // Flatten nested skills categories for listing/searching
  const skills: SkillFlattened[] = rawCategories.flatMap(cat => 
    cat.items.map(item => ({
      id: `${cat.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: item.name,
      category: cat.category,
      level: item.level,
      icon: item.icon
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillFlattened | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Languages');
  const [customCategory, setCustomCategory] = useState('');
  const [level, setLevel] = useState(80);
  const [icon, setIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get distinct categories
  const categoriesList = Array.from(new Set(rawCategories.map(c => c.category)));

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setName('');
    setCategory(categoriesList[0] || 'Languages');
    setCustomCategory('');
    setLevel(80);
    setIcon('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (skill: SkillFlattened) => {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setCustomCategory('');
    setLevel(skill.level);
    setIcon(skill.icon || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (skillId: string) => {
    if (!window.confirm('Delete this skill from drafts?')) return;

    try {
      await deleteDoc(doc(db, 'draft_skills', skillId));
      toast.success('Skill deleted from drafts');
      skillsQuery.refetch();
    } catch (e) {
      toast.error('Failed to delete skill');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Please enter a skill name');
      return;
    }

    setIsSubmitting(true);
    const finalCategory = category === 'new' ? customCategory.trim() : category;

    if (!finalCategory) {
      toast.error('Please enter or select a category');
      setIsSubmitting(false);
      return;
    }

    const skillId = editingSkill 
      ? editingSkill.id 
      : `${finalCategory.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const skillData = {
      name,
      category: finalCategory,
      level,
      icon
    };

    try {
      await setDoc(doc(db, 'draft_skills', skillId), skillData);
      toast.success('Skill saved to drafts');
      setIsDialogOpen(false);
      skillsQuery.refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSkills = skills.filter(s => {
    const query = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Skills Management</h2>
          <CardDescription>Configure categories and proficiencies for your skills</CardDescription>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" /> Add New Skill
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
        <Input
          placeholder="Search skill or category..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Skills Table Card */}
      <Card className="border-border/70 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/60">
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Skill Name</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Category</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Level (%)</th>
                  <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{skill.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                        {skill.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-foreground/80">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${skill.level}%` }} />
                        </div>
                        {skill.level}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenEdit(skill)}
                          className="h-8 text-xs font-semibold rounded-lg px-3 border-border/60 hover:bg-muted/40"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(skill.id)}
                          className="h-8 text-xs font-semibold rounded-lg px-3 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Skill Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingSkill ? 'Modify Skill Details' : 'Add New Skill'}
            </DialogTitle>
            <DialogDescription>
              {editingSkill ? 'Update skill proficiency and category' : 'Specify skill properties to save to drafts'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Python, React, TensorFlow"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="skill-category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="new">+ Add Custom Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {category === 'new' && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <Label htmlFor="custom-category">Custom Category Name *</Label>
                <Input
                  id="custom-category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Robotics, Devops"
                  required
                />
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <Label htmlFor="skill-level">Proficiency Level: {level}%</Label>
              </div>
              <Slider
                id="skill-level"
                min={0}
                max={100}
                step={5}
                value={[level]}
                onValueChange={(val) => setLevel(val[0])}
              />
              <p className="text-[10px] text-muted-foreground leading-normal">
                Note: In skills grids, level values map into visual indicator dots (1-5 range: e.g. 80%+ is 5 dots).
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="skill-icon">Custom Icon Name (optional)</Label>
              <Input
                id="skill-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Lucide icon name (e.g. Code2, Brain)"
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

export default SkillsManager;
