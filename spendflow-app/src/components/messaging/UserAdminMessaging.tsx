'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Clock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Reply {
  content: string;
  sentAt: Date | { toDate: () => Date };
  sentBy: string;
}

interface Message {
  id: string;
  from: string;
  to?: string;
  subject: string;
  body: string;
  read: boolean;
  hasAttachment: boolean;
  labels: string[];
  createdAt: Date;
  updatedAt?: Date;
  isFromUser: boolean;
  userName?: string;
  userEmail?: string;
  replies?: Reply[];
}

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSending: boolean;
  formData: { subject: string; message: string };
  formErrors?: { subject?: string; message?: string };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function ContactFormModal({ isOpen, onClose, onSubmit, isSending, formData, formErrors, onFormChange }: ContactFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-100">Send us a Message</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
              disabled={isSending}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={onFormChange}
                className={`w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  formErrors?.subject ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="What's this about?"
                required
                disabled={isSending}
              />
              {formErrors?.subject && (
                <p className="text-red-400 text-sm mt-1">{formErrors.subject}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={onFormChange}
                rows={4}
                className={`w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  formErrors?.message ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Tell us what's on your mind..."
                required
                disabled={isSending}
              />
              {formErrors?.message && (
                <p className="text-red-400 text-sm mt-1">{formErrors.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function UserAdminMessaging({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'contact'>('messages');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [formErrors, setFormErrors] = useState<{ subject?: string; message?: string }>({});
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show welcome notification when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation with admin
  useEffect(() => {
    if (!user) return;

    // Load contact messages (user messages to admin)
    const contactMessagesQuery = query(
      collection(db, 'contactMessages'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    // Load admin replies (messages from admin to user)
    const adminRepliesQuery = query(
      collection(db, 'messages'),
      where('to', '==', user.uid),
      where('from', '==', 'admin'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeContact = onSnapshot(contactMessagesQuery, (contactSnapshot) => {
      const contactMessages = contactSnapshot.docs.map(doc => ({
        id: doc.id,
        from: doc.data().userId,
        subject: doc.data().subject || 'Message',
        body: doc.data().message,
        read: doc.data().status !== 'new',
        hasAttachment: false,
        labels: [],
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
        isFromUser: true,
        userName: doc.data().userName,
        userEmail: doc.data().userEmail,
        replies: doc.data().replies || []
      }));

      const unsubscribeAdmin = onSnapshot(adminRepliesQuery, (adminSnapshot) => {
        const adminMessages = adminSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            from: data.from,
            to: data.to,
            subject: data.subject || 'Admin Reply',
            body: data.body,
            read: data.read || false,
            hasAttachment: data.hasAttachment || false,
            labels: data.labels || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            isFromUser: false,
            userName: data.adminName || 'SpendFlow Support',
            userEmail: '',
            adminReply: true
          };
        });

        // Combine and sort all messages by timestamp
        const allMessages = [...contactMessages, ...adminMessages]
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        setMessages(allMessages);
      });

      return () => unsubscribeAdmin();
    });

    return () => unsubscribeContact();
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'User',
        subject: 'User Message',
        message: newMessage.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'contactMessages'), messageData);
      setNewMessage('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSendingContact(true);
    setFormErrors({});

    // Basic validation
    const errors: { subject?: string; message?: string } = {};
    if (!contactForm.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!contactForm.message.trim()) {
      errors.message = 'Message is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSendingContact(false);
      return;
    }

    try {
      const contactData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'User',
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'contactMessages'), contactData);

      setShowContactModal(false);
      setContactForm({ subject: '', message: '' });
      toast.success('Message sent successfully! We\'ll get back to you soon.');
    } catch (error) {
      console.error('Error sending contact message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSendingContact(false);
    }
  };

  // Handle contact form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-100">Support & Messages</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Welcome Notification */}
          {showWelcome && (
            <div className="mb-6 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg animate-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👋</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-amber-300 font-medium text-sm">Welcome to Support!</h4>
                  <p className="text-amber-200/80 text-xs">
                    We&apos;re here to help! Send us a message or use our contact form for detailed support.
                  </p>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="text-amber-400 hover:text-amber-200 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-slate-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              💬 Messages ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              📧 Contact Form
            </button>
          </div>

          {activeTab === 'messages' ? (
            <>
              {/* Messages Container */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-slate-400 font-semibold mb-2">No messages yet</h4>
                    <p className="text-slate-500 text-sm">Send your first message to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromUser
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="text-sm">{message.body}</div>
                          <div className={`text-xs mt-1 flex items-center gap-1 ${
                            message.isFromUser ? 'text-amber-200' : 'text-slate-400'
                          }`}>
                            <Clock className="h-3 w-3" />
                            {format(message.createdAt, 'MMM d, h:mm a')}
                            <span className="ml-2 px-1.5 py-0.5 bg-slate-600 rounded text-xs">
                              {message.isFromUser ? 'You' : 'Admin'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-3 mt-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message to admin..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </button>
              </form>

              {/* Helper Text */}
              <div className="text-center mt-4">
                <p className="text-slate-500 text-sm">
                  💬 Your messages will be delivered to our support team.
                  We&apos;ll respond as soon as possible!
                </p>
              </div>
            </>
          ) : (
            /* Contact Form Tab */
            <div className="space-y-4">
              <div className="text-center">
                <Mail className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-slate-200 font-semibold mb-2">Send us a detailed message</h4>
                <p className="text-slate-400 text-sm mb-6">
                  For complex questions, feature requests, or detailed feedback, use our contact form.
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors flex items-center gap-2 mx-auto mb-6"
                >
                  <Mail className="h-5 w-5" />
                  Open Contact Form
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <h5 className="text-slate-300 font-medium mb-2">Quick Questions</h5>
                  <p className="text-slate-500 text-sm mb-3">Use the Messages tab above</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-900/30 text-green-400">
                    ⚡ Instant
                  </span>
                </div>
                <div className="text-center">
                  <h5 className="text-slate-300 font-medium mb-2">Detailed Support</h5>
                  <p className="text-slate-500 text-sm mb-3">Use the contact form below</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-900/30 text-blue-400">
                    📋 Structured
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-500 text-sm mb-4">
                  Or email us directly at{' '}
                  <a
                    href="mailto:spendflowapp@gmail.com"
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    spendflowapp@gmail.com
                  </a>
                </p>
              </div>

              <div className="text-center">
                <p className="text-slate-600 text-xs">
                  💡 Tip: For quick questions, use Messages. For detailed inquiries, use the contact form.
                </p>
              </div>
            </div>
          )}

          {/* Contact Form Modal */}
          <ContactFormModal
            isOpen={showContactModal}
            onClose={() => !isSendingContact && setShowContactModal(false)}
            onSubmit={handleContactSubmit}
            isSending={isSendingContact}
            formData={contactForm}
            formErrors={formErrors}
            onFormChange={handleFormChange}
          />
        </div>
      </div>
    </div>
  );
}
