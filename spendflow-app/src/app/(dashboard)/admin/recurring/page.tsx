'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { RecurringPaymentService } from '@/lib/services/recurringPaymentService';
import toast from 'react-hot-toast';
import { EmailService } from '@/lib/services/emailService';

export default function AdminRecurringPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

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
  }, [user, isAdmin, router]);

  const handleProcessPayments = async () => {
    try {
      setProcessing(true);
      const results = await RecurringPaymentService.processAllDuePayments();

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} recurring payments`);
      }

      if (failureCount > 0) {
        toast.error(`${failureCount} payments failed to process`);
      }

      if (successCount === 0 && failureCount === 0) {
        toast('No due recurring payments found');
      }

    } catch (error) {
      console.error('Error processing recurring payments:', error);
      toast.error('Failed to process recurring payments');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      setProcessing(true);
      const reminderCount = await RecurringPaymentService.sendPaymentReminders();

      if (reminderCount > 0) {
        toast.success(`Sent ${reminderCount} payment reminder alerts`);
      } else {
        toast('No upcoming payments requiring reminders found');
      }

    } catch (error) {
      console.error('Error sending payment reminders:', error);
      toast.error('Failed to send payment reminders');
    } finally {
      setProcessing(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setProcessing(true);
      const connected = await EmailService.verifyConnection();

      if (connected) {
        toast.success('Email service connected successfully!');

        // Send a test email
        if (user?.email) {
          const testSent = await EmailService.sendCustomEmail(
            user.email,
            'SpendFlow Email Test',
            `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>✅ Email Service Working!</h2>
              <p>Your SpendFlow email service is configured and working correctly.</p>
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Sent to: ${user.email}</li>
                <li>Time: ${new Date().toLocaleString()}</li>
                <li>Service: Gmail SMTP</li>
              </ul>
              <p>You can now receive payment notifications and reminders via email!</p>
            </div>`,
            `"SpendFlow Admin" <${process.env.NEXT_PUBLIC_EMAIL_USER}>`
          );

          if (testSent) {
            toast.success('Test email sent successfully! Check your inbox.');
          } else {
            toast.error('Email service connected but test email failed.');
          }
        }
      } else {
        toast.error('Email service connection failed. Check your configuration.');
      }
    } catch (error) {
      console.error('Error testing email service:', error);
      toast.error('Failed to test email service');
    } finally {
      setProcessing(false);
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
            Recurring Payments Management
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            Process automatic credit card payments for users with auto-pay enabled
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-100">Process Due Payments</h3>
              <p className="text-slate-400 text-sm">
                Manually trigger the recurring payment processing system
              </p>
            </div>
            <button
              onClick={handleProcessPayments}
              disabled={processing}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span className="text-lg">💳</span>
                  Process All Due Payments
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-100">Send Payment Reminders</h3>
              <p className="text-slate-400 text-sm">
                Send reminder alerts to users with payments due in the next 7 days
              </p>
            </div>
            <button
              onClick={handleSendReminders}
              disabled={processing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z" />
                  </svg>
                  Send Reminders
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-100">Test Email Service</h3>
              <p className="text-slate-400 text-sm">
                Verify email configuration and send a test email to yourself
              </p>
            </div>
            <button
              onClick={handleTestEmail}
              disabled={processing}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Testing...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Test Email
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h4 className="text-md font-medium text-slate-100 mb-4">How It Works</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Checks all credit cards with auto-pay enabled</li>
                <li>• Verifies if today is the payment due date</li>
                <li>• Calculates minimum payment amount</li>
                <li>• Transfers funds from debit card to credit card</li>
                <li>• Creates transaction records</li>
                <li>• Sends alerts to users for failed/successful payments</li>
                <li>• Sends reminder alerts for upcoming payments</li>
              </ul>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h4 className="text-md font-medium text-slate-100 mb-4">Payment Logic</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Minimum payment: 3% of balance or $25 (whichever is greater)</li>
                <li>• Or custom minimum payment set by user</li>
                <li>• Only processes if sufficient funds available</li>
                <li>• Considers overdraft limits on debit cards</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h4 className="text-md font-medium text-slate-100 mb-4">Important Notes</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <strong>Manual Processing:</strong> This admin function allows you to manually trigger the recurring payment process.
                In a production environment, this would typically run automatically via a scheduled job (cron).
              </p>
              <p>
                <strong>User Configuration:</strong> Users must configure auto-pay in their credit card settings and have sufficient funds in their selected debit card.
              </p>
              <p>
                <strong>Transaction Records:</strong> All payments create proper transaction records and transfer records in the database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
