// Ad performance metrics
type AdEvent = 'impression' | 'click' | 'viewable' | 'error';

interface AdEventParams {
  adUnit: string;
  location: string;
  adSize?: string;
  testVariant?: string;
  error?: string;
}

/**
 * Track ad-related events
 */
export const trackAdEvent = (
  event: AdEvent,
  { adUnit, location, adSize, testVariant, error }: AdEventParams
) => {
  if (typeof window === 'undefined') return;

  const eventData: Record<string, any> = {
    event_category: 'ad',
    event_label: adUnit,
    ad_location: location,
    ...(adSize && { ad_size: adSize }),
    ...(testVariant && { test_variant: testVariant }),
    ...(error && { error_message: error })
  };

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', `ad_${event}`, eventData);
  }

  // For debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Ad Event] ${event}`, eventData);
  }
};

/**
 * Track ad impression
 */
export const trackAdImpression = (params: Omit<AdEventParams, 'error'>) => {
  trackAdEvent('impression', params);
};

/**
 * Track ad click
 */
export const trackAdClick = (params: Omit<AdEventParams, 'error'>) => {
  trackAdEvent('click', params);
};

/**
 * Track ad error
 */
export const trackAdError = (params: Omit<AdEventParams, 'error'> & { error: string }) => {
  trackAdEvent('error', params);
};

/**
 * Track when ad becomes viewable
 */
export const trackAdViewable = (params: Omit<AdEventParams, 'error'>) => {
  trackAdEvent('viewable', params);
};

/**
 * Track ad revenue (for header bidding or direct deals)
 */
export const trackAdRevenue = (params: {
  adUnit: string;
  location: string;
  revenue: number;
  currency: string;
  adSize?: string;
}) => {
  if (window.gtag) {
    window.gtag('event', 'ad_revenue', {
      event_category: 'ad',
      event_label: params.adUnit,
      value: params.revenue,
      currency: params.currency,
      ad_location: params.location,
      ...(params.adSize && { ad_size: params.adSize })
    });
  }
};

/**
 * Track A/B test assignment
 */
export const trackAdTestAssignment = (testName: string, variant: string) => {
  if (window.gtag) {
    window.gtag('event', 'ad_test_assignment', {
      event_category: 'ad_testing',
      test_name: testName,
      variant: variant
    });
  }
};
