'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { AuthGate } from '@/components/auth/AuthGate';
import { alertsService } from '@/lib/alerts';
import { getFirebaseAuthError } from '@/lib/utils/firebaseAuthErrors';

function SignupContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registrationEnabled, setRegistrationEnabled] = useState(true); // Default to enabled
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Check if registration is enabled
  useEffect(() => {
    const checkRegistrationEnabled = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'app');
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const settings = settingsDoc.data();
          const enabled = settings['registrationEnabled'] !== false; // Default to true if not set
          setRegistrationEnabled(enabled);
          console.log('Registration enabled:', enabled);
        } else {
          // No settings document, default to enabled
          setRegistrationEnabled(true);
          console.log('No settings found, registration enabled by default');
        }
      } catch (error) {
        console.error('Error checking registration settings:', error);
        // On error, default to enabled to not block users
        setRegistrationEnabled(true);
      }
    };

    checkRegistrationEnabled();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return () => {}; // Return empty cleanup function for other cases
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/dashboard?verified=true`,
        });
        setResendCooldown(60); // 60 seconds cooldown
        setError('');
      }
    } catch (error) {
      setError('Failed to resend verification email. Please try again.');
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard?verified=true`,
      });
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: name,
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email,
        emailVerified: false, // Track verification status in Firestore
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currency: 'USD', // Default currency
      });
      
      // Generate alert for new user registration
      try {
        await alertsService.userRegistered(user.uid, user.email || 'Unknown', 'free');
      } catch (alertError) {
        console.warn('Failed to create registration alert:', alertError);
        // Don't fail registration if alert creation fails
      }

      // Check if user is admin and redirect accordingly
      // (Admin check removed for email signup - handled in verification flow)

      // Show verification message instead of redirecting
      setVerificationSent(true);
    } catch (error: any) {
      const friendlyError = getFirebaseAuthError(error);
      setError(`${friendlyError.title}: ${friendlyError.message}${friendlyError.suggestion ? ` ${friendlyError.suggestion}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create user document in Firestore if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        currency: 'USD', // Default currency
      }, { merge: true });
      
      // Generate alert for new user registration via Google
      try {
        await alertsService.userRegistered(user.uid, user.email || 'Unknown', 'free');
      } catch (alertError) {
        console.warn('Failed to create Google registration alert:', alertError);
        // Don't fail registration if alert creation fails
      }

      // Check if user is admin and redirect accordingly
      const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];

      const isAdmin = user.email ? adminEmails.includes(user.email) : false;

      router.replace(isAdmin ? '/admin' : '/dashboard');
    } catch (error: any) {
      const friendlyError = getFirebaseAuthError(error);
      setError(`${friendlyError.title}: ${friendlyError.message}${friendlyError.suggestion ? ` ${friendlyError.suggestion}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            We&apos;ve sent a verification link to {email}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-slate-100">Check your email</h3>
              <p className="mt-1 text-sm text-slate-400">
                We&apos;ve sent a verification link to <span className="font-medium text-slate-200">{email}</span>.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    resendCooldown > 0 
                      ? 'bg-slate-600 cursor-not-allowed' 
                      : 'bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                  }`}
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Verification Email'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setVerificationSent(false);
                    setLoading(false);
                    setError('');
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Back to Sign Up
                </button>
                
                {error && (
                  <div className="text-red-400 text-sm text-center mt-2">
                    {error}
                  </div>
                )}
                
                <div className="text-xs text-slate-500 mt-4 text-center">
                  <p>Didn&apos;t receive the email? Check your spam folder.</p>
                  <p>Make sure to check the email you used to sign up: <span className="text-slate-300">{email}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If registration is disabled, show disabled message
  if (!registrationEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            <h1 className="text-5xl font-serif text-slate-100 mb-4 tracking-wide">
              S P E N D F L O W
            </h1>
            <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">
              Registration Disabled
            </h2>
          </div>

          {/* Disabled Message */}
          <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-slate-100 mb-2">
                New Registrations Temporarily Disabled
              </h3>
              <p className="text-slate-400 text-sm tracking-wide">
                We&apos;re currently not accepting new user registrations. Please check back later or contact support if you believe this is an error.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif tracking-widest uppercase text-sm transition-all"
              >
                Go to Login
              </Link>
            </div>
          </div>

          {/* Quote */}
          <div className="text-center pt-8 border-t border-slate-800">
            <p className="text-slate-500 text-sm font-serif italic">
              &quot;Thank you for your interest in SpendFlow.&quot;
            </p>
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
          <h1 className="text-5xl font-serif text-slate-100 mb-4 tracking-wide">
            S P E N D F L O W
          </h1>
          <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">
            Join Us
          </h2>
          <p className="text-slate-400 text-sm tracking-wider">
            Create your account to start managing your finances
          </p>
          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-serif text-amber-400 hover:text-amber-300 tracking-wide">
              Sign in
            </Link>
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
        
        {/* Signup Form */}
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-8 space-y-6">
          {/* Google Signup */}
          <div>
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-slate-700 text-sm font-serif tracking-wider bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </span>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900/50 text-slate-500 tracking-widest uppercase">Or sign up with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="space-y-4" onSubmit={handleEmailSignup}>
            <div>
              <label htmlFor="name" className="block text-xs tracking-widest uppercase text-slate-500 mb-2 font-serif">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email-address" className="block text-xs tracking-widest uppercase text-slate-500 mb-2 font-serif">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs tracking-widest uppercase text-slate-500 mb-2 font-serif">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Minimum 6 characters"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-xs tracking-widest uppercase text-slate-500 mb-2 font-serif">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="flex items-start pt-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 bg-slate-800 border-slate-700 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-slate-400 tracking-wide">
                I agree to the{' '}
                <a href="#" className="text-amber-400 hover:text-amber-300 font-serif">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-amber-400 hover:text-amber-300 font-serif">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif tracking-widest uppercase text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Quote */}
        <div className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm font-serif italic">
            &quot;Begin your journey to financial excellence.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <AuthGate requireAuth={false}>
      <SignupContent />
    </AuthGate>
  );
}
