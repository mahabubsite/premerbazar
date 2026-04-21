import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously, linkWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  lookingFor: 'male' | 'female' | 'everyone';
  bio?: string;
  interests?: string[];
  photos?: string[];
  photoURL?: string;
  redFlags?: string;
  greenFlags?: string;
  whyDateMe?: string;
  badges?: string[];
  pastRelationships?: number;
  heartbreaks?: number;
  ratingAverage?: number;
  ratingCount?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  linkEmailAccount: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Explicitly set loading if it's not already
        setLoading(true);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously", error);
      throw error;
    }
  };

  const linkGoogleAccount = async () => {
    if (!user) return;
    const provider = new GoogleAuthProvider();
    try {
      await linkWithPopup(user, provider);
    } catch (error) {
      console.error("Error linking Google account", error);
      throw error;
    }
  };

  const linkEmailAccount = async (email: string, pass: string) => {
    if (!user) return;
    try {
      await updateEmail(user, email);
      await updatePassword(user, pass);
    } catch (error: any) {
      // If it fails with requires-recent-login or similar we could fall back,
      // but usually for a new anonymous user this succeeds smoothly.
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          name: data.name || currentUser.displayName || 'অজানা ইউজার',
          age: data.age || 18,
          gender: data.gender || 'other',
          lookingFor: data.lookingFor || 'everyone',
          createdAt: new Date().toISOString(),
          ...data
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      } else {
        await setDoc(docRef, data, { merge: true });
        setProfile({ ...docSnap.data(), ...data } as UserProfile);
      }
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, loginAnonymously, linkGoogleAccount, linkEmailAccount, signUpWithEmail, signInWithEmail, logout, updateProfile: updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
