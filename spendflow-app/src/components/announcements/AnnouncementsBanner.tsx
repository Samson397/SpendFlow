'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  audience: 'all' | 'free' | 'pro' | 'enterprise';
  startDate: { toDate: () => Date } | Date;
  endDate: { toDate: () => Date } | Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>('free');
  const { user } = useAuth();

  // Load dismissed announcements from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDismissed = localStorage.getItem('dismissedAnnouncements');
      if (savedDismissed) {
        try {
          const parsed = JSON.parse(savedDismissed);
          if (Array.isArray(parsed)) {
            setDismissedAnnouncements(parsed);
            console.log('Loaded dismissed announcements from localStorage:', parsed);
          }
        } catch (error) {
          console.error('Error parsing dismissed announcements:', error);
          localStorage.removeItem('dismissedAnnouncements');
        }
      }
    }
  }, []);

  // Get user subscription tier
  useEffect(() => {
    const getUserTier = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            const tier = userData?.subscription?.tier || 'free';
            setUserTier(tier);
            console.log('User tier set to:', tier);
          }
        } catch (error) {
          console.error('Error getting user tier:', error);
          setUserTier('free'); // Default to free tier
        }
      } else {
        setUserTier('free'); // Default for non-authenticated users
      }
    };

    getUserTier();
  }, [user]);

  // Fetch announcements from Firestore with real-time updates
  useEffect(() => {
    const fetchAnnouncements = () => {
      console.log('Setting up real-time announcements listener...');
      const now = new Date();
      const q = query(
        collection(db, 'announcements'),
        where('isActive', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        orderBy('startDate', 'desc'),
        limit(3)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log('Real-time announcements update:', querySnapshot.docs.length, 'announcements found');
        
        const announcementsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore timestamps to Date objects if needed
          const announcement: any = {
            id: doc.id,
            ...data,
          };
          
          // Convert Firestore timestamps to Date objects
          ['startDate', 'endDate', 'createdAt'].forEach(field => {
            if (announcement[field]?.toDate) {
              announcement[field] = announcement[field].toDate();
            }
          });
          
          console.log('Processed announcement:', announcement);
          return announcement;
        }) as Announcement[];

        console.log('Setting announcements from real-time update:', announcementsData);
        setAnnouncements(announcementsData);
        setLoading(false);
      }, (error) => {
        console.error('Error in real-time announcements listener:', error);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchAnnouncements();

    // Cleanup function to unsubscribe from real-time listener
    return () => {
      console.log('Cleaning up announcements real-time listener');
      unsubscribe();
    };
  }, []);

  // Filter announcements based on user tier
  const filteredAnnouncements = announcements.filter(announcement => {
    // Always show 'all' audience announcements
    if (announcement.audience === 'all') return true;
    
    // Show announcements matching user's subscription tier
    return announcement.audience === userTier;
  });

  // Fetch announcements from Firestore

  const dismissAnnouncement = async (id: string) => {
    try {
      // Optimistic UI update
      setDismissedAnnouncements(prev => [...prev, id]);
      
      // Save to localStorage for offline support
      const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
      const newDismissed = [...dismissed, id];
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
      
      // Save to Firebase if user is authenticated
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          dismissedAnnouncements: arrayUnion(id),
          updatedAt: serverTimestamp()
        });
        console.log('Announcement dismissal saved to Firebase');
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
      // Revert optimistic update on error
      setDismissedAnnouncements(prev => prev.filter(docId => docId !== id));
    }
  };

  if (loading) {
    console.log('Still loading announcements...');
    return null;
  }

  console.log('Announcements loaded:', announcements);
  console.log('Filtered announcements by user tier:', filteredAnnouncements);

  const visibleAnnouncements = filteredAnnouncements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  console.log('Final visible announcements after dismissal filter:', visibleAnnouncements);

  if (visibleAnnouncements.length === 0) {
    console.log('No visible announcements to display');
    return null;
  }

  const getRelativeTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
      
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
      return `${Math.floor(seconds / 2592000)}mo ago`;
    } catch (error) {
      console.error('Error calculating relative time:', error);
      return 'Unknown';
    }
  };

  const getTypeStyles = (type: string) => {
    const baseStyles = 'relative overflow-hidden bg-white shadow-2xl';

    switch (type) {
      case 'warning':
        return `${baseStyles} border-l-4 border-amber-400`;
      case 'critical':
        return `${baseStyles} border-l-4 border-red-500`;
      case 'success':
        return `${baseStyles} border-l-4 border-emerald-500`;
      case 'info':
      default:
        return `${baseStyles} border-l-4 border-sky-500`;
    }
  };

  // Animation variants for framer-motion
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
        mass: 0.5
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {visibleAnnouncements.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl"
            onClick={() => dismissAnnouncement(visibleAnnouncements[0].id)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-w-lg w-full mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Premium background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/80 via-white/60 to-slate-50/80" />

              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                visibleAnnouncements[0].type === 'warning' ? 'from-amber-500/8 via-amber-400/12 to-amber-300/8' :
                visibleAnnouncements[0].type === 'critical' ? 'from-red-500/8 via-red-400/12 to-red-300/8' :
                visibleAnnouncements[0].type === 'success' ? 'from-emerald-500/8 via-emerald-400/12 to-emerald-300/8' :
                'from-sky-500/8 via-sky-400/12 to-sky-300/8'
              }`} />

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.3)_1px,transparent_0)] bg-[length:24px_24px]" />

              {/* Inner glow effect */}
              <div className={`absolute inset-1 rounded-3xl bg-gradient-to-br ${
                visibleAnnouncements[0].type === 'warning' ? 'from-amber-200/20 via-transparent to-amber-100/10' :
                visibleAnnouncements[0].type === 'critical' ? 'from-red-200/20 via-transparent to-red-100/10' :
                visibleAnnouncements[0].type === 'success' ? 'from-emerald-200/20 via-transparent to-emerald-100/10' :
                'from-sky-200/20 via-transparent to-sky-100/10'
              }`} />

              {/* Type-specific accent border */}
              <div className={`absolute inset-0 rounded-3xl border-2 ${
                visibleAnnouncements[0].type === 'warning' ? 'border-amber-300/30' :
                visibleAnnouncements[0].type === 'critical' ? 'border-red-300/30' :
                visibleAnnouncements[0].type === 'success' ? 'border-emerald-300/30' :
                'border-sky-300/30'
              }`} />

              <div className="relative z-10 p-10">
                {/* Header with integrated megaphone and type */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`relative p-4 rounded-2xl shadow-lg ${
                      visibleAnnouncements[0].type === 'warning' ? 'bg-gradient-to-br from-amber-100 to-amber-200 shadow-amber-500/20' :
                      visibleAnnouncements[0].type === 'critical' ? 'bg-gradient-to-br from-red-100 to-red-200 shadow-red-500/20' :
                      visibleAnnouncements[0].type === 'success' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-emerald-500/20' :
                      'bg-gradient-to-br from-sky-100 to-sky-200 shadow-sky-500/20'
                    }`}>
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                      {/* Type indicator overlay */}
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        visibleAnnouncements[0].type === 'warning' ? 'bg-amber-500' :
                        visibleAnnouncements[0].type === 'critical' ? 'bg-red-500' :
                        visibleAnnouncements[0].type === 'success' ? 'bg-emerald-500' :
                        'bg-sky-500'
                      }`}>
                        {visibleAnnouncements[0].type === 'warning' ? '!' :
                         visibleAnnouncements[0].type === 'critical' ? '‼' :
                         visibleAnnouncements[0].type === 'success' ? '✓' :
                         'ℹ'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {visibleAnnouncements[0].type === 'warning' ? 'Important Notice' :
                         visibleAnnouncements[0].type === 'critical' ? 'Critical Alert' :
                         visibleAnnouncements[0].type === 'success' ? 'Great News' :
                         'Announcement'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getRelativeTime(visibleAnnouncements[0].createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => dismissAnnouncement(visibleAnnouncements[0].id)}
                    className="p-3 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {visibleAnnouncements[0].title}
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-gray-300 to-gray-400 mx-auto rounded-full"></div>
                  </div>

                  <p className="text-gray-700 text-lg leading-relaxed max-w-md mx-auto font-medium">
                    {visibleAnnouncements[0].content}
                  </p>

                  {/* Premium action button */}
                  <div className="pt-4">
                    <button
                      onClick={() => dismissAnnouncement(visibleAnnouncements[0].id)}
                      className={`group relative px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                        visibleAnnouncements[0].type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/50' :
                        visibleAnnouncements[0].type === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/50' :
                        visibleAnnouncements[0].type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/50' :
                        'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/50'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Got it, thanks!
                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      {/* Button shine effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </button>
                  </div>

                  {/* Multiple announcements indicator with premium styling */}
                  {visibleAnnouncements.length > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: Math.min(visibleAnnouncements.length - 1, 3) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-gray-300 border border-white"></div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {visibleAnnouncements.length - 1} more announcement{visibleAnnouncements.length - 1 > 1 ? 's' : ''} available
                      </p>
                    </div>
                  )}
                </div>

                {/* Decorative elements */}
                <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 -z-10 ${
                  visibleAnnouncements[0].type === 'warning' ? 'bg-amber-400' :
                  visibleAnnouncements[0].type === 'critical' ? 'bg-red-400' :
                  visibleAnnouncements[0].type === 'success' ? 'bg-emerald-400' :
                  'bg-sky-400'
                }`} />
                <div className={`absolute -left-2 -bottom-2 h-12 w-12 rounded-full opacity-20 -z-10 ${
                  visibleAnnouncements[0].type === 'warning' ? 'bg-amber-400' :
                  visibleAnnouncements[0].type === 'critical' ? 'bg-red-400' :
                  visibleAnnouncements[0].type === 'success' ? 'bg-emerald-400' :
                  'bg-sky-400'
                }`} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
