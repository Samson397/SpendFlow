'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once loading is complete and we haven't already redirected
    if (!loading && !hasRedirected.current) {
      if (!user) {
        // User is not authenticated, redirect to login
        hasRedirected.current = true;
        router.push('/login');
      } else if (requireAdmin && user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
        // User is not an admin but trying to access admin route
        hasRedirected.current = true;
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-amber-400 animate-spin" />
          <p className="mt-4 text-slate-400 font-serif tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-amber-400 animate-spin" />
          <p className="mt-4 text-slate-400 font-serif tracking-wider">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Check if user is trying to access admin route without admin privileges
  if (requireAdmin && user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-2xl font-serif text-slate-100 tracking-wide">Access Denied</div>
          <p className="mt-2 text-slate-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
