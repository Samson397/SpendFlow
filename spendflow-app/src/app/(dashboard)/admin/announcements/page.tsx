'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ShieldCheckIcon, ArrowLeftIcon, SparklesIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  audience: 'all' | 'free' | 'pro' | 'enterprise';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

type AnnouncementFormData = {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  audience: 'all' | 'free' | 'pro' | 'enterprise';
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    type: 'info',
    audience: 'all',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7 days from now
    isActive: true
  });

  // Check admin access
  const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    loadAnnouncements();
  }, [user, isAdmin, router]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const announcementsRef = collection(db, 'announcements');
      const announcementsQuery = query(announcementsRef, orderBy('createdAt', 'desc'));
      const announcementsSnapshot = await getDocs(announcementsQuery);

      const announcementsData: Announcement[] = announcementsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          type: data.type || 'info',
          audience: data.audience || 'all',
          startDate: data.startDate ? new Date(data.startDate.seconds * 1000) : new Date(),
          endDate: data.endDate ? new Date(data.endDate.seconds * 1000) : new Date(),
          isActive: data.isActive ?? true,
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
          createdBy: data.createdBy || ''
        };
      });

      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const announcementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        audience: formData.audience,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        isActive: formData.isActive,
        createdBy: user?.email || 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingAnnouncement) {
        // Update existing announcement
        await updateDoc(doc(db, 'announcements', editingAnnouncement.id), {
          ...announcementData,
          updatedAt: serverTimestamp()
        });
        toast.success('Announcement updated successfully!');
      } else {
        // Create new announcement
        await addDoc(collection(db, 'announcements'), announcementData);
        toast.success('Announcement created successfully!');
      }

      // Reset form and reload
      resetForm();
      loadAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      audience: 'all',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isActive: true
    });
    setEditingAnnouncement(null);
    setShowCreateForm(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      audience: announcement.audience,
      startDate: announcement.startDate.toISOString().slice(0, 16),
      endDate: announcement.endDate.toISOString().slice(0, 16),
      isActive: announcement.isActive
    });
    setEditingAnnouncement(announcement);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast.success('Announcement deleted successfully!');
      loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      await updateDoc(doc(db, 'announcements', announcement.id), {
        isActive: !announcement.isActive,
        updatedAt: serverTimestamp()
      });
      toast.success(`Announcement ${!announcement.isActive ? 'activated' : 'deactivated'}!`);
      loadAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      toast.error('Failed to update announcement status');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-900/30 text-red-400';
      case 'warning': return 'bg-yellow-900/30 text-yellow-400';
      case 'success': return 'bg-green-900/30 text-green-400';
      default: return 'bg-blue-900/30 text-blue-400';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'free': return 'bg-green-900/30 text-green-400';
      case 'pro': return 'bg-purple-900/30 text-purple-400';
      case 'enterprise': return 'bg-orange-900/30 text-orange-400';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-slate-100 mb-2">Access Denied</h1>
          <p className="text-slate-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Admin Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-serif tracking-wide">ADMIN</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-slate-100 mb-2 tracking-wide">
              Announcements
            </h1>
            <p className="text-slate-400 text-sm tracking-wider">
              Create and manage system-wide announcements for users
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Create Announcement
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-slate-100">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Announcement content..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free Users</option>
                    <option value="pro">Pro Users</option>
                    <option value="enterprise">Enterprise Users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 bg-slate-800 border-slate-700 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                >
                  {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-xl font-serif text-slate-100">All Announcements</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-300 mb-2">No Announcements Yet</h3>
              <p className="text-slate-400 text-sm mb-4">
                Create your first announcement to communicate with users.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Create First Announcement
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-slate-100">{announcement.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                          {announcement.type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAudienceColor(announcement.audience)}`}>
                          {announcement.audience}
                        </span>
                        {!announcement.isActive && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{announcement.content}</p>
                      <div className="text-xs text-slate-500">
                        Created: {announcement.createdAt.toLocaleDateString()} •
                        Expires: {announcement.endDate.toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(announcement)}
                        className={`p-1 rounded ${announcement.isActive ? 'text-green-400 hover:bg-green-900/30' : 'text-slate-400 hover:bg-slate-700'}`}
                        title={announcement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.isActive ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-1 rounded text-blue-400 hover:bg-blue-900/30"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-1 rounded text-red-400 hover:bg-red-900/30"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
