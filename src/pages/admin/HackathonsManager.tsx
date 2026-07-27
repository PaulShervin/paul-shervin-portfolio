import React, { useState } from 'react';
import { usePortfolioData, HackathonData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Edit2, Trash2, Terminal } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';

const HackathonsManager: React.FC = () => {
  const { hackathonsQuery } = usePortfolioData(true); // useDraft = true
  const hackathons = hackathonsQuery.data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<HackathonData | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [teamName, setTeamName] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingHackathon(null);
    setName('');
    setPosition('');
    setYear(new Date().getFullYear().toString());
    setDescription('');
    setTeamName('');
    setImage('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (hackathon: HackathonData) => {
    setEditingHackathon(hackathon);
    setName(hackathon.name || '');
    setPosition(hackathon.position || '');
    setYear(hackathon.year || '');
    setDescription(hackathon.description || '');
    setTeamName(hackathon.teamName || '');
    setImage(hackathon.image || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (hackathonId: string) => {
    if (!window.confirm('Delete this hackathon from drafts?')) return;

    try {
      await deleteDoc(doc(db, 'draft_hackathons', hackathonId));
      toast.success('Hackathon deleted from drafts');
      hackathonsQuery.refetch();
    } catch (e) {
      toast.error('Failed to delete hackathon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position || !year || !description) {
      toast.error('Please fill out Name, Position, Year, and Description');
      return;
    }

    setIsSubmitting(true);
    const hackathonData = {
      name,
      position,
      year,
      description,
      teamName: teamName || '',
      image: image || ''
    };

    try {
      if (editingHackathon) {
        await setDoc(doc(db, 'draft_hackathons', editingHackathon.id), hackathonData);
        toast.success('Hackathon updated in drafts');
      } else {
        const docId = `hack-${Date.now()}`;
        await setDoc(doc(db, 'draft_hackathons', docId), hackathonData);
        toast.success('Hackathon added to drafts');
      }
      setIsDialogOpen(false);
      hackathonsQuery.refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save hackathon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHackathons = hackathons.filter((h) => {
    const query = searchQuery.toLowerCase();
    return (
      h.name?.toLowerCase().includes(query) ||
      h.position?.toLowerCase().includes(query) ||
      h.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Hackathons Management</h2>
          <CardDescription>Manage your hackathon participations, team structures, and project summaries</CardDescription>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" /> Add Hackathon
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
        <Input
          placeholder="Search hackathons..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHackathons.map((h) => (
          <Card key={h.id} className="border-border/70 shadow-sm relative flex flex-col justify-between">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-bold">{h.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {h.year}
                </Badge>
              </div>
              <p className="text-xs text-primary/85 font-medium">{h.position} {h.teamName ? `(${h.teamName})` : ''}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                {h.description}
              </p>
              
              {/* Media preview wrapper */}
              <div className="w-full h-36 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden border border-border/50">
                {h.image && h.image !== '/placeholder.svg' ? (
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                ) : (
                  <Terminal className="w-10 h-10 text-primary/40" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleOpenEdit(h)}
                  className="h-8 text-xs font-semibold rounded-lg px-3 border-border/60 hover:bg-muted/40"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" /> Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleDelete(h.id)}
                  className="h-8 text-xs font-semibold rounded-lg px-3 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hackathon Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingHackathon ? 'Edit Hackathon details' : 'Add New Hackathon'}
            </DialogTitle>
            <DialogDescription>
              {editingHackathon ? 'Update hackathon specifications in drafts' : 'Fill details to add hackathon entry'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="hack-name">Hackathon Name *</Label>
              <Input
                id="hack-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smart India Hackathon"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="hack-position">Role / Position *</Label>
                <Input
                  id="hack-position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Team Lead / ML Engineer"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hack-year">Year *</Label>
                <Input
                  id="hack-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="hack-teamName">Team Name</Label>
              <Input
                id="hack-teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="AI Crusaders"
              />
            </div>

            <ImageUploader
              value={image}
              onChange={setImage}
              label="Hackathon Project Screenshot / Banner"
            />

            <div className="space-y-1">
              <Label htmlFor="hack-desc">Description *</Label>
              <Textarea
                id="hack-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Led team of 5 to build AI-powered solution..."
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

export default HackathonsManager;
