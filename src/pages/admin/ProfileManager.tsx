import React, { useState, useEffect } from 'react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { User, Share2, Award } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';

const ProfileManager: React.FC = () => {
  const { profileQuery } = usePortfolioData(true); // useDraft = true
  const profile = profileQuery.data;

  // Basic Info Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Socials Form State
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // LeetCode Stats State
  const [solved, setSolved] = useState(0);
  const [rating, setRating] = useState(0);
  const [streak, setStreak] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize values when data is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setRole(profile.role || '');
      setLocation(profile.location || '');
      setTagline(profile.tagline || '');
      setAbout(profile.about || '');
      setPhotoUrl(profile.photoUrl || '');
      setResumeUrl(profile.resumeUrl || '');

      if (profile.socials) {
        setGithub(profile.socials.github || '');
        setLinkedin(profile.socials.linkedin || '');
        setLeetcodeUrl(profile.socials.leetcode || '');
        setEmail(profile.socials.email || '');
        setPhone(profile.socials.phone || '');
      }

      if (profile.leetcode) {
        setSolved(profile.leetcode.problems_solved || 0);
        setRating(profile.leetcode.rating || 0);
        setStreak(profile.leetcode.streak || 0);
      }
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedProfile = {
      name,
      role,
      location,
      tagline,
      about,
      photoUrl,
      resumeUrl,
      socials: {
        github,
        linkedin,
        leetcode: leetcodeUrl,
        email,
        phone
      },
      leetcode: {
        problems_solved: Number(solved) || 0,
        rating: Number(rating) || 0,
        streak: Number(streak) || 0
      }
    };

    try {
      await setDoc(doc(db, 'draft_profile', 'main'), updatedProfile);
      toast.success('Profile details saved to drafts!');
      profileQuery.refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileQuery.isLoading) {
    return <div className="text-center py-10 text-muted-foreground">Loading profile data...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Profile Settings</h2>
        <CardDescription>Update your personal information, socials, resume PDF, and coding profile metrics</CardDescription>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="basic" className="rounded-lg gap-2 text-xs md:text-sm">
              <User className="w-4 h-4" /> Personal
            </TabsTrigger>
            <TabsTrigger value="socials" className="rounded-lg gap-2 text-xs md:text-sm">
              <Share2 className="w-4 h-4" /> Social Links
            </TabsTrigger>
            <TabsTrigger value="leetcode" className="rounded-lg gap-2 text-xs md:text-sm">
              <Award className="w-4 h-4" /> Coding Stats
            </TabsTrigger>
          </TabsList>

          {/* Basic Personal Details Tab */}
          <TabsContent value="basic" className="space-y-4 outline-none">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Personal Profile Details</CardTitle>
                <CardDescription>These details are shown in the Hero, About, and Contact sections.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="role">Primary Role / Title *</Label>
                    <Input id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="AI & ML Student" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="location">Location / College *</Label>
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Saveetha Engineering College" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input id="tagline" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Deep Learning, GenAI & Agentic AI enthusiast" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <ImageUploader
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    label="Avatar Photo"
                  />
                  <div className="space-y-1 mb-2">
                    <Label htmlFor="resumeUrl">Resume PDF URL</Label>
                    <Input id="resumeUrl" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} placeholder="https://firebasestorage.../resume.pdf" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="about">About Biography *</Label>
                  <Textarea id="about" value={about} onChange={e => setAbout(e.target.value)} className="min-h-[120px]" required />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="socials" className="space-y-4 outline-none">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Social Handles & Contact Info</CardTitle>
                <CardDescription>Provide URLs to link icons on the landing page and footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="email">Public Email *</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="github">GitHub Profile URL</Label>
                  <Input id="github" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                  <Input id="linkedin" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="leetcodeUrl">LeetCode Profile URL</Label>
                  <Input id="leetcodeUrl" value={leetcodeUrl} onChange={e => setLeetcodeUrl(e.target.value)} placeholder="https://leetcode.com/username" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LeetCode stats Tab */}
          <TabsContent value="leetcode" className="space-y-4 outline-none">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">LeetCode Metrics</CardTitle>
                <CardDescription>Manage statistics shown in your dashboard card and ID card badges.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="solved">Problems Solved</Label>
                    <Input id="solved" type="number" value={solved} onChange={e => setSolved(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rating">Contest Rating</Label>
                    <Input id="rating" type="number" value={rating} onChange={e => setRating(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="streak">Active Coding Streak</Label>
                    <Input id="streak" type="number" value={streak} onChange={e => setStreak(Number(e.target.value))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Bar */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-sm">
            {isSubmitting ? 'Saving changes...' : 'Save Profile Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManager;
