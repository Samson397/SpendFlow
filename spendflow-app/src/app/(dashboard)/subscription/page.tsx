import { AuthGate } from '@/components/auth/AuthGate';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';

export default function SubscriptionPage() {
  return (
    <AuthGate>
      <SubscriptionPlans />
    </AuthGate>
  );
}
