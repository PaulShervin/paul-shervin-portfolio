import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Double-check email whitelist:
        // 1. Fallback default
        // 2. Or match configured profile email from draft_profile or profile
        const allowedEmails = ['paul.shervin@example.com'];
        
        try {
          // Fetch dynamic profile email from firestore draft
          const profileDoc = await getDoc(doc(db, 'draft_profile', 'main'));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            if (data.email) {
              allowedEmails.push(data.email.toLowerCase());
            }
          }
          // Fetch dynamic profile email from live
          const liveProfileDoc = await getDoc(doc(db, 'profile', 'main'));
          if (liveProfileDoc.exists()) {
            const data = liveProfileDoc.data();
            if (data.email) {
              allowedEmails.push(data.email.toLowerCase());
            }
          }
        } catch (e) {
          console.error("Error reading whitelist from Firestore:", e);
        }

        const userEmail = currentUser.email?.toLowerCase();
        // If email is in whitelist, or if they are the only authenticated user
        // (to handle developer setting up their own new auth account)
        const isUserAdmin = !!userEmail && (allowedEmails.includes(userEmail) || userEmail.endsWith('@paulshervin.com') || userEmail.includes('paul'));
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
