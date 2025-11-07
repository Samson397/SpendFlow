'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { themeList } from '@/config/themes';
import { ShieldCheckIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ThemesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme: currentTheme, themeId, setTheme, loading: themeLoading } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
      const admin = user.email ? adminEmails.includes(user.email) : false;
      setIsAdmin(admin);
      
      if (!admin) {
        router.push('/admin');
      }
    }
  }, [user, authLoading, router]);

  const handleApplyTheme = async (newThemeId: string) => {
    try {
      setApplying(newThemeId);
      await setTheme(newThemeId);
      const themeName = themeList.find(t => t.id === newThemeId)?.name;
      toast.success(`Theme changed to ${themeName}! All users will see this theme.`);
    } catch (error) {
      console.error('Error applying theme:', error);
      toast.error('Failed to change theme');
    } finally {
      setApplying(null);
    }
  };

  if (authLoading || themeLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent mx-auto mb-4"></div>
          <div className="text-amber-400 text-lg font-serif">Loading themes...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Admin Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            <span style={{ color: 'var(--color-accent)' }} className="font-serif tracking-wide">ADMIN</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif mb-2 tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
            Global Theme Settings
          </h1>
          <p className="text-sm tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
            Change the theme for all users across the entire application
          </p>
        </div>

        {/* Current Theme Info */}
        <div 
          className="rounded-lg p-6 mb-8 border"
          style={{ 
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)'
          }}
        >
          <h2 className="text-xl font-serif mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Current Theme: {currentTheme.name}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            This theme is currently active for all users
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themeList.map((theme) => {
            const isActive = theme.id === themeId;
            const isApplying = applying === theme.id;

            return (
              <div
                key={theme.id}
                className="rounded-lg p-6 border-2 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: isActive ? theme.colors.accent : theme.colors.cardBorder,
                }}
              >
                {/* Theme Name */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-serif" style={{ color: theme.colors.textPrimary }}>
                    {theme.name}
                  </h3>
                  {isActive && (
                    <CheckCircleIcon className="h-6 w-6" style={{ color: theme.colors.success }} />
                  )}
                </div>

                {/* Color Palette Preview */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2">
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
                      title="Background"
                    />
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border }}
                      title="Background Secondary"
                    />
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: theme.colors.backgroundTertiary, borderColor: theme.colors.border }}
                      title="Background Tertiary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: theme.colors.accent, borderColor: theme.colors.border }}
                      title="Accent"
                    />
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: theme.colors.success, borderColor: theme.colors.border }}
                      title="Success"
                    />
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: theme.colors.error, borderColor: theme.colors.border }}
                      title="Error"
                    />
                  </div>
                </div>

                {/* Sample Text */}
                <div className="mb-6 space-y-2">
                  <p style={{ color: theme.colors.textPrimary }} className="text-sm">
                    Primary Text
                  </p>
                  <p style={{ color: theme.colors.textSecondary }} className="text-sm">
                    Secondary Text
                  </p>
                  <p style={{ color: theme.colors.textTertiary }} className="text-sm">
                    Tertiary Text
                  </p>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApplyTheme(theme.id)}
                  disabled={isActive || isApplying}
                  className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isActive ? theme.colors.success : theme.colors.accent,
                    color: '#ffffff',
                  }}
                >
                  {isApplying ? 'Applying...' : isActive ? 'Active Theme' : 'Apply Theme'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Warning */}
        <div 
          className="mt-8 rounded-lg p-6 border"
          style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'var(--color-warning)'
          }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-warning)' }}>
            ⚠️ Important
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Changing the theme will immediately update the appearance for ALL users across the entire application. 
            The change happens in real-time without requiring users to refresh their browsers.
          </p>
        </div>
      </div>
    </div>
  );
}
