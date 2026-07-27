import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import demoData from '../data/demo-data.json';

// Types matching local JSON structure
export interface ProfileData {
  name: string;
  role: string;
  location: string;
  tagline: string;
  about: string;
  socials: {
    github: string;
    linkedin: string;
    leetcode: string;
    email: string;
    phone?: string;
  };
  leetcode: {
    problems_solved: number;
    rating: number;
    streak: number;
  };
  resumeUrl?: string;
  photoUrl?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  summary: string;
  description: string;
  tech: string[];
  approach?: string;
  metrics?: string;
  repo: string;
  live: string;
  screenshot?: string;
  featured?: boolean;
}

export interface SkillItem {
  name: string;
  level: number;
  icon?: string;
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

export interface AchievementData {
  id: string;
  title: string;
  organization: string; // maps to event
  year?: string | number;
  description: string;
  category: string; // maps to type
  icon?: string;
  highlights?: string[];
}

export interface CertificationData {
  id: string;
  title: string;
  issuer: string;
  date: string;
  url: string; // maps to file or link
  image?: string;
}

export interface HackathonData {
  id: string;
  name: string;
  position?: string; // maps to role
  year: string;
  description: string;
  teamName?: string;
  image?: string;
}

// Custom hook to fetch all database records
export const usePortfolioData = (useDraft = false) => {
  const prefix = useDraft ? 'draft_' : '';

  const profileQuery = useQuery<ProfileData>({
    queryKey: [prefix + 'profile'],
    queryFn: async () => {
      try {
        const profileDoc = await getDoc(doc(db, prefix + 'profile', 'main'));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          return {
            name: data.name || demoData.meta.name,
            role: data.role || demoData.meta.role,
            location: data.location || demoData.meta.location,
            tagline: data.tagline || demoData.meta.tagline,
            about: data.about || demoData.about,
            socials: data.socials || demoData.socials,
            leetcode: data.leetcode || demoData.leetcode,
            resumeUrl: data.resumeUrl || '',
            photoUrl: data.photoUrl || '',
          };
        }
      } catch (e) {
        console.error("Error fetching profile from Firestore, using fallback", e);
      }
      return {
        name: demoData.meta.name,
        role: demoData.meta.role,
        location: demoData.meta.location,
        tagline: demoData.meta.tagline,
        about: demoData.about,
        socials: demoData.socials,
        leetcode: demoData.leetcode,
      };
    },
  });

  const projectsQuery = useQuery<ProjectData[]>({
    queryKey: [prefix + 'projects'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, prefix + 'projects'));
        const list: ProjectData[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let screenshot = data.screenshot || '';
          const titleLower = data.title ? data.title.toLowerCase() : '';
          if (titleLower.includes('bias')) {
            screenshot = '/bias-lab.jpg';
          } else if (titleLower.includes('jana') || titleLower.includes('naadi')) {
            screenshot = '/jana-naadi.jpg';
          } else if (titleLower.includes('edu') || titleLower.includes('bridge') || titleLower.includes('connect')) {
            screenshot = '/edu-bridge.jpg';
          } else if (titleLower.includes('finmate') || titleLower.includes('finamte')) {
            screenshot = '/finmate.jpg';
          }
          list.push({ id: docSnap.id, ...data, screenshot } as ProjectData);
        });
        if (list.length > 0) {
          const getProjectOrder = (title: string) => {
            const t = title.toLowerCase();
            if (t.includes('bias')) return 1;
            if (t.includes('edu') || t.includes('bridge') || t.includes('connect')) return 2;
            if (t.includes('jana') || t.includes('naadi')) return 3;
            if (t.includes('finmate') || t.includes('finamte')) return 4;
            return 99;
          };
          list.sort((a, b) => getProjectOrder(a.title || '') - getProjectOrder(b.title || ''));
          return list;
        }
      } catch (e) {
        console.error("Error fetching projects from Firestore, using fallback", e);
      }
      return demoData.projects.map(p => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        description: p.description,
        tech: p.tech,
        approach: p.approach,
        metrics: p.metrics,
        repo: p.repo,
        live: p.live,
        screenshot: p.screenshot,
        featured: true,
      }));
    },
  });

  const skillsQuery = useQuery<SkillCategory[]>({
    queryKey: [prefix + 'skills'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, prefix + 'skills'));
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        
        if (list.length > 0) {
          // Re-group by category
          const grouped = list.reduce((acc: Record<string, SkillItem[]>, skill) => {
            const cat = skill.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push({
              name: skill.name,
              level: Number(skill.level) || 0,
              icon: skill.icon || '',
            });
            return acc;
          }, {});

          return Object.entries(grouped).map(([category, items]) => ({
            category,
            items,
          }));
        }
      } catch (e) {
        console.error("Error fetching skills, using fallback", e);
      }
      return demoData.skills;
    },
  });

  const achievementsQuery = useQuery<AchievementData[]>({
    queryKey: [prefix + 'achievements'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, prefix + 'achievements'));
        const list: AchievementData[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AchievementData);
        });
        if (list.length > 0) return list;
      } catch (e) {
        console.error("Error fetching achievements, using fallback", e);
      }
      return demoData.achievements.map((a, i) => ({
        id: `ach-${i}`,
        title: a.title,
        organization: a.event,
        description: a.description,
        category: a.type,
      }));
    },
  });

  const certificationsQuery = useQuery<CertificationData[]>({
    queryKey: [prefix + 'certifications'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, prefix + 'certifications'));
        const list: CertificationData[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as CertificationData);
        });
        if (list.length > 0) return list;
      } catch (e) {
        console.error("Error fetching certifications, using fallback", e);
      }
      return demoData.certificates.map((c, i) => ({
        id: `cert-${i}`,
        title: c.title,
        issuer: c.issuer,
        date: c.date,
        url: c.file,
      }));
    },
  });

  const hackathonsQuery = useQuery<HackathonData[]>({
    queryKey: [prefix + 'hackathons'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, prefix + 'hackathons'));
        const list: HackathonData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let image = data.image || '';
          const nameLower = data.name ? data.name.toLowerCase() : '';
          if (nameLower.includes('smart india') || nameLower.includes('sih')) {
            image = '/smart-india-hackathon.jpg';
          } else if (nameLower.includes('national')) {
            image = '/openai-nxtwave-nationals.png';
          } else if (nameLower.includes('openai') || nameLower.includes('nxtwave')) {
            image = '/openai-nxtwave.png';
          } else if (nameLower.includes('solution challenge') || nameLower.includes('solution challange')) {
            image = '/google-solution-challenge.png';
          } else if (nameLower.includes('vit void') || nameLower.includes('void')) {
            image = '/vit-void-hackathon.jpg';
          }
          list.push({ id: doc.id, ...data, image } as HackathonData);
        });
        if (list.length > 0) return list;
      } catch (e) {
        console.error("Error fetching hackathons, using fallback", e);
      }
      return demoData.hackathons.map((h, i) => {
        let image = h.image;
        const nameLower = h.name ? h.name.toLowerCase() : '';
        if (nameLower.includes('smart india') || nameLower.includes('sih')) {
          image = '/smart-india-hackathon.jpg';
        } else if (nameLower.includes('national')) {
          image = '/openai-nxtwave-nationals.png';
        } else if (nameLower.includes('openai') || nameLower.includes('nxtwave')) {
          image = '/openai-nxtwave.png';
        } else if (nameLower.includes('solution challenge') || nameLower.includes('solution challange')) {
          image = '/google-solution-challenge.png';
        } else if (nameLower.includes('vit void') || nameLower.includes('void')) {
          image = '/vit-void-hackathon.jpg';
        }
        return {
          id: `hack-${i}`,
          name: h.name,
          year: h.year,
          position: h.role,
          description: h.description,
          image: image,
        };
      });
    },
  });

  return {
    profileQuery,
    projectsQuery,
    skillsQuery,
    achievementsQuery,
    certificationsQuery,
    hackathonsQuery,
    loading:
      profileQuery.isLoading ||
      projectsQuery.isLoading ||
      skillsQuery.isLoading ||
      achievementsQuery.isLoading ||
      certificationsQuery.isLoading ||
      hackathonsQuery.isLoading,
  };
};
