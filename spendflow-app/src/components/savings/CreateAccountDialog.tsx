'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { savingsAccountsService } from '@/lib/services/savingsService';
import { useAuth } from '@/lib/hooks/useAuth';

const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  accountType: z.enum(['savings', 'checking']),
  initialBalance: z.coerce.number().min(0, 'Initial balance cannot be negative'),
  currency: z.string().default('USD'),
  interestRate: z.coerce.number().min(0).max(100).optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAccountDialog({ open, onOpenChange, onSuccess }: CreateAccountDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountType: 'savings',
      currency: 'USD',
      initialBalance: 0,
    },
  });

  const accountType = watch('accountType');

  const onSubmit = async (data: AccountFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const accountData = {
        userId: user.uid,
        accountNumber: generateAccountNumber(),
        accountType: data.accountType,
        name: data.name,
        balance: data.initialBalance,
        currency: data.currency,
        interestRate: data.interestRate,
        isActive: true,
      };
      
      await savingsAccountsService.createAccount(accountData);
      
      toast({
        title: 'Account created',
        description: `${data.name} account has been created successfully.`,
      });
      
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAccountNumber = (): string => {
    // Generate a random 10-digit account number
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Set up a new {accountType} account to start managing your money.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Emergency Fund, Vacation Savings"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={accountType}
                onValueChange={(value: 'savings' | 'checking') => setValue('accountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="checking">Checking Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Initial Balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    className="pl-8"
                    {...register('initialBalance')}
                  />
                </div>
                {errors.initialBalance && (
                  <p className="text-sm text-red-500">{errors.initialBalance.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  onValueChange={(value) => setValue('currency', value)}
                  defaultValue="USD"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {accountType === 'savings' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="interestRate">Interest Rate (APY %)</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <div className="relative">
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1.5"
                    className="pr-16"
                    {...register('interestRate')}
                  />
                  <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                </div>
                {errors.interestRate && (
                  <p className="text-sm text-red-500">{errors.interestRate.message}</p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
