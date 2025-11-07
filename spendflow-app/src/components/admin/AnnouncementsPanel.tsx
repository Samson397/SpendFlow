'use client';

import { useState, useEffect } from 'react';
import { format, addDays, isAfter, isBefore, isToday, isTomorrow } from 'date-fns';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/firebase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'update';
  audience: 'all' | 'free' | 'pro' | 'enterprise';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export default function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'maintenance' | 'update',
    audience: 'all' as 'all' | 'free' | 'pro' | 'enterprise',
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    isActive: true
  });

  const filteredAnnouncements = announcements
    .filter(announcement => 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(announcement => 
      selectedType === 'all' || announcement.type === selectedType
    )
    .filter(announcement => 
      selectedAudience === 'all' || announcement.audience === selectedAudience
    );

  const toggleAnnouncementStatus = async (id: string) => {
    try {
      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return;
      
      const newStatus = !announcement.isActive;
      
      // Update in Firestore
      await updateDoc(doc(db, 'announcements', id), {
        isActive: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setAnnouncements(announcements.map(a => 
        a.id === id ? { ...a, isActive: newStatus } : a
      ));
    } catch (error) {
      console.error('Error toggling announcement status:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to create an announcement');
        return;
      }

      const announcementData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        audience: formData.audience,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive,
        createdAt: serverTimestamp(),
        createdBy: user.email || 'unknown@example.com',
        createdById: user.uid
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'announcements'), announcementData);
      
      // Reset form (real-time listener will update the list automatically)
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        audience: 'all',
        startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
        isActive: true
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement. Please try again.');
    }
  };

  // Load announcements from Firestore with real-time updates
  useEffect(() => {
    console.log('Setting up admin announcements real-time listener...');
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('Admin real-time announcements update:', querySnapshot.docs.length, 'announcements found');
      const loadedAnnouncements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Announcement[];
      setAnnouncements(loadedAnnouncements);
      setLoading(false);
    }, (error) => {
      console.error('Error in admin real-time announcements listener:', error);
      setLoading(false);
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up admin announcements real-time listener');
      unsubscribe();
    };
  }, []);

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete from Firestore (real-time listener will update the list automatically)
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement. Please try again.');
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all':
        return <span className="text-sm">🌍</span>;
      case 'pro':
        return <span className="text-sm">👥</span>;
      case 'enterprise':
        return <span className="text-sm">🏢</span>;
      default:
        return <span className="text-sm">👥</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (type) {
      case 'info':
        return (
          <span className={`${baseClasses} bg-blue-900/30 text-blue-400`}>
            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx={4} cy={4} r={3} />
            </svg>
            Information
          </span>
        );
      case 'warning':
        return (
          <span className={`${baseClasses} bg-amber-900/30 text-amber-400`}>
            <span className="text-xs">⚠️</span>
            Warning
          </span>
        );
      case 'maintenance':
        return (
          <span className={`${baseClasses} bg-purple-900/30 text-purple-400`}>
            <svg className="-ml-0.5 mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Maintenance
          </span>
        );
      case 'update':
        return (
          <span className={`${baseClasses} bg-green-900/30 text-green-400`}>
            <svg className="-ml-0.5 mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Update
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-slate-800/50 text-slate-400`}>
            {type}
          </span>
        );
    }
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = format(startDate, 'MMM d, yyyy h:mm a');
    const end = format(endDate, 'MMM d, yyyy h:mm a');
    
    if (isToday(startDate) && isToday(endDate)) {
      return `Today, ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
    } else if (isTomorrow(startDate) && isTomorrow(endDate)) {
      return `Tomorrow, ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
    } else if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return `${format(startDate, 'MMM d, yyyy')}, ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
    } else {
      return `${start} - ${end}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Announcements</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage system-wide announcements and notifications
          </p>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <span className="text-sm">+</span>
            New Announcement
          </button>
        </div>
      </div>

      {/* Announcement List */}
      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl">📣</span>
          <h3 className="mt-2 text-sm font-medium text-slate-300">No announcements</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating a new announcement.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <span className="text-sm">+</span>
              New Announcement
            </button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-slate-800">
          {filteredAnnouncements.map((announcement) => (
            <li key={announcement.id} className="py-4">
              <div className="flex items-start">
                <div className="ml-4 w-full">
                  <div className="flex items-center">
                    <h3 className="text-base font-medium text-slate-100">{announcement.title}</h3>
                    <div className="ml-2">
                      {getTypeBadge(announcement.type)}
                    </div>
                    <div className="ml-auto flex items-center">
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id={`toggle-${announcement.id}`}
                          checked={announcement.isActive}
                          onChange={() => toggleAnnouncementStatus(announcement.id)}
                          className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor={`toggle-${announcement.id}`}
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${announcement.isActive ? 'bg-amber-600' : 'bg-slate-700'}`}
                        ></label>
                      </div>
                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Delete announcement"
                      >
                        <span className="text-sm">×</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-slate-300">
                      {announcement.content.length > 200 
                        ? `${announcement.content.substring(0, 200)}...` 
                        : announcement.content}
                    </p>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Created by {announcement.createdBy} on {format(announcement.createdAt, 'MMM d, yyyy')}</span>
                    <div className="flex items-center space-x-2">
                      <button className="text-amber-400 hover:text-amber-300">Edit</button>
                      <span>•</span>
                      <button className="text-amber-400 hover:text-amber-300">Duplicate</button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-100">New Announcement</h3>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-300"
                  onClick={() => setShowCreateModal(false)}
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
              
              <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={5}
                    className="block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter announcement content (supports Markdown)"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="type-info"
                          name="type"
                          type="radio"
                          value="info"
                          checked={formData.type === 'info'}
                          onChange={handleInputChange}
                          className="h-4 w-4 border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="type-info" className="ml-2 block text-sm text-slate-300">
                          Information
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="type-warning"
                          name="type"
                          type="radio"
                          value="warning"
                          checked={formData.type === 'warning'}
                          onChange={handleInputChange}
                          className="h-4 w-4 border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="type-warning" className="ml-2 block text-sm text-slate-300">
                          Warning
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="type-maintenance"
                          name="type"
                          type="radio"
                          value="maintenance"
                          checked={formData.type === 'maintenance'}
                          onChange={handleInputChange}
                          className="h-4 w-4 border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="type-maintenance" className="ml-2 block text-sm text-slate-300">
                          Maintenance
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="type-update"
                          name="type"
                          type="radio"
                          value="update"
                          checked={formData.type === 'update'}
                          onChange={handleInputChange}
                          className="h-4 w-4 border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="type-update" className="ml-2 block text-sm text-slate-300">
                          Update
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Audience <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="audience"
                      value={formData.audience}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Users</option>
                      <option value="free">Free Tier Only</option>
                      <option value="pro">Pro Tier Only</option>
                      <option value="enterprise">Enterprise Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-slate-300 mb-1">
                      Start Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="start-date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-slate-300 mb-1">
                      End Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="end-date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate}
                      className="block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-slate-300">
                    Active (visible to users)
                  </label>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-slate-700 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Create Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Toggle switch styles
const styles = `
  .toggle-checkbox:checked {
    transform: translateX(100%);
    background-color: #f59e0b;
  }
  
  .toggle-checkbox:checked + .toggle-label {
    background-color: #f59e0b;
  }
`;

// Add styles to the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}
