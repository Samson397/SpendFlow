/**
 * Firebase Auth Error Utilities
 *
 * Converts Firebase authentication error codes into user-friendly messages
 */

export interface FirebaseError {
  code: string;
  message: string;
}

export interface FriendlyError {
  title: string;
  message: string;
  suggestion?: string;
}

/**
 * Converts Firebase auth error codes to user-friendly messages
 */
export function getFirebaseAuthError(error: FirebaseError | unknown): FriendlyError {
  const errorObj = error as any;
  const errorCode = errorObj?.code || errorObj?.message || 'unknown';

  // Firebase Auth error mappings
  const errorMap: Record<string, FriendlyError> = {
    // Authentication errors
    'auth/invalid-credential': {
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect.',
      suggestion: 'Please check your email and password and try again.'
    },
    'auth/user-disabled': {
      title: 'Account Disabled',
      message: 'Your account has been disabled.',
      suggestion: 'Please contact support for assistance.'
    },
    'auth/user-not-found': {
      title: 'Account Not Found',
      message: 'No account found with this email address.',
      suggestion: 'Please check your email or create a new account.'
    },
    'auth/wrong-password': {
      title: 'Incorrect Password',
      message: 'The password you entered is incorrect.',
      suggestion: 'Please try again or reset your password.'
    },
    'auth/invalid-email': {
      title: 'Invalid Email',
      message: 'Please enter a valid email address.',
      suggestion: 'Make sure your email follows the format: name@example.com'
    },
    'auth/email-already-in-use': {
      title: 'Email Already in Use',
      message: 'An account with this email already exists.',
      suggestion: 'Try signing in instead, or use a different email address.'
    },
    'auth/weak-password': {
      title: 'Weak Password',
      message: 'Your password is too weak.',
      suggestion: 'Please use at least 6 characters with a mix of letters and numbers.'
    },
    'auth/operation-not-allowed': {
      title: 'Operation Not Allowed',
      message: 'This sign-in method is not enabled.',
      suggestion: 'Please contact support for assistance.'
    },
    'auth/account-exists-with-different-credential': {
      title: 'Account Exists',
      message: 'An account already exists with this email using a different sign-in method.',
      suggestion: 'Try signing in with the original method you used to create this account.'
    },

    // Network and connection errors
    'auth/network-request-failed': {
      title: 'Connection Error',
      message: 'Unable to connect to our servers.',
      suggestion: 'Please check your internet connection and try again.'
    },
    'auth/timeout': {
      title: 'Request Timeout',
      message: 'The request timed out.',
      suggestion: 'Please try again in a moment.'
    },

    // Verification errors
    'auth/requires-recent-login': {
      title: 'Re-authentication Required',
      message: 'For security reasons, please sign in again.',
      suggestion: 'Please sign out and sign back in to continue.'
    },
    'auth/email-not-verified': {
      title: 'Email Not Verified',
      message: 'Please verify your email address before continuing.',
      suggestion: 'Check your email for a verification link.'
    },

    // Password reset errors
    'auth/expired-action-code': {
      title: 'Expired Link',
      message: 'This password reset link has expired.',
      suggestion: 'Please request a new password reset link.'
    },
    'auth/invalid-action-code': {
      title: 'Invalid Link',
      message: 'This password reset link is invalid.',
      suggestion: 'Please request a new password reset link.'
    },
    'auth/user-mismatch': {
      title: 'User Mismatch',
      message: 'This link is for a different user.',
      suggestion: 'Please make sure you\'re signed in with the correct account.'
    },
    'auth/missing-email': {
      title: 'Email Required',
      message: 'Please enter your email address.',
      suggestion: 'Enter your email address to receive a password reset link.'
    },

    // Sign out errors
    'auth/insufficient-permission': {
      title: 'Sign Out Error',
      message: 'There was an issue signing you out.',
      suggestion: 'Try refreshing the page and signing out again.'
    },

    // Generic errors
    'auth/too-many-requests': {
      title: 'Too Many Attempts',
      message: 'Too many failed attempts. Please try again later.',
      suggestion: 'Wait a few minutes before trying again.'
    },
    'auth/internal-error': {
      title: 'Server Error',
      message: 'An internal error occurred.',
      suggestion: 'Please try again in a moment. If the problem persists, contact support.'
    }
  };

  // Check for exact matches first
  if (errorMap[errorCode]) {
    return errorMap[errorCode];
  }

  // Check for partial matches (some error codes might have additional context)
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorCode.includes(key.split('/')[1])) {
      return value;
    }
  }

  // Default fallback error
  return {
    title: 'Authentication Error',
    message: 'An unexpected error occurred during authentication.',
    suggestion: 'Please try again. If the problem persists, contact support.'
  };
}

/**
 * Get a simple error message for toast notifications
 */
export function getFirebaseAuthErrorMessage(error: FirebaseError | unknown): string {
  const friendlyError = getFirebaseAuthError(error);
  return `${friendlyError.title}: ${friendlyError.message}`;
}

/**
 * Hook for handling Firebase auth errors in React components
 */
export function useFirebaseAuthError() {
  const handleAuthError = (error: FirebaseError | unknown) => {
    const friendlyError = getFirebaseAuthError(error);
    return {
      title: friendlyError.title,
      message: friendlyError.message,
      suggestion: friendlyError.suggestion,
      fullMessage: `${friendlyError.title}: ${friendlyError.message}${friendlyError.suggestion ? ` ${friendlyError.suggestion}` : ''}`
    };
  };

  return { handleAuthError, getFirebaseAuthError, getFirebaseAuthErrorMessage };
}
