'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';

export default function SetupAdmin() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is authorized for admin setup
  const adminEmails = [
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [])
  ].filter(Boolean); // Filter out undefined values

  const isAuthorized = user && adminEmails.includes(user.email);

  const makeAdmin = async () => {
    if (!user) {
      setMessage('❌ You must be logged in');
      return;
    }

    if (!isAuthorized) {
      setMessage('❌ You are not authorized to perform admin setup');
      return;
    }

    try {
      setLoading(true);
      setMessage('Setting up admin access...');

      // Update user document to add isAdmin flag
      await setDoc(doc(db, 'users', user.uid), {
        isAdmin: true
      }, { merge: true });

      setMessage('✅ Success! You are now an admin. Redirecting...');

      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage(`❌ Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-lg">
        <h1 className="text-3xl font-serif text-slate-100 mb-4 text-center tracking-wide">
          Admin Setup
        </h1>

        {user ? (
          isAuthorized ? (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Current User:</p>
                <p className="text-slate-200 font-mono text-sm break-all">{user.email}</p>
              </div>

              <button
                onClick={makeAdmin}
                disabled={loading}
                className="w-full py-3 px-4 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 font-serif tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Make Me Admin'}
              </button>

              {message && (
                <div className={`p-4 rounded border ${
                  message.includes('✅')
                    ? 'bg-green-900/20 border-green-700/30 text-green-400'
                    : message.includes('❌')
                    ? 'bg-red-900/20 border-red-700/30 text-red-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400'
                }`}>
                  <p className="text-sm">{message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4h.01M12 5.373l7.071 7.071a2 2 0 010 2.828l-7.071 7.071a2 2 0 01-2.828 0L2.929 14.9a2 2 0 010-2.828l7.071-7.071a2 2 0 012.828 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
              <p className="text-slate-400 text-sm mb-4">
                You don't have permission to access admin setup. Only authorized administrators can perform this action.
              </p>
              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Current User:</p>
                <p className="text-slate-200 font-mono text-sm break-all">{user.email}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 px-4 border border-slate-600 text-slate-400 bg-slate-800 hover:bg-slate-700 font-serif tracking-wider transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )
        ) : (
          <div className="text-center">
            <p className="text-slate-400 mb-4">Please sign in first</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 font-serif tracking-wider transition-all"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
