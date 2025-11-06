'use client';

import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Simple theme provider without subscription dependency
  // Theme is now managed via Tailwind CSS classes
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
