import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBiHJ2QvjQ33dcjcgS5Ovf6brcdf5BupE",
  authDomain: "ai-python-platform.firebaseapp.com",
  projectId: "ai-python-platform",
  storageBucket: "ai-python-platform.firebasestorage.app",
  messagingSenderId: "581797132571",
  appId: "1:581797132571:web:9a63dfb9e94b302f807bbe",
  measurementId: "G-K3FJEW2TXZ"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
