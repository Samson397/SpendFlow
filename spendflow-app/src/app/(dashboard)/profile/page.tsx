'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Calendar, Send } from 'lucide-react';
import { AuthGate } from '@/components/auth/AuthGate';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSending: boolean;
  formData: { subject: string; message: string };
  formErrors?: { subject?: string; message?: string };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function ContactFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSending, 
  formData, 
  formErrors = {}, 
  onFormChange 
}: ContactFormModalProps) {
  if (!isOpen) return null;
  
  // Prevent closing the modal when clicking inside the form
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-amber-700/30 rounded-lg p-6 w-full max-w-md"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif text-slate-100">Get in Touch</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close contact form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-400 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData?.subject || ''}
              onChange={onFormChange}
              className={`w-full bg-slate-800 border ${
                formErrors?.subject ? 'border-red-500' : 'border-slate-700'
              } rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
              placeholder="How can we help?"
              required
              disabled={isSending}
            />
            {formErrors?.subject && (
              <p className="mt-1 text-sm text-red-400">{formErrors.subject}</p>
            )}
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-400 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData?.message || ''}
              onChange={onFormChange}
              rows={4}
              className={`w-full bg-slate-800 border ${
                formErrors?.message ? 'border-red-500' : 'border-slate-700'
              } rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
              placeholder="Tell us more about your inquiry..."
              required
              disabled={isSending}
            ></textarea>
            {formErrors?.message && (
              <p className="mt-1 text-sm text-red-400">{formErrors.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProfilePageContent() {
  const { user } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<{subject?: string; message?: string}>({});
  const [isSending, setIsSending] = useState(false);
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (showContactModal) {
      setContactForm({
        subject: '',
        message: ''
      });
      setFormErrors({});
    }
  }, [showContactModal]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const trimmedSubject = (contactForm?.subject || '').trim();
    const trimmedMessage = (contactForm?.message || '').trim();
    const errors: {subject?: string; message?: string} = {};
    
    if (!trimmedSubject) {
      errors.subject = 'Subject is required';
    }
    
    if (!trimmedMessage) {
      errors.message = 'Message is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach(error => {
        if (error) toast.error(error);
      });
      return;
    }
    
    console.log('Form validation passed, preparing to submit...');

    // Prevent double submission
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      console.log('Submitting form with data:', {
        subject: trimmedSubject,
        message: trimmedMessage,
        userId: user?.uid,
        userEmail: user?.email
      });
      
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to send a message');
      }
      
      console.log('User is authenticated with ID:', user.uid);
      
      // Prepare message data
      const messageData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'User',
        subject: trimmedSubject,
        message: trimmedMessage,
        status: 'new',
        createdAt: serverTimestamp(),
      };
      
      console.log('Saving message to Firestore with data:', messageData);
      
      // Save message to Firestore
      const messagesRef = collection(db, 'contactMessages');
      console.log('Collection reference created');
      
      const docRef = await addDoc(messagesRef, messageData);
      console.log('Message saved with ID: ', docRef.id);
      
      // Verify the document was created
      console.log('Verifying document was created...');
      
      // Show success message
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form and close modal
      setContactForm({ subject: '', message: '' });
      setShowContactModal(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Failed to send message';
      
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-4 tracking-wide">
          P R O F I L E
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Account Information</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-sm p-12 backdrop-blur-sm">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-amber-600">
              <User className="h-12 w-12 text-amber-400" />
            </div>
            <h2 className="text-3xl font-serif text-slate-100 mb-2">{user?.displayName || 'User'}</h2>
            <div className="text-slate-500 text-sm tracking-wider">{user?.email}</div>
          </div>

          <div className="space-y-6">
            <div className="border border-slate-800 bg-slate-900/50 p-6">
              <div className="border-l-2 border-amber-600 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-5 w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Email</div>
                </div>
                <div className="text-lg font-serif text-slate-100">{user?.email}</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-6">
              <div className="border-l-2 border-amber-600 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Account Status</div>
                </div>
                <div className="text-lg font-serif text-slate-100">Elite Member</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-6">
              <div className="border-l-2 border-amber-600 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Member Since</div>
                </div>
                <div className="text-lg font-serif text-slate-100">
                  {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get in Touch Section */}
      <div className="max-w-2xl mx-auto mt-12">
        <div className="text-center mb-8">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl md:text-3xl font-serif text-slate-100 mb-4 tracking-wide">
            G E T  I N  T O U C H
          </h2>
          <p className="text-slate-400 text-sm tracking-wider mb-8">Have questions or feedback? We'd love to hear from you.</p>
          
          <button
            onClick={() => setShowContactModal(true)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors flex items-center gap-2 mx-auto mb-6"
          >
            <Send className="h-4 w-4" />
            Send us a Message
          </button>
          
          <p className="text-slate-500 text-sm">
            Or email us directly at{' '}
            <a 
              href="mailto:spendflowapp@gmail.com" 
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              spendflowapp@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Quote */}
      <div className="text-center py-12 border-t border-slate-800">
        <div className="text-amber-400/40 text-6xl mb-4">&quot;</div>
        <p className="text-slate-400 text-lg font-serif italic mb-4 max-w-2xl mx-auto">
          Your financial journey is unique. Make it extraordinary.
        </p>
        <div className="text-slate-600 text-sm tracking-widest">— SPENDFLOW</div>
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal 
        isOpen={showContactModal}
        onClose={() => !isSending && setShowContactModal(false)}
        onSubmit={handleContactSubmit}
        isSending={isSending}
        formData={contactForm}
        formErrors={formErrors}
        onFormChange={(e) => {
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
        }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfilePageContent />
    </AuthGate>
  );
}
