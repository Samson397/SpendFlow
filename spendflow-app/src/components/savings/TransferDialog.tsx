'use client';

import { SavingsAccount, Card } from '@/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { savingsAccountsService } from '@/lib/services/savingsService';
import { cardsService } from '@/lib/services/cardsService';
import { formatCurrency } from '@/lib/utils/format';

const transferSchema = z.object({
  fromAccountType: z.enum(['card', 'savings']),
  fromAccountId: z.string().min(1, 'Please select an account'),
  toAccountType: z.enum(['card', 'savings']),
  toAccountId: z.string().min(1, 'Please select an account'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TransferDialog({ open, onOpenChange, onSuccess }: TransferDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountType: 'card',
      toAccountType: 'savings',
    },
  });

  const fromAccountType = watch('fromAccountType');
  const toAccountType = watch('toAccountType');
  const fromAccountId = watch('fromAccountId');
  const toAccountId = watch('toAccountId');

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    
    try {
      const [savings, userCards] = await Promise.all([
        savingsAccountsService.getUserAccounts(user.uid),
        cardsService.getUserCards(user.uid)
      ]);
      
      setSavingsAccounts(savings);
      setCards(userCards);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getAccountBalance = (accountId: string, type: 'savings' | 'card') => {
    if (!accountId) return 0;
    
    if (type === 'savings') {
      const account = savingsAccounts.find(acc => acc.id === accountId);
      return account ? account.balance : 0;
    } else {
      const card = cards.find(c => c.id === accountId);
      return card ? card.balance : 0;
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    if (!user) return;
    
    // Prevent transferring to the same account
    if (data.fromAccountType === data.toAccountType && data.fromAccountId === data.toAccountId) {
      toast({
        title: 'Error',
        description: 'Cannot transfer to the same account',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if source has sufficient balance
    const sourceBalance = getAccountBalance(data.fromAccountId, data.fromAccountType);
    if (sourceBalance < data.amount) {
      toast({
        title: 'Insufficient Funds',
        description: 'The selected account does not have enough balance for this transfer.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await savingsAccountsService.createTransfer({
        userId: user.uid,
        fromAccountId: data.fromAccountId,
        fromAccountType: data.fromAccountType,
        toAccountId: data.toAccountId,
        toAccountType: data.toAccountType,
        amount: data.amount,
        description: data.description || `Transfer to ${data.toAccountType} account`,
      });
      
      toast({
        title: 'Transfer Successful',
        description: 'Your transfer has been processed successfully.',
      });
      
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Transfer failed:', error);
      toast({
        title: 'Transfer Failed',
        description: 'There was an error processing your transfer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountOptions = (type: 'card' | 'savings') => {
    const accounts = type === 'savings' ? savingsAccounts : cards;
    
    if (accounts.length === 0) {
      return (
        <SelectItem value="no-accounts" disabled>
          No {type} accounts available
        </SelectItem>
      );
    }
    
    return accounts.map(account => {
      const isCard = type === 'card';
      const lastFour = isCard && 'lastFour' in account ? account.lastFour : 
                      !isCard && 'accountNumber' in account ? account.accountNumber?.slice(-4) : '';
      const currency = isCard ? 'USD' : ('currency' in account ? account.currency : 'USD');
      
      return (
        <SelectItem key={account.id} value={account.id}>
          {account.name || `${type === 'card' ? 'Card' : 'Account'} •••• ${lastFour}`}
          {account.balance !== undefined && ` (${formatCurrency(account.balance, currency)})`}
        </SelectItem>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Transfer Money</DialogTitle>
            <DialogDescription>
              Move money between your accounts
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fromAccountType">From</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={fromAccountType}
                  onValueChange={(value: 'card' | 'savings') => {
                    setValue('fromAccountType', value);
                    setValue('fromAccountId', '');
                  }}
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={fromAccountId || ''}
                  onValueChange={(value) => {
                    if (value !== 'no-accounts') {
                      setValue('fromAccountId', value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${fromAccountType} account`} />
                  </SelectTrigger>
                  <SelectContent>
                    {renderAccountOptions(fromAccountType)}
                  </SelectContent>
                </Select>
              </div>
              {errors.fromAccountId && (
                <p className="text-sm text-red-500">{errors.fromAccountId.message}</p>
              )}
              
              {fromAccountId && (
                <div className="text-sm text-muted-foreground">
                  Available: {formatCurrency(
                    getAccountBalance(fromAccountId, fromAccountType),
                    'USD' // You might want to get the actual currency from the account
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-center py-2">
              <div className="h-px w-10 bg-border" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toAccountType">To</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={toAccountType}
                  onValueChange={(value: 'card' | 'savings') => {
                    setValue('toAccountType', value);
                    setValue('toAccountId', '');
                  }}
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={toAccountId || ''}
                  onValueChange={(value) => {
                    if (value !== 'no-accounts') {
                      setValue('toAccountId', value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${toAccountType} account`} />
                  </SelectTrigger>
                  <SelectContent>
                    {renderAccountOptions(toAccountType)}
                  </SelectContent>
                </Select>
              </div>
              {errors.toAccountId && (
                <p className="text-sm text-red-500">{errors.toAccountId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  placeholder="0.00"
                  {...register('amount')}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Savings transfer, Rent payment"
                {...register('description')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
