'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { format } from 'date-fns';
import { Mail, Trash2, Archive, User, MailCheck, MailOpen } from 'lucide-react';
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

export default function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [, setSelectedMessage] = useState<ContactMessage | null>(null);
  // Removed unused state
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null);
  
  // Search and filter states
  const [searchQuery] = useState('');
  const [statusFilter] = useState<string>('all');
  const unreadCount = messages.filter(msg => msg.status === 'new').length;

  // Load messages from Firestore
  useEffect(() => {
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
      setLoading(false);
    });

    return () => unsubscribe();
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
  const filteredMessages = messages.filter(message => {
    // Apply status filter
    if (statusFilter !== 'all' && message.status !== statusFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        message.subject.toLowerCase().includes(query) ||
        message.message.toLowerCase().includes(query) ||
        message.userEmail.toLowerCase().includes(query) ||
        (message.userName && message.userName.toLowerCase().includes(query))
      );
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

  const handleReply = async (message: ContactMessage) => {
    if (!message) return;
    
    // Create a mailto link with the reply content
    const subject = `Re: ${message.subject || 'Your message'}`;
    const body = `${replyContent}\n\n----------------------------------\nOriginal message from ${message.userName} (${message.userEmail}):\n${message.message}`;
    
    // Encode the subject and body for the mailto link
    const mailtoLink = `mailto:${message.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open the default email client
    window.location.href = mailtoLink;
    
    // Update the message status to 'replied' in the background
    try {
      const messageRef = doc(db, 'contactMessages', message.id);
      const adminName = 'Admin'; // Replace with actual admin name from auth
      
      await updateDoc(messageRef, {
        status: 'replied',
        updatedAt: serverTimestamp(),
        lastRepliedAt: serverTimestamp(),
        $push: {
          replies: {
            content: '[Replied via email]',
            sentAt: serverTimestamp(),
            sentBy: adminName,
            via: 'email-client'
          }
        }
      });
      
      // Update local state to reflect the change
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === message.id 
            ? { 
                ...msg, 
                status: 'replied',
                updatedAt: new Date(),
                lastRepliedAt: new Date(),
                replies: [
                  ...(msg.replies || []), 
                  {
                    content: '[Replied via email]',
                    sentAt: new Date(),
                    sentBy: adminName,
                    via: 'email-client'
                  }
                ]
              } 
            : msg
        )
      );
      
      toast.success('Email client opened with your reply');
    } catch (error) {
      console.error('Error updating message status:', error);
      // Don't show error to user since the email client still opened
    }
    
    // Close the reply modal
    setReplyingTo(null);
    setReplyContent('');
  };

  // Mark selected messages as read (used in the UI, keep it for now)
  const markSelectedAsRead = async () => {
    try {
      const updates = selectedMessages.map(id => 
        updateDoc(doc(db, 'contactMessages', id), { 
          status: 'read',
          updatedAt: new Date()
        })
      );
      await Promise.all(updates);
      setSelectedMessages([]);
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
      toast.error('Failed to mark messages as read');
    }
  };

  const handleSelectMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    if (message.status === 'new') {
      updateMessageStatus(message.id, 'read');
    }
    setSelectedMessage(message);
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

  const handleSelectAllMessages = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMessages(e.target.checked ? filteredMessages.map(msg => msg.id) : []);
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
                    <MailCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      selectedMessages.forEach(id => updateMessageStatus(id, 'archived'));
                      setSelectedMessages([]);
                    }}
                    className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      // In a real app, you would implement actual deletion
                      console.log('Delete messages:', selectedMessages);
                      setSelectedMessages([]);
                    }}
                    className="p-2 rounded-md hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
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
                  <Mail className="h-12 w-12 text-slate-600 mx-auto mb-4" />
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
                        From
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
                        } ${message.status === 'new' ? 'bg-slate-800/20' : ''}`}
                        onClick={() => handleSelectMessage(message.id)}
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
                          <div className="flex items-center">
                            <div className={`shrink-0 h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center ${
                              message.status === 'new' ? 'ring-2 ring-amber-500' : ''
                            }`}>
                              <User className="h-5 w-5 text-amber-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-200">{message.userName}</div>
                              <div className="text-xs text-slate-400">{message.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`mr-2 shrink-0 ${
                              message.status === 'new' ? 'text-amber-400' : 'text-slate-500'
                            }`}>
                              {message.status === 'replied' ? (
                                <MailCheck className="h-4 w-4" />
                              ) : message.status === 'archived' ? (
                                <Archive className="h-4 w-4" />
                              ) : message.status === 'new' ? (
                                <Mail className="h-4 w-4" />
                              ) : (
                                <MailOpen className="h-4 w-4" />
                              )}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-slate-200">
                                {message.subject || '(No subject)'}
                              </div>
                              <div className="text-xs text-slate-400 truncate max-w-md">
                                {message.message.substring(0, 80)}{message.message.length > 80 ? '...' : ''}
                              </div>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingTo(message);
                            }}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                          >
                            Reply
                          </button>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Compose Button */}
            <div className="fixed bottom-6 right-6">
              <button className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
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
              {replyingTo.replies?.map((reply, index) => (
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
                onClick={handleCancelReply}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReply(replyingTo)}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Reply via Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
