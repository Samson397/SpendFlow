'use client';

import { useEffect, ReactNode } from 'react';
import { useSubscription } from './SubscriptionContext';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useSubscription();

  useEffect(() => {
    // Apply theme CSS variables to document root
    const root = document.documentElement;

    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-gradient', theme.gradient);

    // Apply theme class to body
    document.body.className = `theme-${theme.name.toLowerCase()}`;

  }, [theme]);

  return <>{children}</>;
}

// CSS-in-JS theme styles (can be used for components that need dynamic theming)
export const getThemeStyles = (theme: {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
}) => ({
  primary: { color: theme.primary },
  secondary: { backgroundColor: theme.secondary },
  accent: { borderColor: theme.accent },
  gradient: { background: theme.gradient },
  surface: { backgroundColor: theme.surface },
  text: { color: theme.text },
  textSecondary: { color: theme.textSecondary },
  border: { borderColor: theme.border }
});
