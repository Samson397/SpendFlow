'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, doc, updateDoc, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, ArrowLeftIcon, TagIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Reply, Send, X } from 'lucide-react';
import Link from 'next/link';

interface ContactMessage {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

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

    loadMessages();
  }, [user, isAdmin, router]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, 'contactMessages');
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);

      const messagesData: ContactMessage[] = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail || data.email || '',
          userName: data.userName || data.name || 'Unknown',
          subject: data.subject || 'No Subject',
          message: data.message || '',
          status: data.status || 'unread',
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
        };
      });

      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'read',
        updatedAt: Timestamp.now(),
      });

      toast.success('Message marked as read');
      loadMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleMarkAsUnread = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'unread',
        updatedAt: Timestamp.now(),
      });

      toast.success('Message marked as unread');
      loadMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'archived',
        updatedAt: Timestamp.now(),
      });

      toast.success('Message archived');
      loadMessages();
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Failed to archive message');
    }
  };

  const sendReply = async (messageId: string, userId: string, userName: string, userEmail: string) => {
    if (!replyText.trim()) return;

    setSendingReply(true);
    try {
      // Store reply in Firestore for in-app viewing
      await addDoc(collection(db, 'messages'), {
        from: 'admin',
        to: userId,
        subject: `Re: ${selectedMessage?.subject || 'Your message'}`,
        body: replyText.trim(),
        read: false,
        hasAttachment: false,
        labels: ['admin-reply'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminName: user?.displayName || 'SpendFlow Support',
        originalMessageId: messageId,
        userId: userId
      });

      // Also send email notification
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'send_custom',
            to: userEmail,
            subject: `Re: ${selectedMessage?.subject || 'Your message'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">SpendFlow Support</h1>
                </div>
                <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName},</h2>
                  <p>Thank you for contacting SpendFlow support. Here's our response to your message:</p>

                  <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #374151;">Your Original Message:</h3>
                    <p style="color: #6b7280; margin-bottom: 0;">${selectedMessage?.message}</p>
                  </div>

                  <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #92400e;">Our Response:</h3>
                    <p style="color: #92400e; margin-bottom: 0; white-space: pre-wrap;">${replyText.trim()}</p>
                  </div>

                  <p>You can also view this message in your SpendFlow inbox.</p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages"
                       style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      View in App
                    </a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; text-align: center;">
                    Best regards,<br>
                    The SpendFlow Support Team
                  </p>
                </div>
              </div>
            `
          })
        });
      } catch (emailError) {
        console.warn('Email notification failed, but message was saved:', emailError);
      }

      // Update original message status to replied
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'replied',
        updatedAt: new Date()
      });

      // Reset reply state
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply sent successfully! User can view it in their inbox.');
      loadMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-900/30 text-red-400';
      case 'read':
        return 'bg-green-900/30 text-green-400';
      case 'replied':
        return 'bg-blue-900/30 text-blue-400';
      case 'archived':
        return 'bg-slate-700 text-slate-300';
      default:
        return 'bg-slate-700 text-slate-300';
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
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-slate-100 mb-2 tracking-wide">
            Message Management
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            View and manage user contact messages
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Messages</p>
                <p className="text-2xl font-bold text-slate-100">{messages.length}</p>
              </div>
              <TagIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Unread</p>
                <p className="text-2xl font-bold text-slate-100">{messages.filter(m => m.status === 'unread').length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-400"></div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Read</p>
                <p className="text-2xl font-bold text-slate-100">{messages.filter(m => m.status === 'read').length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-400"></div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Archived</p>
                <p className="text-2xl font-bold text-slate-100">{messages.filter(m => m.status === 'archived').length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-400"></div>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-xl font-serif text-slate-100">Contact Messages</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                  {messages.map((message) => (
                    <tr key={message.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-100">
                            {message.userName}
                          </div>
                          <div className="text-sm text-slate-400">
                            {message.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-100 max-w-xs truncate">
                          {message.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {message.status === 'unread' ? (
                            <button
                              onClick={() => handleMarkAsRead(message.id)}
                              className="p-1 rounded text-green-400 hover:bg-green-900/30"
                              title="Mark as read"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsUnread(message.id)}
                              className="p-1 rounded text-slate-400 hover:bg-slate-700"
                              title="Mark as unread"
                            >
                              <EyeSlashIcon className="h-4 w-4" />
                            </button>
                          )}
                          {message.userId && (
                            <button
                              onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                              className="p-1 rounded text-blue-400 hover:bg-blue-900/30"
                              title="Reply to message"
                            >
                              {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                              <Reply className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedMessage(message)}
                            className="p-1 rounded text-blue-400 hover:bg-blue-900/30"
                            title="View message"
                          >
                            View
                          </button>
                          {message.status !== 'archived' && (
                            <button
                              onClick={() => handleArchiveMessage(message.id)}
                              className="p-1 rounded text-slate-400 hover:bg-slate-700"
                              title="Archive message"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Message Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-100">Message Details</h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">From</label>
                      <p className="text-slate-100 mt-1">{selectedMessage.userName}</p>
                      <p className="text-slate-400 text-sm">{selectedMessage.userEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Date</label>
                      <p className="text-slate-100 mt-1">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Subject</label>
                    <p className="text-slate-100 mt-1">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Message</label>
                    <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded p-4">
                      <p className="text-slate-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {/* Reply Section */}
                  {selectedMessage.userId && replyingTo === selectedMessage.id && (
                    <div className="border-t border-slate-700 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">Reply to {selectedMessage.userName}</h4>
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                          rows={4}
                          disabled={sendingReply}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            disabled={sendingReply}
                            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors flex items-center gap-1"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                          <button
                            onClick={() => sendReply(selectedMessage.id, selectedMessage.userId!, selectedMessage.userName, selectedMessage.userEmail)}
                            disabled={!replyText.trim() || sendingReply}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors flex items-center gap-1"
                          >
                            {sendingReply ? (
                              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                            ) : (
                              <>
                                {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                                <Send className="h-3 w-3" />
                                Send Reply
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-slate-700 gap-3">
                  {selectedMessage.userId && replyingTo !== selectedMessage.id && (
                    <button
                      onClick={() => setReplyingTo(selectedMessage.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                      <Reply className="h-4 w-4" />
                      Reply
                    </button>
                  )}
                  {selectedMessage.status !== 'archived' && (
                    <button
                      onClick={() => {
                        handleArchiveMessage(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reply Section in Modal */}
        {replyingTo && selectedMessage && replyingTo === selectedMessage.id && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-100">Reply to {selectedMessage.userName}</h3>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Original Message</label>
                    <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded p-4">
                      <div className="font-medium text-slate-300 mb-1">{selectedMessage.subject}</div>
                      <p className="text-slate-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-400">Your Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                      rows={6}
                      disabled={sendingReply}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      disabled={sendingReply}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      onClick={() => sendReply(selectedMessage.id, selectedMessage.userId!, selectedMessage.userName, selectedMessage.userEmail)}
                      disabled={!replyText.trim() || sendingReply}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      {sendingReply ? (
                        <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
                      ) : (
                        <>
                          {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                          <Send className="h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
