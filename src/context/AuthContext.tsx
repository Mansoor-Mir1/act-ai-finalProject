import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AuthContextType, UserProfile, UserRole } from '../types/auth';

export const ADMIN_EMAILS = ['ms123@gmail.com', 'ms1234@gmail.com'];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  role: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userEmail = user.email?.toLowerCase().trim() || '';
        const isFixedAdmin = isAdminEmail(userEmail);

        if (isFixedAdmin) {
          const adminProfile: UserProfile = {
            uid: user.uid,
            email: userEmail,
            displayName: 'MS',
            role: 'admin',
            createdAt: new Date().toISOString(),
          };
          setUserProfile(adminProfile);
        } else {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const data = userDocSnap.data() as UserProfile;
              // Force role to student for all non-admin emails
              setUserProfile({ ...data, role: 'student' });
            } else {
              // Default student profile fallback
              const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'Student',
                role: 'student',
                createdAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, newProfile);
              setUserProfile(newProfile);
            }
          } catch (error) {
            console.error('Error fetching user profile from Firestore:', error);
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Student',
              role: 'student',
              createdAt: new Date().toISOString(),
            });
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    role: userProfile?.role || null,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
