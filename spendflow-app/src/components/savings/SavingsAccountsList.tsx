'use client';

import { useState, useEffect } from 'react';
import { Plus, PiggyBank, Banknote, ArrowRightLeft, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { SavingsAccount } from '@/types';
import { savingsAccountsService } from '@/lib/services/savingsService';
import { useAuth } from '@/lib/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateAccountDialog } from './CreateAccountDialog';
import { EditSavingsAccountModal } from './EditSavingsAccountModal';
import { TransferDialog } from './TransferDialog';
import { useToast } from '@/components/ui/use-toast';

export function SavingsAccountsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const userAccounts = await savingsAccountsService.getUserAccounts(user.uid);
      setAccounts(userAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
      case 'savings':
        return <PiggyBank className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <Banknote className="h-5 w-5 text-blue-500" />;
      default:
        return <PiggyBank className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleEditAccount = (account: SavingsAccount) => {
    setEditingAccount(account);
    setShowEditDialog(true);
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (!user) return;

    if (!window.confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await savingsAccountsService.deleteAccount(accountId);
      // Refresh the accounts list
      const updatedAccounts = await savingsAccountsService.getUserAccounts(user.uid);
      setAccounts(updatedAccounts);
      toast({
        title: 'Account deleted',
        description: 'The savings account has been permanently removed.',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">My Accounts</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowTransferDialog(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <PiggyBank className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No savings accounts</h3>
          <p className="mb-4 text-sm text-gray-500">Get started by creating a new savings account.</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{account.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/50 rounded transition-colors"
                      title="Edit account"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id, account.name)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="rounded-full bg-gray-100 p-2">
                      {getAccountIcon(account.accountType)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {account.accountType === 'savings' ? 'Savings Account' : 'Checking Account'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(account.balance, account.currency)}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Account #: {account.accountNumber}
                </p>
                {account.interestRate && (
                  <p className="mt-1 text-sm text-green-600">
                    {account.interestRate}% APY
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAccountDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadAccounts}
      />

      <EditSavingsAccountModal
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingAccount(null);
        }}
        onSuccess={loadAccounts}
        account={editingAccount}
      />

      <TransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        onSuccess={() => {
          loadAccounts();
          // You might want to refresh cards and transactions here as well
        }}
      />
    </div>
  );
}
