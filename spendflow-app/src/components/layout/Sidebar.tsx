'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, CreditCardIcon, CurrencyDollarIcon, UserIcon, ShieldCheckIcon, ArrowLeftOnRectangleIcon, BanknotesIcon, ReceiptPercentIcon, Bars3Icon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { CurrencySelector } from '@/components/settings/CurrencySelector';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useEffect, useState } from 'react';
import { usersService } from '@/lib/firebase/firestore';
import Image from 'next/image';

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
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-amber-900/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif text-slate-100 tracking-widest">
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center shrink-0 px-4 py-5 border-b border-slate-600">
            <h1 className="text-2xl font-serif text-slate-100 tracking-widest">
              SPENDFLOW
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3 bg-slate-800">
            <nav className="space-y-1">
              {renderNavLinks()}
            </nav>
          </div>
          <div className="shrink-0 p-4 border-t border-slate-600 bg-slate-800 space-y-3">
            {/* Currency Selector for Mobile */}
            <div>
              <CurrencySelector />
            </div>
            
            <button
              onClick={() => {
                handleSignOut();
                closeMobileMenu();
              }}
              className="flex items-center w-full px-3 py-3 text-sm font-medium text-slate-200 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3 text-slate-300" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col grow pt-5 pb-4 overflow-y-auto bg-slate-950 border-r border-amber-900/30">
            <div className="flex flex-col items-center shrink-0 px-4 mb-8">
              <div className="w-10 h-10 relative mb-3">
                <Image src="/logo.svg" alt="SpendFlow" width={40} height={40} />
              </div>
              <h1 className="text-2xl font-serif text-slate-100 tracking-widest">
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
              <div className="mb-3">
                <CurrencySelector />
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-slate-200 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3 text-slate-300" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
