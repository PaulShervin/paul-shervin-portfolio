import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDIea9KLoYQgEmKM48K1Dd9EccewJ0bDNM",
  authDomain: "portfolio-eca54.firebaseapp.com",
  projectId: "portfolio-eca54",
  storageBucket: "portfolio-eca54.firebasestorage.app",
  messagingSenderId: "329852397562",
  appId: "1:329852397562:web:4e6322e80885aeebe7a643",
  measurementId: "G-45GRQ138CP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
