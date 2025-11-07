'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, getAuth } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { getFirebaseAuthError } from '@/lib/utils/firebaseAuthErrors';

function VerifyEmailContent() {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode) {
        setError('Invalid verification link. Please request a new verification email.');
        setVerifying(false);
        return;
      }

      try {
        console.log('🔍 Verifying email with code:', oobCode);

        // Apply the email verification action code
        await applyActionCode(auth, oobCode);

        // Update the user's emailVerified status in Firestore
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            emailVerified: true,
            updatedAt: new Date().toISOString()
          });
        }

        console.log('✅ Email verified successfully');
        setSuccess(true);
        setVerifying(false);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard?verified=true');
        }, 3000);

      } catch (error: unknown) {
        console.error('❌ Email verification failed:', error);
        const friendlyError = getFirebaseAuthError(error as { code?: string; message?: string });
        setError(`${friendlyError.title}: ${friendlyError.message}${friendlyError.suggestion ? ` ${friendlyError.suggestion}` : ''}`);
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [oobCode, router]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-128.png"
                alt="SpendFlow Logo"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">
              Verifying Your Email
            </h2>
            <p className="text-slate-400 text-sm tracking-wider">
              Please wait while we verify your email address...
            </p>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-128.png"
                alt="SpendFlow Logo"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>

            <div className="mb-8">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">
                Email Verified Successfully!
              </h2>
              <p className="text-slate-400 text-sm tracking-wider">
                Welcome to SpendFlow! Redirecting to your dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-128.png"
              alt="SpendFlow Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">
            Verification Failed
          </h2>
          <p className="text-slate-400 text-sm tracking-wider mb-8">
            We couldn't verify your email address.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/30 p-4 backdrop-blur-sm">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-8 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-serif text-slate-100 mb-4">What would you like to do?</h3>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full px-4 py-3 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif tracking-widest uppercase text-sm transition-all text-center"
              >
                Request New Verification Email
              </Link>

              <Link
                href="/login"
                className="block w-full px-4 py-3 border border-slate-600 text-slate-300 bg-slate-800/50 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 font-serif tracking-widest uppercase text-sm transition-all text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm font-serif italic">
            &quot;Email verification helps keep your account secure.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
