'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, CreditCardIcon, CurrencyDollarIcon, UserIcon, ShieldCheckIcon, ArrowLeftOnRectangleIcon, BanknotesIcon, ReceiptPercentIcon, Bars3Icon, XMarkIcon, CalendarIcon, BuildingLibraryIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { CurrencySelector } from '../currency/CurrencySelector';
import { getFirebaseAuthError } from '@/lib/utils/firebaseAuthErrors';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const userNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: ReceiptPercentIcon },
  { name: 'Expenses', href: '/expenses', icon: CurrencyDollarIcon },
  { name: 'Income', href: '/income', icon: BanknotesIcon },
  { name: 'Cards', href: '/cards', icon: CreditCardIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Savings', href: '/savings', icon: BuildingLibraryIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Subscription', href: '/subscription', icon: SparklesIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const adminNavigation: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheckIcon },
  { name: 'User Management', href: '/admin/users', icon: UserIcon },
  { name: 'System Alerts', href: '/admin/alerts', icon: TagIcon },
  { name: 'Settings', href: '/admin/settings', icon: SparklesIcon },
];

// Dynamically import AdManager with no SSR
const AdManager = dynamic(() => import('@/components/ads/AdManager'), { ssr: false });

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate admin status using useMemo to avoid setState in useEffect
  const isAdmin = useMemo(() => {
    if (user) {
      // Use same admin check logic as AuthContext - supports multiple admins
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
      const userIsAdmin = user.email ? adminEmails.includes(user.email) : false;

      console.log('Sidebar admin check:', {
        userEmail: user.email,
        adminEmails,
        userIsAdmin
      });

      return userIsAdmin;
    }
    return false;
  }, [user]);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Starting sidebar logout process...');

      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      // Sign out from Firebase
      await signOut(auth);

      console.log('✅ Successfully signed out from sidebar');

      // Force redirect to login page
      window.location.href = '/login';

    } catch (error: unknown) {
      console.error('❌ Sidebar logout error:', error);

      // Handle specific Firebase errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/insufficient-permission') {
        console.warn('⚠️ Insufficient permission during sidebar logout - this may be expected');
      }

      const friendlyError = getFirebaseAuthError(error as { code?: string; message?: string });
      console.error(`${friendlyError.title}: ${friendlyError.message}`);

      // For sidebar, we don't show toast, just redirect
      window.location.href = '/login';
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const renderNavLinks = () => {
    // Use different navigation based on admin status
    const currentNavigation = isAdmin ? adminNavigation : userNavigation;

    const links = currentNavigation.map((item) => {
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={closeMobileMenu}
          className={`group flex items-center px-4 py-4 text-sm transition-all duration-200 ${
            isActive
              ? 'border-l-2 border-(--theme-accent) bg-(--theme-secondary)/10 text-(--theme-accent)'
              : 'border-l-2 border-transparent text-slate-400 hover:border-(--theme-accent)/50 hover:text-slate-200'
          }`}
        >
          <item.icon
            className={`mr-3 shrink-0 h-5 w-5 transition-colors ${
              isActive ? 'text-(--theme-accent)' : 'text-slate-500 group-hover:text-slate-300'
            }`}
            aria-hidden="true"
          />
          <span className="tracking-wide uppercase text-xs font-serif">{item.name}</span>
        </Link>
      );
    });

    return links;
  };

  return (
    <>
      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-30 bg-slate-950/95 backdrop-blur-sm transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif text-slate-100">Menu</h2>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-1 rounded-md text-slate-400 hover:text-(--theme-accent) focus:outline-none focus:ring-1 focus:ring-(--theme-accent)"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {renderNavLinks()}
          </nav>
          {/* Mobile Footer - Currency & Logout */}
          <div className="border-t border-slate-800 p-4 space-y-4">
            {/* Currency Selector */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-serif tracking-wider">CURRENCY</p>
              <CurrencySelector />
            </div>
            {/* Sign Out Button */}
            <button
              onClick={() => {
                handleSignOut();
                closeMobileMenu();
              }}
              className="group flex w-full items-center px-4 py-4 text-sm text-slate-400 hover:text-slate-200 transition-colors border-t border-slate-700 pt-4"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-slate-500 group-hover:text-slate-300" />
              <span className="tracking-wide uppercase text-xs font-serif">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-amber-900/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-serif text-slate-100 tracking-widest">
              SPENDFLOW
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <div className="flex flex-col w-64 border-r border-slate-800 bg-slate-900/50">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col items-center justify-center h-24 shrink-0 px-4 bg-linear-to-r from-slate-800/50 to-slate-900/50">
              <h1 className="text-xl font-serif text-slate-100 tracking-widest">
                SPENDFLOW
              </h1>
              <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-(--theme-accent) to-transparent mt-3"></div>
            </div>
            <div className="flex flex-col grow mt-5">
              <nav className="flex-1 px-2 space-y-1">
                {renderNavLinks()}
              </nav>
            </div>
            <div className="shrink-0 p-4 border-t border-slate-600 space-y-3">
              {/* Currency Selector */}
              <div className="px-2 py-3">
                <p className="text-xs text-slate-500 mb-2 font-serif tracking-wider">CURRENCY</p>
                <div className="mb-4">
                  <CurrencySelector />
                </div>
              </div>
              {/* Ad - Desktop only */}
              <div className="hidden md:block p-2 rounded-lg bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-1 text-center">Advertisement</p>
                <AdManager adUnit="SIDEBAR" className="rounded overflow-hidden" />
              </div>
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="group flex w-full items-center px-4 py-4 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-slate-500 group-hover:text-slate-300" />
                <span className="tracking-wide uppercase text-xs font-serif">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
