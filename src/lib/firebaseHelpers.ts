import { collection, writeBatch, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import demoData from '../data/demo-data.json';

// Sync draft collections to live collections
export const publishChanges = async () => {
  const batch = writeBatch(db);
  const collectionsToSync = ['profile', 'projects', 'skills', 'achievements', 'certifications', 'hackathons'];

  for (const collName of collectionsToSync) {
    const draftCollRef = collection(db, `draft_${collName}`);
    const liveCollRef = collection(db, collName);

    // 1. Get all draft docs
    const draftSnapshot = await getDocs(draftCollRef);
    const draftDocIds = new Set<string>();

    draftSnapshot.forEach(docSnap => {
      draftDocIds.add(docSnap.id);
      const liveDocRef = doc(db, collName, docSnap.id);
      batch.set(liveDocRef, docSnap.data());
    });

    // 2. Get all live docs to delete ones that were deleted in draft
    const liveSnapshot = await getDocs(liveCollRef);
    liveSnapshot.forEach(docSnap => {
      if (!draftDocIds.has(docSnap.id)) {
        batch.delete(doc(db, collName, docSnap.id));
      }
    });
  }

  // 3. Update metadata
  const timestamp = new Date().toISOString();
  batch.set(doc(db, 'metadata', 'settings'), {
    lastPublished: timestamp,
    lastUpdated: timestamp
  });

  await batch.commit();
  return timestamp;
};

// Seed initial profile & lists from local demo-data.json if empty
export const seedInitialData = async (force = false) => {
  const checkDoc = await getDoc(doc(db, 'draft_profile', 'main'));
  if (checkDoc.exists() && !force) {
    return false; // already seeded
  }

  const batch = writeBatch(db);

  // 1. Seed Profile
  const profileRef = doc(db, 'draft_profile', 'main');
  batch.set(profileRef, {
    name: demoData.meta.name,
    role: demoData.meta.role,
    location: demoData.meta.location,
    tagline: demoData.meta.tagline,
    about: demoData.about,
    socials: demoData.socials,
    leetcode: demoData.leetcode
  });

  // 2. Seed Projects
  demoData.projects.forEach(p => {
    const pRef = doc(db, 'draft_projects', p.id);
    batch.set(pRef, {
      title: p.title,
      summary: p.summary,
      description: p.description,
      tech: p.tech,
      approach: p.approach,
      metrics: p.metrics,
      repo: p.repo,
      live: p.live,
      screenshot: p.screenshot || '',
      featured: true
    });
  });

  // 3. Seed Skills
  demoData.skills.forEach((cat) => {
    cat.items.forEach((item, index) => {
      const skillId = `${cat.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const sRef = doc(db, 'draft_skills', skillId);
      batch.set(sRef, {
        name: item.name,
        category: cat.category,
        level: item.level * 20, // Convert 1-5 scale to 0-100 percentage
        icon: ''
      });
    });
  });

  // 4. Seed Achievements
  demoData.achievements.forEach((a, i) => {
    const aRef = doc(db, 'draft_achievements', `ach_${i}`);
    batch.set(aRef, {
      title: a.title,
      organization: a.event,
      description: a.description,
      category: a.type,
      year: '2024'
    });
  });

  // 5. Seed Certifications
  demoData.certificates.forEach((c, i) => {
    const cRef = doc(db, 'draft_certifications', `cert_${i}`);
    batch.set(cRef, {
      title: c.title,
      issuer: c.issuer,
      date: c.date,
      url: c.file,
      image: ''
    });
  });

  // 6. Seed Hackathons
  demoData.hackathons.forEach((h, i) => {
    const hRef = doc(db, 'draft_hackathons', `hack_${i}`);
    batch.set(hRef, {
      name: h.name,
      year: h.year,
      position: h.role,
      description: h.description,
      image: h.image || ''
    });
  });

  await batch.commit();
  return true;
};
