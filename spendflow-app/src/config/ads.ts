// Ad configuration for the application

// Base configuration
export const adConfig = {
  // Enable/disable ads
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  
  // Default ad refresh interval in seconds (0 = no refresh)
  refreshInterval: 30,
  
  // Maximum number of ads per page
  maxAdsPerPage: 4,
  
  // Ad sizes
  sizes: {
    leaderboard: { width: 728, height: 90 },
    mediumRectangle: { width: 300, height: 250 },
    largeRectangle: { width: 336, height: 280 },
    halfPage: { width: 300, height: 600 },
    mobileBanner: { width: 320, height: 50 },
    responsive: { width: '100%', height: 'auto' }
  },
  
  // Ad placements
  placements: {
    HEADER: {
      enabled: false, // Disabled as per user preference
      size: 'leaderboard',
      className: 'mb-4',
      mobile: {
        enabled: false
      }
    },
    SIDEBAR: {
      enabled: true,
      size: 'mediumRectangle',
      className: 'my-4',
      mobile: {
        enabled: false
      }
    },
    IN_CONTENT: {
      enabled: true,
      size: 'mediumRectangle',
      className: 'my-8',
      frequency: 3, // Show after every 3 content items
      mobile: {
        enabled: true,
        size: 'responsive',
        frequency: 2 // More frequent on mobile
      }
    },
    BOTTOM_BANNER: {
      enabled: true,
      size: 'leaderboard',
      className: 'mt-8 mb-4',
      mobile: {
        enabled: true,
        size: 'responsive'
      }
    },
    MOBILE_FOOTER: {
      enabled: true,
      size: 'responsive',
      className: 'mt-8 lg:hidden',
      mobile: {
        enabled: true
      }
    }
  },
  
  // A/B testing configuration
  testing: {
    enabled: process.env.NEXT_PUBLIC_ADS_TESTING === 'true',
    variants: {
      in_content: {
        control: 'default',
        variants: ['variant_a', 'variant_b'],
        weights: [0.5, 0.5] // Equal distribution
      }
    }
  },
  
  // Privacy settings
  privacy: {
    npa: process.env.NEXT_PUBLIC_ADS_NPA === 'true', // Non-personalized ads
    gdpr: process.env.NEXT_PUBLIC_ADS_GDPR === 'true', // GDPR compliance
    ccpa: process.env.NEXT_PUBLIC_ADS_CCPA === 'true' // CCPA compliance
  }
};

// Get ad unit ID from environment variables with fallback
export const getAdUnitId = (placement: string, variant: string = 'default'): string => {
  const envVar = `NEXT_PUBLIC_ADS_${placement}${variant !== 'default' ? `_${variant.toUpperCase()}` : ''}`;
  const fallback = `YOUR_${placement}_AD_UNIT${variant !== 'default' ? `_${variant.toUpperCase()}` : ''}`;
  return process.env[envVar] || fallback;
};

// Check if ads should be shown
export const shouldShowAds = (): boolean => {
  // Check if ads are enabled in config
  if (!adConfig.enabled) return false;
  
  // Add any additional checks here (e.g., user subscription status)
  return true;
};

// Get ad configuration for a specific placement
export const getAdPlacementConfig = (placement: string, isMobile: boolean = false) => {
  const config = adConfig.placements[placement as keyof typeof adConfig.placements];
  
  if (!config) {
    console.warn(`No configuration found for ad placement: ${placement}`);
    return null;
  }
  
  // Return mobile config if available and on mobile
  if (isMobile && config.mobile) {
    return {
      ...config,
      ...config.mobile,
      // Use mobile size if specified, otherwise fall back to desktop size
      size: config.mobile.size || config.size
    };
  }
  
  return config;
};
