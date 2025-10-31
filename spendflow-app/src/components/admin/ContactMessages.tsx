'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { format } from 'date-fns';
import { Mail, Check, Clock, Search, Filter, ChevronDown, ChevronUp, Trash2, Reply, Archive, Tag, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface ContactMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: any;
  updatedAt?: any;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

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
      toast.error('Failed to load messages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter messages based on search and status
  const filteredMessages = messages.filter(message => {
    // Filter by status
    if (statusFilter !== 'all' && message.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        message.subject.toLowerCase().includes(query) ||
        message.message.toLowerCase().includes(query) ||
        message.userEmail.toLowerCase().includes(query) ||
        message.userName.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Toggle message selection
  const toggleSelectMessage = (id: string) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    );
  };

  // Select all messages
  const toggleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(msg => msg.id));
    }
  };

  // Update message status
  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const messageRef = doc(db, 'contactMessages', id);
      await updateDoc(messageRef, {
        status,
        updatedAt: new Date()
      });
      toast.success(`Message marked as ${status}`);
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Failed to update message status');
    }
  };

  // Update multiple messages status
  const updateMultipleMessagesStatus = async (status: string) => {
    if (selectedMessages.length === 0) return;
    
    try {
      const updatePromises = selectedMessages.map(id => 
        updateDoc(doc(db, 'contactMessages', id), {
          status,
          updatedAt: new Date()
        })
      );
      
      await Promise.all(updatePromises);
      setSelectedMessages([]);
      toast.success(`Marked ${selectedMessages.length} messages as ${status}`);
    } catch (error) {
      console.error('Error updating messages status:', error);
      toast.error('Failed to update messages status');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-serif text-slate-100">Contact Messages</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Messages</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            {selectedMessages.length > 0 && (
              <div className="flex items-end gap-2">
                <button
                  onClick={() => updateMultipleMessagesStatus('read')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark as Read</span>
                </button>
                <button
                  onClick={() => updateMultipleMessagesStatus('archived')}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Archive</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No messages found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter === 'all' ? 'You don\'t have any messages yet.' : `No ${statusFilter} messages found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-800/50 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  checked={selectedMessages.length > 0 && selectedMessages.length === filteredMessages.length}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="col-span-3">From</div>
              <div className="col-span-5">Subject</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Messages */}
            {filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-slate-800/30 transition-colors ${
                  message.status === 'new' ? 'bg-slate-800/20' : ''
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => toggleSelectMessage(message.id)}
                  />
                </div>
                <div className="col-span-3 text-sm text-slate-300 truncate">
                  <div className="font-medium">{message.userName}</div>
                  <div className="text-xs text-slate-500">{message.userEmail}</div>
                </div>
                <div className="col-span-5">
                  <div className="text-sm font-medium text-slate-200 truncate">{message.subject}</div>
                  <div className="text-xs text-slate-500 truncate">{message.message.substring(0, 60)}...</div>
                </div>
                <div className="col-span-2 text-xs text-slate-400">
                  {message.createdAt ? format(message.createdAt, 'MMM d, yyyy') : 'N/A'}
                </div>
                <div className="col-span-1 flex justify-end">
                  {getStatusBadge(message.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
