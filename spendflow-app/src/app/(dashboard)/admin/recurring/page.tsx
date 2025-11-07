'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldCheckIcon, ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { RecurringPaymentService } from '@/lib/services/recurringPaymentService';
import toast from 'react-hot-toast';

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
                  <CreditCardIcon className="h-5 w-5" />
                  Process All Due Payments
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
