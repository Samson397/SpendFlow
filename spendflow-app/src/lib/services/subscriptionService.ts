// Stub subscription service to prevent breaking changes
// This maintains compatibility while subscription features are removed

export const subscriptionService = {
  getPlans: async () => [],
  getUserSubscription: async (userId: string) => null,
  updateSubscription: async (userId: string, subscriptionId: string, data: any) => null,
  createSubscription: async (userId: string, data: any) => null,
};
