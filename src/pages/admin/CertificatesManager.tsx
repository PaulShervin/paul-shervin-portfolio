import React, { useState } from 'react';
import { usePortfolioData, CertificationData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Edit2, Trash2, Award, ExternalLink } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';

const CertificatesManager: React.FC = () => {
  const { certificationsQuery } = usePortfolioData(true); // useDraft = true
  const certificates = certificationsQuery.data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationData | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingCert(null);
    setTitle('');
    setIssuer('');
    setDate(new Date().toISOString().substring(0, 7)); // yyyy-mm format
    setUrl('');
    setImage('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cert: CertificationData) => {
    setEditingCert(cert);
    setTitle(cert.title || '');
    setIssuer(cert.issuer || '');
    setDate(cert.date || '');
    setUrl(cert.url || '');
    setImage(cert.image || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (certId: string) => {
    if (!window.confirm('Delete this certification from drafts?')) return;

    try {
      await deleteDoc(doc(db, 'draft_certifications', certId));
      toast.success('Certification deleted from drafts');
      certificationsQuery.refetch();
    } catch (e) {
      toast.error('Failed to delete certification');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer || !date) {
      toast.error('Please enter Title, Issuer, and Issue Date');
      return;
    }

    setIsSubmitting(true);
    const certData = {
      title,
      issuer,
      date,
      url,
      image
    };

    try {
      if (editingCert) {
        await setDoc(doc(db, 'draft_certifications', editingCert.id), certData);
        toast.success('Certification updated in drafts');
      } else {
        const docId = `cert-${Date.now()}`;
        await setDoc(doc(db, 'draft_certifications', docId), certData);
        toast.success('Certification added to drafts');
      }
      setIsDialogOpen(false);
      certificationsQuery.refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save certification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCertificates = certificates.filter((c) => {
    const query = searchQuery.toLowerCase();
    return c.title?.toLowerCase().includes(query) || c.issuer?.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Certifications Management</h2>
          <CardDescription>Manage your course completions and credentials</CardDescription>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" /> Add Certification
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
        <Input
          placeholder="Search certifications..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCertificates.map((cert) => (
          <Card key={cert.id} className="border-border/70 shadow-sm relative flex flex-col justify-between">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-bold">{cert.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {cert.date}
                </Badge>
              </div>
              <p className="text-xs text-primary/85 font-medium">{cert.issuer}</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0">
              {/* Media preview wrapper */}
              <div className="w-full h-36 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden border border-border/50">
                {cert.image ? (
                  <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                ) : (
                  <Award className="w-10 h-10 text-primary/40" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-border/40 mt-4">
                <div>
                  {cert.url && (
                    <a 
                      href={cert.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify Link
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpenEdit(cert)}
                    className="h-8 text-xs font-semibold rounded-lg px-3 border-border/60 hover:bg-muted/40"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" /> Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDelete(cert.id)}
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

      {/* Certification Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingCert ? 'Edit Certification details' : 'Add New Certification'}
            </DialogTitle>
            <DialogDescription>
              {editingCert ? 'Update credential specs in draft state' : 'Fill details to add certification card'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="cert-title">Certificate Name *</Label>
              <Input
                id="cert-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deep Learning Specialization"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cert-issuer">Issuing Organization *</Label>
              <Input
                id="cert-issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Coursera / Andrew Ng"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cert-date">Issue Date (yyyy-mm) *</Label>
              <Input
                id="cert-date"
                type="month"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <ImageUploader
              value={image}
              onChange={setImage}
              label="Verification Image"
            />

            <div className="space-y-1">
              <Label htmlFor="cert-url">Credential URL / Verification Link</Label>
              <Input
                id="cert-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://coursera.org/verify/..."
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

export default CertificatesManager;
