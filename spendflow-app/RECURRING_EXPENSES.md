# Recurring Expenses - How It Works

## Overview
Recurring expenses are **NOT charged immediately** when you create them. They are only processed on their due date each month.

## How It Works

### 1. Creating a Recurring Expense
When you create a recurring expense (e.g., Netflix on the 15th of each month):
- The expense is saved to the database
- **NO transaction is created**
- **NO money is deducted from your card**
- It's just scheduled for future processing

### 2. Automatic Processing
The system automatically checks for due expenses:
- **When**: Once per day when you log into the app
- **What it checks**: If today's date matches the `dayOfMonth` you set
- **What it does**: 
  - Creates a transaction
  - Deducts money from the specified card
  - Marks the expense as processed for this month

### 3. Example Timeline

**January 5th**: You create a recurring expense:
- Name: "Netflix"
- Amount: $15.99
- Day of Month: 15
- Card: Your Visa card
- ❌ **Nothing is charged yet**

**January 15th**: You log into the app:
- ✅ System detects it's the 15th
- ✅ Creates transaction: "Netflix (Auto-Pay) - $15.99"
- ✅ Deducts $15.99 from your Visa card
- ✅ Marks as processed for January

**February 15th**: You log into the app:
- ✅ System detects it's the 15th again
- ✅ Creates another transaction
- ✅ Deducts $15.99 again
- ✅ Marks as processed for February

## Important Notes

### ⚠️ You Must Log In
- The processing only happens when you open the app
- If you don't log in on the due date, it will process the next time you log in
- Each expense is only processed once per month (won't double-charge)

### 📅 Day of Month
- You can set any day from 1-31
- If you set day 31 and the month only has 30 days, it won't process that month
- Best to use days 1-28 to ensure it processes every month

### 💳 Card Balance
- The system checks if you have sufficient funds before processing
- For debit cards: Checks if balance >= expense amount
- For credit cards: Checks if available credit >= expense amount
- If insufficient funds, the expense is logged as failed and won't be retried automatically

### 🔄 Viewing Recurring Expenses
- Go to the Calendar page to see all your recurring expenses
- You can see upcoming charges and their due dates
- You can activate/deactivate recurring expenses

## Technical Details

### Processing Logic
```
1. User logs into dashboard
2. Hook runs: useRecurringExpenseProcessor()
3. Checks localStorage: Have we processed today?
4. If no, calls: processDueExpenses(userId)
5. Gets all active recurring expenses
6. Filters: dayOfMonth === today AND not processed this month
7. For each due expense:
   - Check card balance
   - Create transaction
   - Update card balance
   - Mark expense as processed
8. Saves today's date to localStorage
```

### Files Involved
- `/src/hooks/useRecurringExpenseProcessor.ts` - Auto-processing hook
- `/src/lib/services/recurringExpensePayments.ts` - Processing logic
- `/src/app/(dashboard)/layout.tsx` - Triggers the hook
- `/src/components/recurring/AddRecurringExpenseModal.tsx` - Create UI

## FAQ

**Q: What if I don't log in on the due date?**
A: The expense will be processed the next time you log in, but only once per month.

**Q: Can I see what will be charged today?**
A: Yes, check the Calendar page for upcoming expenses.

**Q: What if I want to skip a month?**
A: Deactivate the recurring expense before the due date, then reactivate it later.

**Q: Can I change the due date?**
A: Yes, edit the recurring expense to change the day of month.

**Q: What happens if my card doesn't have enough money?**
A: The charge fails, gets logged as an error, and won't be retried automatically. You'll need to manually add a transaction or ensure sufficient funds next month.
