'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ShieldCheckIcon, ArrowLeftIcon, EnvelopeIcon as Mail, PaperAirplaneIcon as Send, ArrowUturnLeftIcon as Reply, CheckIcon as Check, ArchiveBoxIcon as Archive, UserIcon as User, ClockIcon as Clock } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  updatedAt?: Date;
  responses?: MessageResponse[];
}

interface MessageResponse {
  id: string;
  messageId: string;
  adminEmail: string;
  response: string;
  createdAt: Date;
}

export default function AdminMessagingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');

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

  const loadMessages = () => {
    const q = query(
      collection(db, 'contactMessages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ContactMessage[];

      setMessages(loadedMessages);
      setLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    return message.status === filter;
  });

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'read',
        updatedAt: serverTimestamp()
      });
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    setSendingResponse(true);
    try {
      // Add response to responses subcollection
      await addDoc(collection(db, 'contactMessages', selectedMessage.id, 'responses'), {
        adminEmail: user?.email,
        response: responseText.trim(),
        createdAt: serverTimestamp()
      });

      // Update message status to replied
      await updateDoc(doc(db, 'contactMessages', selectedMessage.id), {
        status: 'replied',
        updatedAt: serverTimestamp()
      });

      setResponseText('');
      toast.success('Response sent successfully');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'archived',
        updatedAt: serverTimestamp()
      });
      toast.success('Message archived');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Failed to archive message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'read':
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
      case 'replied':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'archived':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-700';
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
            Message Center
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            Respond to user inquiries and manage conversations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
              {/* Filter Tabs */}
              <div className="border-b border-slate-800 p-4">
                <div className="flex space-x-1">
                  {[
                    { key: 'all', label: 'All Messages', count: messages.length },
                    { key: 'new', label: 'New', count: messages.filter(m => m.status === 'new').length },
                    { key: 'replied', label: 'Replied', count: messages.filter(m => m.status === 'replied').length },
                    { key: 'archived', label: 'Archived', count: messages.filter(m => m.status === 'archived').length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filter === key
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages List */}
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300">No messages found</h3>
                    <p className="text-slate-500 text-sm">No messages match the current filter.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (message.status === 'new') {
                            handleMarkAsRead(message.id);
                          }
                        }}
                        className={`p-6 cursor-pointer hover:bg-slate-800/30 transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-slate-800/50' : ''
                        } ${message.status === 'new' ? 'bg-slate-800/20' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="h-5 w-5 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-200">{message.userName}</p>
                                <p className="text-xs text-slate-400">{message.userEmail}</p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                                {message.status}
                              </span>
                            </div>
                            <h3 className="text-base font-medium text-slate-100 mb-1">{message.subject}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2">{message.message}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {message.createdAt ? format(message.createdAt, 'MMM d, yyyy h:mm a') : 'Unknown'}
                              </span>
                              {message.status === 'replied' && (
                                <span className="text-green-400">✓ Replied</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Detail & Response */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-100">Conversation</h3>
                  <button
                    onClick={() => handleArchive(selectedMessage.id)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                    title="Archive message"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>

                {/* User Message */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">{selectedMessage.userName}</span>
                    <span className="text-xs text-slate-500">
                      {selectedMessage.createdAt ? format(selectedMessage.createdAt, 'MMM d, h:mm a') : ''}
                    </span>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-3">
                    <h4 className="text-sm font-medium text-slate-200 mb-2">{selectedMessage.subject}</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Response Form */}
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="text-sm font-medium text-slate-200 mb-3">Your Response</h4>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response to the user..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSendResponse}
                      disabled={!responseText.trim() || sendingResponse}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                    >
                      {sendingResponse ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Response
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Previous Responses */}
                {selectedMessage.responses && selectedMessage.responses.length > 0 && (
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-slate-200 mb-3">Previous Responses</h4>
                    <div className="space-y-3">
                      {selectedMessage.responses.map((response, index) => (
                        <div key={index} className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheckIcon className="h-3 w-3 text-amber-400" />
                            <span className="text-xs font-medium text-amber-400">{response.adminEmail}</span>
                            <span className="text-xs text-slate-500">
                              {format(response.createdAt, 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">{response.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-center">
                <Mail className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">Select a Message</h3>
                <p className="text-slate-500 text-sm">Choose a message from the list to view and respond.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
