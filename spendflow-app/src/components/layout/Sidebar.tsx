'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, CreditCardIcon, CurrencyDollarIcon, UserIcon, ShieldCheckIcon, ArrowLeftOnRectangleIcon, BanknotesIcon, ReceiptPercentIcon, Bars3Icon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useEffect, useState } from 'react';
import { usersService } from '@/lib/firebase/firestore';
import dynamic from 'next/dynamic';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: ReceiptPercentIcon },
  { name: 'Expenses', href: '/expenses', icon: CurrencyDollarIcon },
  { name: 'Income', href: '/income', icon: BanknotesIcon },
  { name: 'Cards', href: '/cards', icon: CreditCardIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Admin', href: '/admin', icon: ShieldCheckIcon, adminOnly: true },
];

// Dynamically import AdManager with no SSR
const AdManager = dynamic(() => import('@/components/ads/AdManager'), { ssr: false });

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      usersService.get(user.uid).then(profile => {
        setIsAdmin(profile?.isAdmin || false);
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const renderNavLinks = () => {
    return navigation.map((item) => {
      // Hide admin link if user is not admin
      if (item.adminOnly && !isAdmin) return null;
      
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={closeMobileMenu}
          className={`group flex items-center px-4 py-4 text-sm transition-all duration-200 ${
            isActive
              ? 'border-l-2 border-amber-600 bg-amber-900/10 text-amber-400'
              : 'border-l-2 border-transparent text-slate-400 hover:border-amber-600/50 hover:text-slate-200'
          }`}
        >
          <item.icon
            className={`mr-3 shrink-0 h-5 w-5 transition-colors ${
              isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}
            aria-hidden="true"
          />
          <span className="tracking-wide uppercase text-xs font-serif">{item.name}</span>
        </Link>
      );
    });
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
              className="p-1 rounded-md text-slate-400 hover:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {renderNavLinks()}
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-amber-900/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-md text-slate-400 hover:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
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
            <div className="flex flex-col items-center justify-center h-24 shrink-0 px-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <h1 className="text-xl font-serif text-slate-100 tracking-widest">
                SPENDFLOW
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mt-3"></div>
            </div>
            <div className="flex flex-col grow mt-5">
              <nav className="flex-1 px-2 space-y-1">
                {renderNavLinks()}
              </nav>
            </div>
            <div className="shrink-0 p-4 border-t border-slate-600 space-y-3">
              {/* Currency Selector */}
              <div className="mt-auto space-y-4">
                {/* Ad - Desktop only */}
                <div className="hidden md:block p-2 rounded-lg bg-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1 text-center">Advertisement</p>
                  <AdManager adUnit="SIDEBAR" className="rounded overflow-hidden" />
                </div>
                
                <div className="pt-2 border-t border-slate-700">
                  <div className="px-2 space-y-1">
                    <button
                      onClick={handleSignOut}
                      className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
