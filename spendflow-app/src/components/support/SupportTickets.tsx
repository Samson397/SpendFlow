'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import toast from 'react-hot-toast';

interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'billing' | 'technical' | 'feature' | 'account' | 'other';
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

export function SupportTickets() {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscription();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const canAccessSupport = canAccessFeature('prioritySupport');

  // Mock data for demonstration - in real app, this would come from Firebase
  useEffect(() => {
    if (user) {
      // Simulate loading tickets
      setTimeout(() => {
        setTickets([
          {
            id: '1',
            userId: user.uid,
            subject: 'Question about data export',
            message: 'I\'m trying to export my transaction data but the CSV file seems incomplete.',
            status: 'open',
            priority: 'medium',
            category: 'technical',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            responses: [
              {
                id: '1',
                ticketId: '1',
                authorId: 'admin',
                authorName: 'Support Team',
                message: 'Thank you for reaching out. We\'re investigating this issue and will get back to you within 24 hours.',
                isAdmin: true,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
              }
            ]
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  const handleCreateTicket = (ticketData: Omit<SupportTicket, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'responses'>) => {
    if (!user) return;

    const newTicket: SupportTicket = {
      ...ticketData,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    };

    setTickets(prev => [newTicket, ...prev]);
    setShowNewTicket(false);
    toast.success('Support ticket created successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-900/20';
      case 'in_progress': return 'text-amber-400 bg-amber-900/20';
      case 'resolved': return 'text-green-400 bg-green-900/20';
      case 'closed': return 'text-slate-400 bg-slate-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  if (!canAccessSupport) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Priority Support</h3>
          <p className="text-slate-500 mb-4">Get direct access to our support team with faster response times.</p>
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-md p-4">
            <p className="text-amber-300 text-sm">
              🎯 Priority support is available with Enterprise plans.
              <a href="/subscription" className="text-amber-400 hover:text-amber-300 underline ml-1">
                Upgrade now
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-100">Priority Support</h3>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
          <span className="ml-3 text-slate-400">Loading tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-slate-400 mb-2">No Support Tickets</h4>
          <p className="text-slate-500 mb-6">Create your first support ticket to get help from our team.</p>
          <button
            onClick={() => setShowNewTicket(true)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
          >
            Create Support Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-200 mb-1">{ticket.subject}</h4>
                  <p className="text-slate-400 text-sm line-clamp-2">{ticket.message}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  {ticket.status.replace('_', ' ')}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span>{ticket.category}</span>
                  <span>{ticket.responses.length} responses</span>
                </div>
                <span>{ticket.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <NewTicketModal
          onClose={() => setShowNewTicket(false)}
          onSubmit={handleCreateTicket}
        />
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

function NewTicketModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (ticket: Omit<SupportTicket, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'responses'>) => void;
}) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'technical' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    onSubmit({
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      category: formData.category,
      priority: formData.priority,
      status: 'open'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif text-slate-100">Create Support Ticket</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as SupportTicket['category'] }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="feature">Feature Request</option>
                <option value="account">Account Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as SupportTicket['priority'] }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Please provide detailed information about your issue..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-serif text-slate-100">{ticket.subject}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
              <span>{ticket.category}</span>
              <span>{ticket.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Original message */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-200">You</span>
                  <span className="text-slate-500 text-sm">{ticket.createdAt.toLocaleString()}</span>
                </div>
                <p className="text-slate-300">{ticket.message}</p>
              </div>
            </div>
          </div>

          {/* Responses */}
          {ticket.responses.map((response) => (
            <div key={response.id} className={`rounded-lg p-4 ${response.isAdmin ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-slate-800/50'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${response.isAdmin ? 'bg-amber-600' : 'bg-slate-600'}`}>
                  {response.isAdmin ? <MessageSquare className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-200">{response.authorName}</span>
                    {response.isAdmin && (
                      <span className="text-xs bg-amber-600 text-slate-900 px-2 py-1 rounded-full font-medium">
                        Support Team
                      </span>
                    )}
                    <span className="text-slate-500 text-sm">{response.createdAt.toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300">{response.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(ticket.status)}`}>
              {getStatusIcon(ticket.status)}
              Status: {ticket.status.replace('_', ' ')}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return 'text-red-400';
    case 'high': return 'text-orange-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-slate-400';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'text-blue-400 bg-blue-900/20';
    case 'in_progress': return 'text-amber-400 bg-amber-900/20';
    case 'resolved': return 'text-green-400 bg-green-900/20';
    case 'closed': return 'text-slate-400 bg-slate-900/20';
    default: return 'text-slate-400 bg-slate-900/20';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'open': return <AlertCircle className="h-4 w-4" />;
    case 'in_progress': return <Clock className="h-4 w-4" />;
    case 'resolved': return <CheckCircle className="h-4 w-4" />;
    case 'closed': return <CheckCircle className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
}
