'use client';

import { useEffect, useState } from 'react';
import { X, Megaphone, Clock } from 'lucide-react';
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
    const baseStyles = 'relative overflow-hidden group transform hover:scale-[1.01] transition-all duration-300 border border-white/20';
    
    switch (type) {
      case 'warning':
        return `${baseStyles} bg-gradient-to-br from-amber-500/20 via-amber-400/25 to-amber-300/30 border-l-4 border-amber-400 shadow-lg shadow-amber-500/10`;
      case 'critical':
        return `${baseStyles} bg-gradient-to-br from-red-600/20 via-red-500/25 to-red-400/30 border-l-4 border-red-500 shadow-lg shadow-red-500/10`;
      case 'success':
        return `${baseStyles} bg-gradient-to-br from-emerald-600/20 via-emerald-500/25 to-emerald-400/30 border-l-4 border-emerald-500 shadow-lg shadow-emerald-500/10`;
      case 'info':
      default:
        return `${baseStyles} bg-gradient-to-br from-sky-600/20 via-sky-500/25 to-sky-400/30 border-l-4 border-sky-500 shadow-lg shadow-sky-500/10`;
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
    <div className="w-full bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-b border-amber-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <motion.div 
          className="space-y-3 py-1"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {visibleAnnouncements.map((announcement, index) => {
            const gradientColors = {
              warning: 'from-amber-500/5 via-amber-400/10 to-amber-300/20',
              critical: 'from-red-500/5 via-red-400/10 to-red-300/20',
              success: 'from-emerald-500/5 via-emerald-400/10 to-emerald-300/20',
              info: 'from-sky-500/5 via-sky-400/10 to-sky-300/20',
              default: 'from-slate-500/5 via-slate-400/10 to-slate-300/20'
            };
            
            const typeColor = announcement.type in gradientColors 
              ? gradientColors[announcement.type as keyof typeof gradientColors] 
              : gradientColors.default;

            return (
              <motion.div
                key={announcement.id}
                variants={item}
                className={`relative rounded-xl p-5 backdrop-blur-sm ${getTypeStyles(announcement.type)}`}
                whileHover={{
                  y: -2,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${typeColor} opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10`} />
                
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/20 to-pink-400/20 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition duration-300 -z-20" />
                
                <div className="relative z-10">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-white/80 shadow-md flex items-center justify-center backdrop-blur-sm">
                        <Megaphone className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="text-base font-bold text-gray-900">
                          {announcement.title}
                        </h3>
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200/50">
                          New
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                        {announcement.content}
                      </p>
                      <div className="mt-2.5 flex items-center text-xs font-medium text-gray-600">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        <span>{getRelativeTime(announcement.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        className="group relative inline-flex items-center justify-center rounded-full p-1.5 text-gray-500 hover:bg-white/70 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAnnouncement(announcement.id);
                        }}
                      >
                        <span className="absolute -inset-1 rounded-full bg-amber-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <X className="h-4 w-4 relative" aria-hidden="true" />
                        <span className="sr-only">Dismiss</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Animated border bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                
                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-200/30 -z-10" />
                <div className="absolute -left-2 -bottom-2 h-12 w-12 rounded-full bg-pink-200/30 -z-10" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
