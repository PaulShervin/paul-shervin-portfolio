import React, { useEffect, useRef, useState } from 'react';
import { usePortfolioData, HackathonData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Search, Edit2, Trash2, Terminal, Wand2, Save, Undo2 } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HackathonPhoto } from '../../components/hackathons/HackathonCardFace';
import { PhotoStudio, type StudioValue } from '../../components/hackathons/PhotoStudio';
import { LayoutBoard } from '../../components/hackathons/LayoutBoard';
import {
  DEFAULT_PHOTO_EDIT,
  aspectFor,
  legacyFitFor,
  normalizePhotoEdit,
  resolveCardSize,
  type CardSize,
  type PhotoEdit,
} from '../../components/hackathons/photoEdit';

/** Everything the layout board can change, used to tell whether there are unsaved edits. */
const layoutKey = (list: HackathonData[]) =>
  JSON.stringify(list.map((h) => [h.id, h.cardSize || 'auto', h.image || '', h.photoEdit ?? null]));

/** Keep the arrangement being edited, but pick up fresh details and added / removed entries. */
const mergeBoard = (current: HackathonData[], fresh: HackathonData[]): HackathonData[] => {
  const byId = new Map(fresh.map((h) => [h.id, h]));
  const kept = current
    .filter((h) => byId.has(h.id))
    .map((h) => ({ ...byId.get(h.id)!, cardSize: h.cardSize, image: h.image, photoEdit: h.photoEdit }));
  const keptIds = new Set(kept.map((h) => h.id));
  return [...kept, ...fresh.filter((h) => !keptIds.has(h.id))];
};

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
  const [photoEdit, setPhotoEdit] = useState<PhotoEdit>(DEFAULT_PHOTO_EDIT);
  const [cardSize, setCardSize] = useState<CardSize>('auto');
  const [studioOpen, setStudioOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where this card sits in the grid decides its "Auto" size
  const studioIndex = editingHackathon ? Math.max(0, hackathons.findIndex((h) => h.id === editingHackathon.id)) : hackathons.length;
  const studioValue: StudioValue = { image, photoEdit, cardSize };

  /* -- Layout board: the grid being arranged on this page -- */
  const [board, setBoard] = useState<HackathonData[]>([]);
  const baseline = useRef('');
  const [boardStudio, setBoardStudio] = useState<number | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);
  const fresh = hackathonsQuery.data;
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
      board.forEach((h, i) => {
        batch.set(
          doc(db, 'draft_hackathons', h.id),
          {
            name: h.name,
            year: h.year,
            position: h.position || '',
            description: h.description || '',
            teamName: h.teamName || '',
            image: h.image || '',
            photoEdit: normalizePhotoEdit(h.photoEdit, legacyFitFor(h.image, h.name)),
            cardSize: h.cardSize || 'auto',
            customImage: true,
            order: i,
          },
          { merge: true },
        );
      });
      await batch.commit();
      toast.success('Layout saved to drafts. Use Publish to make it live.');
      await hackathonsQuery.refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save the layout');
    } finally {
      setSavingLayout(false);
    }
  };

  const boardItem = boardStudio !== null ? board[boardStudio] : undefined;

  const handleOpenAdd = () => {
    setEditingHackathon(null);
    setName('');
    setPosition('');
    setYear(new Date().getFullYear().toString());
    setDescription('');
    setTeamName('');
    setImage('');
    setPhotoEdit(DEFAULT_PHOTO_EDIT);
    setCardSize('auto');
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
    setPhotoEdit(normalizePhotoEdit(hackathon.photoEdit, legacyFitFor(hackathon.image, hackathon.name)));
    setCardSize(hackathon.cardSize || 'auto');
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
      image: image || '',
      photoEdit: normalizePhotoEdit(photoEdit, legacyFitFor(image, name)),
      cardSize,
      // the photo shown here is exactly what the site should use (skips the old name-based mapping)
      customImage: true,
      order: editingHackathon ? hackathons.findIndex((h) => h.id === editingHackathon.id) : hackathons.length
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

      <Tabs defaultValue="layout" className="space-y-5">
        <TabsList>
          <TabsTrigger value="layout">Layout board</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Layout board: arrange the real grid */}
        <TabsContent value="layout" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><span className="font-semibold text-foreground">Swap places:</span> drag a card onto another one (or use the arrows).</li>
              <li><span className="font-semibold text-foreground">Resize:</span> drag the corner handle, or pick a size on the card.</li>
              <li><span className="font-semibold text-foreground">Change the picture:</span> press Photo on a card to replace it, then move, zoom and rotate it.</li>
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

          <LayoutBoard items={board} onChange={setBoard} onEditPhoto={setBoardStudio} />
        </TabsContent>

        {/* Details: names, years, descriptions */}
        <TabsContent value="details" className="space-y-6">
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
                    <HackathonPhoto src={h.image} alt={h.name} edit={normalizePhotoEdit(h.photoEdit, legacyFitFor(h.image, h.name))} />
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
        </TabsContent>
      </Tabs>

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

            {image ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Hackathon Photo</Label>
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-muted/10 p-3">
                  <div
                    className="relative overflow-hidden rounded-lg bg-black shadow-sm"
                    style={{ height: 130, aspectRatio: String(aspectFor(resolveCardSize(cardSize, studioIndex))), maxWidth: '100%' }}
                  >
                    <HackathonPhoto src={image} alt={name || 'Hackathon photo'} edit={photoEdit} />
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
                  setPhotoEdit({ ...DEFAULT_PHOTO_EDIT, fit: legacyFitFor(url, name) });
                }}
                label="Hackathon Photo"
              />
            )}

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

      {boardItem && boardStudio !== null && (
        <PhotoStudio
          open
          onOpenChange={(open) => !open && setBoardStudio(null)}
          value={{
            image: boardItem.image || '',
            photoEdit: normalizePhotoEdit(boardItem.photoEdit, legacyFitFor(boardItem.image, boardItem.name)),
            cardSize: boardItem.cardSize || 'auto',
          }}
          name={boardItem.name}
          year={boardItem.year}
          index={boardStudio}
          onApply={(v) =>
            setBoard((list) =>
              list.map((h, i) => (i === boardStudio ? { ...h, image: v.image, photoEdit: v.photoEdit, cardSize: v.cardSize as CardSize } : h)),
            )
          }
        />
      )}

      <PhotoStudio
        open={studioOpen}
        onOpenChange={setStudioOpen}
        value={studioValue}
        name={name}
        year={year}
        index={studioIndex}
        onApply={(v) => {
          setImage(v.image);
          setPhotoEdit(v.photoEdit);
          setCardSize(v.cardSize as CardSize);
        }}
      />
    </div>
  );
};

export default HackathonsManager;
