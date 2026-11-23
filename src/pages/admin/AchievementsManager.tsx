import React, { useEffect, useRef, useState } from 'react';
import { usePortfolioData, AchievementData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Search, Edit2, Trash2, Trophy, Award, Sparkles, Wand2, Save, Undo2 } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { PhotoStudio } from '../../components/hackathons/PhotoStudio';
import { DEFAULT_PHOTO_EDIT, legacyFitFor, normalizePhotoEdit, photoEditStyle, type PhotoEdit } from '../../components/hackathons/photoEdit';
import { AchievementBoard } from '../../components/hallOfFame/AchievementBoard';
import { achievementStudio } from '../../components/hallOfFame/achievementStudio';
import { extractRank, toWin } from '../../components/hallOfFame/winUtils';

type AchievementSize = NonNullable<AchievementData['cardSize']>;

/** Everything the layout board can change, used to tell whether there are unsaved edits. */
const layoutKey = (list: AchievementData[]) =>
  JSON.stringify(list.map((a) => [a.id, a.cardSize || 'auto', a.image || '', a.photoEdit ?? null]));

/** Keep the arrangement being edited, but pick up fresh details and added / removed entries. */
const mergeBoard = (current: AchievementData[], fresh: AchievementData[]): AchievementData[] => {
  const byId = new Map(fresh.map((a) => [a.id, a]));
  const kept = current
    .filter((a) => byId.has(a.id))
    .map((a) => ({ ...byId.get(a.id)!, cardSize: a.cardSize, image: a.image, photoEdit: a.photoEdit }));
  const keptIds = new Set(kept.map((a) => a.id));
  return [...kept, ...fresh.filter((a) => !keptIds.has(a.id))];
};

const AchievementsManager: React.FC = () => {
  const { achievementsQuery, hackathonsQuery } = usePortfolioData(true); // useDraft = true
  const hackathons = hackathonsQuery.data || [];
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
  const [image, setImage] = useState('');
  const [photoEdit, setPhotoEdit] = useState<PhotoEdit>(DEFAULT_PHOTO_EDIT);
  const [cardSize, setCardSize] = useState<AchievementSize>('auto');
  const [studioOpen, setStudioOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -- Layout board: the Hall of Fame being arranged on this page -- */
  const [board, setBoard] = useState<AchievementData[]>([]);
  const baseline = useRef('');
  const [boardStudio, setBoardStudio] = useState<number | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);
  const fresh = achievementsQuery.data;
  const dirty = layoutKey(board) !== baseline.current;

  useEffect(() => {
    const list = fresh || [];
    setBoard((current) => (layoutKey(current) === baseline.current ? list : mergeBoard(current, list)));
    baseline.current = layoutKey(list);
  }, [fresh]);

  const saveLayout = async () => {
    setSavingLayout(true);
    try {
      const batch = writeBatch(db);
      board.forEach((a, i) => {
        batch.set(
          doc(db, 'draft_achievements', a.id),
          {
            title: a.title,
            organization: a.organization || '',
            year: String(a.year ?? ''),
            description: a.description || '',
            category: a.category || 'other',
            icon: a.icon || '',
            image: a.image || '',
            photoEdit: normalizePhotoEdit(a.photoEdit),
            cardSize: a.cardSize || 'auto',
            order: i,
          },
          { merge: true },
        );
      });
      await batch.commit();
      toast.success('Layout saved to drafts. Use Publish to make it live.');
      await achievementsQuery.refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save the layout');
    } finally {
      setSavingLayout(false);
    }
  };

  const boardItem = boardStudio !== null ? board[boardStudio] : undefined;
  const boardWin = boardItem && boardStudio !== null ? toWin(boardItem, boardStudio, hackathons) : undefined;

  const handleOpenAdd = () => {
    setEditingAchievement(null);
    setTitle('');
    setOrganization('');
    setYear(new Date().getFullYear().toString());
    setDescription('');
    setCategory('hackathon');
    setIcon('');
    setImage('');
    setPhotoEdit(DEFAULT_PHOTO_EDIT);
    setCardSize('auto');
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
    setImage(achievement.image || '');
    setPhotoEdit(normalizePhotoEdit(achievement.photoEdit));
    setCardSize(achievement.cardSize || 'auto');
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
      icon,
      image,
      photoEdit: normalizePhotoEdit(photoEdit),
      cardSize,
      order: editingAchievement ? Math.max(0, achievements.findIndex((a) => a.id === editingAchievement.id)) : achievements.length
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

      <Tabs defaultValue="layout" className="space-y-5">
        <TabsList>
          <TabsTrigger value="layout">Layout board</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Layout board: arrange the real Hall of Fame */}
        <TabsContent value="layout" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><span className="font-semibold text-foreground">Swap places:</span> drag a pinned photo onto another one (or use the arrows).</li>
              <li><span className="font-semibold text-foreground">Resize:</span> drag the corner handle sideways, or pick Auto, Normal or Large.</li>
              <li><span className="font-semibold text-foreground">Change the picture:</span> press Photo to replace it, then move, zoom and rotate it.</li>
            </ul>
            <div className="flex shrink-0 items-center gap-2">
              {dirty && <span className="text-xs font-medium text-amber-600">Unsaved changes</span>}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!dirty || savingLayout}
                onClick={() => setBoard(fresh || [])}
                className="h-9 text-xs"
              >
                <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Discard
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!dirty || savingLayout}
                onClick={saveLayout}
                className="h-9 bg-primary text-xs font-semibold text-primary-foreground hover:bg-accent"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" /> {savingLayout ? 'Saving...' : 'Save layout'}
              </Button>
            </div>
          </div>

          <AchievementBoard items={board} hackathons={hackathons} onChange={setBoard} onEditPhoto={setBoardStudio} />
        </TabsContent>

        {/* Details: titles, years, descriptions */}
        <TabsContent value="details" className="space-y-6">
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
        </TabsContent>
      </Tabs>

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

            {image ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Winning photo (pinned on the Hall of Fame board)</Label>
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-muted/10 p-3">
                  <div className="relative h-32 overflow-hidden rounded-lg bg-black shadow-sm" style={{ aspectRatio: '4 / 3', maxWidth: '100%' }}>
                    <img src={image} alt={title || 'Winning photo'} draggable={false} className="h-full w-full" style={photoEditStyle(photoEdit)} />
                  </div>
                  <div className="flex w-full gap-2">
                    <Button
                      type="button"
                      onClick={() => setStudioOpen(true)}
                      className="h-9 flex-1 bg-primary text-xs font-semibold text-primary-foreground hover:bg-accent"
                    >
                      <Wand2 className="mr-1.5 h-4 w-4" /> Open Photo Studio
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImage('');
                        setPhotoEdit(DEFAULT_PHOTO_EDIT);
                      }}
                      className="h-9 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ImageUploader
                value={image}
                onChange={(url) => {
                  setImage(url);
                  setPhotoEdit({ ...DEFAULT_PHOTO_EDIT, fit: legacyFitFor(url) });
                }}
                label="Winning photo (pinned on the Hall of Fame board)"
                folder="achievements"
              />
            )}

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

      {boardItem && boardWin && boardStudio !== null && (
        <PhotoStudio
          open
          onOpenChange={(open) => !open && setBoardStudio(null)}
          config={achievementStudio(Boolean(boardWin.rank && !boardWin.rank.isTop && boardWin.rank.n === 1))}
          value={{
            image: boardWin.image || '',
            photoEdit: normalizePhotoEdit(boardItem.photoEdit),
            cardSize: boardItem.cardSize || 'auto',
          }}
          name={boardWin.title}
          year={boardWin.year}
          index={boardStudio}
          onApply={(v) =>
            setBoard((list) =>
              list.map((a, i) => (i === boardStudio ? { ...a, image: v.image, photoEdit: v.photoEdit, cardSize: v.cardSize as AchievementSize } : a)),
            )
          }
        />
      )}

      <PhotoStudio
        open={studioOpen}
        onOpenChange={setStudioOpen}
        config={achievementStudio(Boolean(extractRank(title) && !extractRank(title)!.isTop && extractRank(title)!.n === 1))}
        value={{ image, photoEdit, cardSize }}
        name={title}
        year={year}
        index={editingAchievement ? Math.max(0, achievements.findIndex((a) => a.id === editingAchievement.id)) : achievements.length}
        onApply={(v) => {
          setImage(v.image);
          setPhotoEdit(v.photoEdit);
          setCardSize(v.cardSize as AchievementSize);
        }}
      />
    </div>
  );
};

export default AchievementsManager;
