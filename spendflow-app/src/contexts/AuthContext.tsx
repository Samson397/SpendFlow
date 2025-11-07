'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/firebase/config';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set Firebase persistence to local (remembers user across browser sessions)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Check if user is admin based on email
      if (currentUser?.email) {
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
        setIsAdmin(adminEmails.includes(currentUser.email));
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
