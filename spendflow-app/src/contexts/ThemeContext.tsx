'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Theme, getTheme } from '@/config/themes';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  setTheme: (themeId: string) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState('default');
  const [theme, setThemeState] = useState<Theme>(getTheme('default'));
  const [loading, setLoading] = useState(true);

  // Listen to theme changes from Firestore
  useEffect(() => {
    const themeRef = doc(db, 'settings', 'theme');
    
    const unsubscribe = onSnapshot(themeRef, 
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const newThemeId = data.currentTheme || 'default';
          setThemeId(newThemeId);
          setThemeState(getTheme(newThemeId));
          applyTheme(getTheme(newThemeId));
        } else {
          // Initialize with default theme
          setThemeId('default');
          setThemeState(getTheme('default'));
          applyTheme(getTheme('default'));
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to theme changes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const applyTheme = (theme: Theme) => {
    // Apply CSS custom properties to root
    const root = document.documentElement;
    
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
    root.style.setProperty('--color-background-tertiary', theme.colors.backgroundTertiary);
    
    root.style.setProperty('--color-card-bg', theme.colors.cardBackground);
    root.style.setProperty('--color-card-border', theme.colors.cardBorder);
    root.style.setProperty('--color-card-hover', theme.colors.cardHover);
    
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-tertiary', theme.colors.textTertiary);
    
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-accent-hover', theme.colors.accentHover);
    root.style.setProperty('--color-accent-light', theme.colors.accentLight);
    
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-info', theme.colors.info);
    
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-border-light', theme.colors.borderLight);
    root.style.setProperty('--color-border-dark', theme.colors.borderDark);
  };

  const setTheme = async (newThemeId: string) => {
    try {
      const themeRef = doc(db, 'settings', 'theme');
      await setDoc(themeRef, {
        currentTheme: newThemeId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      // Theme will be updated via the onSnapshot listener
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
