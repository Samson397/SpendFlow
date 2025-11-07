// Theme configuration for SpendFlow
export interface Theme {
  id: string;
  name: string;
  colors: {
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    
    // Card colors
    cardBackground: string;
    cardBorder: string;
    cardHover: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    
    // Accent colors
    accent: string;
    accentHover: string;
    accentLight: string;
    
    // Status colors
    success: string;
    error: string;
    warning: string;
    info: string;
    
    // Border colors
    border: string;
    borderLight: string;
    borderDark: string;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Midnight Amber (Default)',
    colors: {
      background: '#020617',        // slate-950
      backgroundSecondary: '#0f172a', // slate-900
      backgroundTertiary: '#1e293b',  // slate-800
      
      cardBackground: 'rgba(15, 23, 42, 0.5)', // slate-900/50
      cardBorder: '#334155',         // slate-700
      cardHover: 'rgba(30, 41, 59, 0.3)', // slate-800/30
      
      textPrimary: '#f1f5f9',       // slate-100
      textSecondary: '#cbd5e1',     // slate-300
      textTertiary: '#94a3b8',      // slate-400
      
      accent: '#f59e0b',            // amber-600
      accentHover: '#d97706',       // amber-700
      accentLight: '#fbbf24',       // amber-400
      
      success: '#10b981',           // green-500
      error: '#ef4444',             // red-500
      warning: '#f59e0b',           // amber-500
      info: '#3b82f6',              // blue-500
      
      border: '#334155',            // slate-700
      borderLight: '#475569',       // slate-600
      borderDark: '#1e293b',        // slate-800
    },
  },
  
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      background: '#0c1222',
      backgroundSecondary: '#111827',
      backgroundTertiary: '#1f2937',
      
      cardBackground: 'rgba(17, 24, 39, 0.5)',
      cardBorder: '#374151',
      cardHover: 'rgba(31, 41, 55, 0.3)',
      
      textPrimary: '#f3f4f6',
      textSecondary: '#d1d5db',
      textTertiary: '#9ca3af',
      
      accent: '#3b82f6',            // blue-500
      accentHover: '#2563eb',       // blue-600
      accentLight: '#60a5fa',       // blue-400
      
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',              // cyan-500
      
      border: '#374151',
      borderLight: '#4b5563',
      borderDark: '#1f2937',
    },
  },
  
  forest: {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      background: '#0a1810',
      backgroundSecondary: '#14241e',
      backgroundTertiary: '#1e332b',
      
      cardBackground: 'rgba(20, 36, 30, 0.5)',
      cardBorder: '#2d4a3e',
      cardHover: 'rgba(30, 51, 43, 0.3)',
      
      textPrimary: '#f0fdf4',
      textSecondary: '#dcfce7',
      textTertiary: '#bbf7d0',
      
      accent: '#22c55e',            // green-500
      accentHover: '#16a34a',       // green-600
      accentLight: '#4ade80',       // green-400
      
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      border: '#2d4a3e',
      borderLight: '#3d5a4e',
      borderDark: '#1e332b',
    },
  },
  
  sunset: {
    id: 'sunset',
    name: 'Sunset Purple',
    colors: {
      background: '#1a0b1e',
      backgroundSecondary: '#2d1537',
      backgroundTertiary: '#3f1f4f',
      
      cardBackground: 'rgba(45, 21, 55, 0.5)',
      cardBorder: '#5b2f6f',
      cardHover: 'rgba(63, 31, 79, 0.3)',
      
      textPrimary: '#faf5ff',
      textSecondary: '#e9d5ff',
      textTertiary: '#d8b4fe',
      
      accent: '#a855f7',            // purple-500
      accentHover: '#9333ea',       // purple-600
      accentLight: '#c084fc',       // purple-400
      
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      border: '#5b2f6f',
      borderLight: '#6b3f7f',
      borderDark: '#3f1f4f',
    },
  },
  
  crimson: {
    id: 'crimson',
    name: 'Crimson Red',
    colors: {
      background: '#1a0505',
      backgroundSecondary: '#2d0a0a',
      backgroundTertiary: '#3f1010',
      
      cardBackground: 'rgba(45, 10, 10, 0.5)',
      cardBorder: '#5f1a1a',
      cardHover: 'rgba(63, 16, 16, 0.3)',
      
      textPrimary: '#fef2f2',
      textSecondary: '#fecaca',
      textTertiary: '#fca5a5',
      
      accent: '#ef4444',            // red-500
      accentHover: '#dc2626',       // red-600
      accentLight: '#f87171',       // red-400
      
      success: '#10b981',
      error: '#b91c1c',             // red-700
      warning: '#f59e0b',
      info: '#3b82f6',
      
      border: '#5f1a1a',
      borderLight: '#7f2a2a',
      borderDark: '#3f1010',
    },
  },
};

export const getTheme = (themeId: string): Theme => {
  return themes[themeId] || themes.default;
};

export const themeList = Object.values(themes);
