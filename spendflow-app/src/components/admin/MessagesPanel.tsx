'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp, addDoc, deleteDoc, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export interface Reply {
  content: string;
  sentAt: Date | { toDate: () => Date };
  sentBy: string; // admin's user ID or name
}

export interface ContactMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: { toDate: () => Date } | Date;
  updatedAt?: { toDate: () => Date } | Date;
  replies?: Reply[];
  lastRepliedAt?: { toDate: () => Date } | Date;
}

export interface SentMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  read: boolean;
  hasAttachment: boolean;
  labels: string[];
  createdAt: { toDate: () => Date } | Date;
  updatedAt?: { toDate: () => Date } | Date;
  adminName?: string;
  recipientName?: string;
  recipientEmail?: string;
}

interface UserSearchResult {
  id: string;
  email?: string;
  displayName?: string;
  [key: string]: any; // Allow additional properties from Firestore
}

export default function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<UserSearchResult | null>(null);
  
  // Search and filter states
  const [searchQuery] = useState('');
  const [statusFilter] = useState<string>('all');
  const unreadCount = messages.filter(msg => msg.status === 'new').length;

  // Combine received and sent messages for display
  const allMessages = [
    ...messages.map(msg => ({ ...msg, type: 'received' as const })),
    ...sentMessages.map(msg => ({ ...msg, type: 'sent' as const }))
  ].sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt?.toDate?.() || new Date(0);
    const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  // Load messages from Firestore
  useEffect(() => {
    // Load contact messages (user messages to admin)
    const contactMessagesQuery = query(
      collection(db, 'contactMessages'),
      orderBy('createdAt', 'desc')
    );

    // Load sent admin messages
    const sentMessagesQuery = query(
      collection(db, 'messages'),
      where('from', '==', 'admin'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeContact = onSnapshot(contactMessagesQuery, (querySnapshot) => {
      const loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ContactMessage[];

      setMessages(loadedMessages);
    }, (error) => {
      console.error('Error loading contact messages:', error);
    });

    const unsubscribeSent = onSnapshot(sentMessagesQuery, (querySnapshot) => {
      const loadedSentMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as SentMessage[];

      setSentMessages(loadedSentMessages);
      setLoading(false);
    }, (error) => {
      console.error('Error loading sent messages:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeContact();
      unsubscribeSent();
    };
  }, []);

  // Format date from Firestore timestamp or Date object
  const getDateObject = (date: Date | { toDate: () => Date } | { seconds: number; nanoseconds: number }): Date => {
    try {
      if (date instanceof Date) {
        return date;
      } else if (date && typeof date === 'object' && 'toDate' in date) {
        return date.toDate();
      } else if (date && typeof date === 'object' && 'seconds' in date) {
        return new Date(date.seconds * 1000);
      }
      return new Date();
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  };

  // Filter messages based on search and status
  const filteredMessages = allMessages.filter(message => {
    // For received messages, apply status filter
    if (message.type === 'received' && statusFilter !== 'all' && message.status !== statusFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (message.type === 'received') {
        return (
          message.subject.toLowerCase().includes(query) ||
          message.message.toLowerCase().includes(query) ||
          message.userEmail.toLowerCase().includes(query) ||
          (message.userName && message.userName.toLowerCase().includes(query))
        );
      } else {
        return (
          message.subject.toLowerCase().includes(query) ||
          message.body.toLowerCase().includes(query) ||
          message.recipientEmail?.toLowerCase().includes(query) ||
          message.recipientName?.toLowerCase().includes(query)
        );
      }
    }
    
    return true;
  });


  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const messageRef = doc(db, 'contactMessages', id);
      await updateDoc(messageRef, {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handleInAppReply = async (message: ContactMessage, replyText: string) => {
    if (!replyText.trim()) return;

    try {
      // Send reply message from admin to user
      await addDoc(collection(db, 'messages'), {
        from: 'admin', // Special admin identifier
        to: message.userId,
        subject: `Re: ${message.subject || 'Your message'}`,
        body: replyText.trim(),
        read: false,
        hasAttachment: false,
        labels: ['admin-reply'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminName: 'SpendFlow Support'
      });

      // Update the contact message status
      const contactMessageRef = doc(db, 'contactMessages', message.id);
      await updateDoc(contactMessageRef, {
        status: 'replied',
        updatedAt: serverTimestamp(),
        replies: arrayUnion({
          content: replyText.trim(),
          sentAt: new Date(), // Use client-side timestamp for arrayUnion
          sentBy: 'SpendFlow Support',
          via: 'in-app'
        })
      });

      // Update local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === message.id
            ? {
                ...msg,
                status: 'replied',
                updatedAt: new Date(),
                replies: [
                  ...(msg.replies || []),
                  {
                    content: replyText.trim(),
                    sentAt: new Date(),
                    sentBy: 'SpendFlow Support',
                    via: 'in-app'
                  }
                ]
              }
            : msg
        )
      );

      toast.success('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleSelectMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    if (message.status === 'new') {
      updateMessageStatus(message.id, 'read');
    }
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const toggleSelectMessage = (id: string) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllMessages = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(msg => msg.id));
    }
  };

  const handleComposeMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeRecipient || !composeSubject || !composeMessage.trim()) return;

    try {
      // Send message to the messages collection (for user-to-admin messaging)
      await addDoc(collection(db, 'messages'), {
        from: 'admin',
        to: composeRecipient,
        subject: composeSubject,
        body: composeMessage.trim(),
        read: false,
        hasAttachment: false,
        labels: ['admin-message'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminName: 'SpendFlow Support',
        recipientName: selectedRecipient?.displayName || 'Unknown User',
        recipientEmail: selectedRecipient?.email || ''
      });

      // Close modal and reset form
      setShowComposeModal(false);
      setComposeRecipient('');
      setComposeSubject('');
      setComposeMessage('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCancelCompose = () => {
    setShowComposeModal(false);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeMessage('');
    setUserSearchResults([]);
    setShowUserDropdown(false);
    setSelectedRecipient(null);
  };

  // Search users for compose recipient
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUserSearchResults([]);
      setShowUserDropdown(false);
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        limit(10) // Limit results for performance
      );

      const querySnapshot = await getDocs(q);
      const allUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserSearchResult[];

      // Filter users client-side based on search term
      const filteredUsers = allUsers.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setUserSearchResults(filteredUsers);
      setShowUserDropdown(filteredUsers.length > 0);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSearchResults([]);
      setShowUserDropdown(false);
    }
  };

  // Handle recipient input change
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setComposeRecipient(value);
    searchUsers(value);
  };

  // Handle user selection from dropdown
  const handleUserSelect = (user: UserSearchResult) => {
    setComposeRecipient(user.id);
    setSelectedRecipient(user);
    setUserSearchResults([]);
    setShowUserDropdown(false);
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = selectedMessages.map(id =>
        deleteDoc(doc(db, 'contactMessages', id))
      );

      await Promise.all(deletePromises);

      // Update local state to remove deleted messages
      setMessages(prevMessages =>
        prevMessages.filter(msg => !selectedMessages.includes(msg.id))
      );

      setSelectedMessages([]);
      toast.success(`Successfully deleted ${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Failed to delete messages');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif text-slate-100">Messages</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-400 mt-1">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
            {/* Action Bar */}
            {selectedMessages.length > 0 && (
              <div className="bg-slate-900/80 border-t border-slate-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectedMessages.forEach(id => updateMessageStatus(id, 'read'));
                      setSelectedMessages([]);
                    }}
                    className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Mark as read"
                  >
                    <span className="text-sm">✅</span>
                  </button>
                  <button
                    onClick={() => {
                      selectedMessages.forEach(id => updateMessageStatus(id, 'archived'));
                      setSelectedMessages([]);
                    }}
                    className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Archive"
                  >
                    <span className="text-sm">📁</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedMessages.length > 0) {
                        handleDeleteSelectedMessages();
                      }
                    }}
                    disabled={selectedMessages.length === 0}
                    className="p-2 rounded-md hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete selected messages"
                  >
                    <span className="text-sm">🗑️</span>
                  </button>
                </div>
                <div className="text-sm text-slate-400">
                  {selectedMessages.length} of {filteredMessages.length} selected
                </div>
              </div>
            )}

            {/* Messages List */}
            <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl">📧</span>
                  <h3 className="text-lg font-medium text-slate-300">No messages found</h3>
                  <p className="text-slate-500 mt-1">
                    {searchQuery 
                      ? 'No messages match your search' 
                      : statusFilter !== 'all' 
                        ? `No ${statusFilter} messages` 
                        : 'No messages yet'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                          checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                          onChange={handleSelectAllMessages}
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        From/To
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900/30 divide-y divide-slate-800">
                    {filteredMessages.map((message) => (
                      <tr 
                        key={message.id}
                        className={`hover:bg-slate-800/50 cursor-pointer ${
                          selectedMessages.includes(message.id) ? 'bg-slate-800/30' : ''
                        } ${message.type === 'received' && message.status === 'new' ? 'bg-slate-800/20' : ''}`}
                        onClick={() => message.type === 'received' ? handleSelectMessage(message.id) : null}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                              checked={selectedMessages.includes(message.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectMessage(message.id);
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            message.type === 'received' 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-green-900/30 text-green-400'
                          }`}>
                            {message.type === 'received' ? 'Received' : 'Sent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`shrink-0 h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center ${
                              message.type === 'received' && message.status === 'new' ? 'ring-2 ring-amber-500' : ''
                            }`}>
                              <span className="text-sm">👤</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-200">
                                {message.type === 'received' ? message.userName : (message.recipientName || 'Unknown User')}
                              </div>
                              <div className="text-xs text-slate-400">
                                {message.type === 'received' ? message.userEmail : message.recipientEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`mr-2 shrink-0 ${
                              message.type === 'received' && message.status === 'new' ? 'text-amber-400' : 'text-slate-500'
                            }`}>
                              {message.type === 'received' ? (
                                message.status === 'replied' ? (
                                  <span className="text-sm">✅</span>
                                ) : message.status === 'archived' ? (
                                  <span className="text-sm">📁</span>
                                ) : message.status === 'new' ? (
                                  <span className="text-sm">📧</span>
                                ) : (
                                  <span className="text-sm">📬</span>
                                )
                              ) : (
                                <span className="text-sm">✅</span>
                              )}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-slate-200">
                                {message.subject || '(No subject)'}
                              </div>
                              <div className="text-xs text-slate-400 truncate max-w-md">
                                {message.type === 'received' 
                                  ? message.message.substring(0, 80) 
                                  : message.body.substring(0, 80)
                                }
                                {(message.type === 'received' ? message.message : message.body).length > 80 ? '...' : ''}
                              </div>
                              {message.type === 'received' && message.replies && message.replies.length > 0 && (
                                <div className="text-xs text-amber-400 mt-1">
                                  {message.replies.length} admin repl{message.replies.length === 1 ? 'y' : 'ies'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400">
                            {format(getDateObject(message.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-slate-500">
                            {format(getDateObject(message.createdAt), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {message.type === 'received' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingTo(message as ContactMessage);
                              }}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                              Reply
                            </button>
                          ) : (
                            <span className="text-xs text-green-400 font-medium">Sent</span>
                          )}
                          {message.type === 'received' && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              message.status === 'new' 
                                ? 'bg-blue-100 text-blue-800' 
                                : message.status === 'read' 
                                  ? 'bg-gray-100 text-gray-800' 
                                  : message.status === 'replied'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Compose Button */}
            <div className="fixed bottom-6 right-6">
              <button
                onClick={() => setShowComposeModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                title="Compose new message"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Form Modal */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Reply to {replyingTo.userName}</h3>
              <button
                onClick={handleCancelReply}
                className="text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Original Message */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-slate-300">
                    <span className="font-medium">From:</span> {replyingTo.userName} &lt;{replyingTo.userEmail}&gt;
                  </div>
                  <div className="text-xs text-slate-400">
                    {format(getDateObject(replyingTo.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <div className="text-sm text-slate-300 mb-3">
                  <span className="font-medium">Subject:</span> {replyingTo.subject || '(No subject)'}
                </div>
                <div className="text-sm text-slate-300 whitespace-pre-line bg-slate-800 p-3 rounded">
                  {replyingTo.message}
                </div>
              </div>

              {/* Reply History */}
              {replyingTo.replies?.map((reply: Reply, index: number) => (
                <div key={index} className="p-4 bg-slate-700 rounded-lg ml-8 border-l-4 border-amber-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-amber-400 font-medium">
                      {reply.sentBy}
                    </div>
                    <div className="text-xs text-slate-400">
                      {format(getDateObject(reply.sentAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <div className="text-sm text-slate-200 whitespace-pre-line bg-slate-800 p-3 rounded">
                    {reply.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label htmlFor="replyContent" className="block text-sm font-medium text-slate-300 mb-2">
                Your Reply
              </label>
              <textarea
                id="replyContent"
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[120px]"
                placeholder={`Reply to ${replyingTo.userName}...`}
                autoFocus
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  const mailtoLink = `mailto:${replyingTo.userEmail}?subject=${encodeURIComponent(`Re: ${replyingTo.subject || 'Your message'}`)}&body=${encodeURIComponent(`${replyContent}\n\n----------------------------------\nOriginal message from ${replyingTo.userName} (${replyingTo.userEmail}):\n${replyingTo.message}`)}`;
                  window.location.href = mailtoLink;
                  
                  // Update status for email reply
                  const contactMessageRef = doc(db, 'contactMessages', replyingTo.id);
                  updateDoc(contactMessageRef, {
                    status: 'replied',
                    updatedAt: serverTimestamp(),
                    replies: arrayUnion({
                      content: '[Replied via email]',
                      sentAt: new Date(), // Use client-side timestamp for arrayUnion
                      sentBy: 'SpendFlow Support',
                      via: 'email-client'
                    })
                  });
                  
                  setReplyingTo(null);
                  setReplyContent('');
                  toast.success('Email client opened with your reply');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                Reply via Email
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInAppReply(replyingTo, replyContent);
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Reply in App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Compose New Message</h3>
              <button
                onClick={handleCancelCompose}
                className="text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleComposeMessage} className="space-y-4">
              <div className="relative">
                <label htmlFor="recipient" className="block text-sm font-medium text-slate-300 mb-2">
                  Recipient User ID
                </label>
                <input
                  type="text"
                  id="recipient"
                  value={composeRecipient}
                  onChange={handleRecipientChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Search for user by name, email, or ID..."
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-slate-500 mt-1">Start typing to search for users</p>

                {/* User Search Dropdown */}
                {showUserDropdown && userSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {userSearchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="px-3 py-2 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                            <span className="text-sm">👤</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-200">
                              {user.displayName || 'No Name'}
                            </div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {user.id}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Message subject..."
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[120px]"
                  placeholder="Type your message..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelCompose}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!composeRecipient || !composeSubject || !composeMessage.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
