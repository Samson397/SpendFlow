# SpendFlow Subscription System Setup

This guide will help you set up the complete subscription system for SpendFlow, including Stripe payment integration.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin Configuration (existing)
NEXT_PUBLIC_ADMIN_EMAILS=user@example.com,admin@example.com
```

### 3. Set Up Stripe

1. **Create a Stripe account** at [stripe.com](https://stripe.com)

2. **Create products and prices** in your Stripe dashboard:
   - Essential (Free) - No price needed
   - Pro ($4.99/month) - Create a recurring price
   - Enterprise ($9.99/month) - Create a recurring price

3. **Copy price IDs** from Stripe dashboard and update `DEFAULT_SUBSCRIPTION_PLANS` in `/src/database/schema.ts`

4. **Set up webhook endpoint**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
   - Select events: `customer.subscription.*`, `invoice.payment_*`, `checkout.session.completed`, `customer.subscription.trial_will_end`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. Initialize Database

Run the setup script to seed your database with subscription plans:

```bash
npx tsx scripts/setup-subscriptions.ts
```

### 5. Test the System

1. **Subscribe to a plan**: Go to `/subscription` page
2. **Check subscription status**: View in dashboard
3. **Test webhooks**: Use Stripe CLI to forward events
4. **Admin management**: Access admin panel to manage plans

## 📋 Features Included

### ✅ Core Subscription Management
- **3-tier pricing**: Free, Pro ($4.99), Enterprise ($9.99)
- **Plan limits**: Cards, transactions, features per tier
- **Upgrade/downgrade**: Seamless plan changes
- **Cancellation**: Cancel at period end or immediately

### ✅ Payment Integration
- **Stripe integration**: Secure payment processing
- **Webhook handling**: Automatic status updates
- **Payment methods**: Card management
- **Invoice management**: Payment history and receipts

### ✅ Access Control
- **Feature gating**: Limit access based on subscription
- **Usage tracking**: Monitor card/transaction counts
- **Upgrade prompts**: Smart upgrade suggestions
- **Admin controls**: Manage user subscriptions

### ✅ User Experience
- **Modern UI**: Clean, professional design
- **Responsive**: Works on all devices
- **Real-time updates**: Live subscription status
- **Notifications**: Email alerts for subscription events

## 🏗️ Architecture

### Database Collections
- `subscriptionPlans`: Available plans and pricing
- `userSubscriptions`: User subscription records
- `subscriptionPayments`: Payment transaction history
- `subscriptionChanges`: Plan change history
- `subscriptionNotifications`: User notifications

### API Endpoints
- `POST /api/stripe/create-subscription`: Create new subscription
- `POST /api/stripe/update-subscription`: Change plans
- `POST /api/stripe/cancel-subscription`: Cancel subscription
- `POST /api/stripe/webhooks`: Handle Stripe events
- `GET /api/stripe/payment-methods`: Get user payment methods

### Services
- `subscriptionService`: Core subscription logic
- `stripePaymentService`: Payment processing
- `accessControlService`: Feature access control

## 🔧 Configuration

### Plan Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Cards | 2 | 5 | Unlimited |
| Transactions | 10 | Unlimited | Unlimited |
| Analytics | ❌ | ✅ | ✅ |
| Export | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

### Stripe Price IDs

Update these in `/src/database/schema.ts`:

```typescript
const DEFAULT_SUBSCRIPTION_PLANS = [
  // ... existing plans with stripePriceId added
  {
    name: 'pro_monthly',
    stripePriceId: 'price_xxx', // Your Stripe price ID
    // ...
  }
];
```

## 🧪 Testing

### Test Cards (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires auth**: `4000 0025 0000 3155`

### Webhook Testing
Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

## 🚨 Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure raw body is passed to webhook handler

2. **Subscription not activating**
   - Verify Stripe price IDs are correct
   - Check webhook events are being received

3. **Payment fails**
   - Ensure test mode is enabled
   - Check card details are valid for testing

4. **Access control not working**
   - Verify user subscription is active
   - Check plan limits are correctly set

### Logs and Debugging

- Check browser console for client-side errors
- Check server logs for API errors
- Use Stripe dashboard to monitor payments
- Check Firebase console for database issues

## 📞 Support

For issues with the subscription system:
1. Check this documentation
2. Review Stripe documentation
3. Check GitHub issues
4. Contact the development team

## 🔒 Security Notes

- Never expose secret keys in client-side code
- Always verify webhook signatures
- Store payment data securely
- Use HTTPS in production
- Regularly rotate API keys

---

*Last updated: November 2025*
