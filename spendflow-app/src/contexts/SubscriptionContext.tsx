'use client';

import { createContext, useContext, ReactNode } from 'react';

// Stub subscription context to prevent breaking changes
// This maintains compatibility while subscription features are removed

interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
}

interface SubscriptionContextType {
  tier: 'free' | 'premium' | 'enterprise';
  subscription: null;
  theme: Theme;
  canAccessFeature: (feature: string) => boolean;
}

const defaultTheme: Theme = {
  name: 'Default',
  primary: '#f59e0b',
  secondary: '#0f172a',
  accent: '#3b82f6',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: 'free',
  subscription: null,
  theme: defaultTheme,
  canAccessFeature: () => true, // All features available by default
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const value: SubscriptionContextType = {
    tier: 'free',
    subscription: null,
    theme: defaultTheme,
    canAccessFeature: () => true, // All features available
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
