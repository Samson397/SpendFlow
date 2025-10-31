'client';

import { useEffect, useState } from 'react';
import AdBanner from './AdBanner';

// Define ad unit types
type AdUnitKey = 'SIDEBAR' | 'IN_CONTENT' | 'BOTTOM_BANNER' | 'MOBILE_FOOTER';

// Ad unit configurations
const AD_UNITS: Record<AdUnitKey, {
  id: string;
  size: 'small' | 'medium' | 'large' | 'responsive';
  className?: string;
  testVariations?: Record<string, { id: string }>;
}> = {
  SIDEBAR: {
    id: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR || 'YOUR_SIDEBAR_AD_UNIT',
    size: 'medium',
    className: 'my-4'
  },
  IN_CONTENT: {
    id: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT || 'YOUR_IN_CONTENT_AD_UNIT',
    size: 'small',
    className: 'my-6',
    testVariations: {
      default: { id: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT || 'YOUR_IN_CONTENT_AD_UNIT' },
      variant_a: { id: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT_A || 'YOUR_IN_CONTENT_AD_UNIT_A' },
      variant_b: { id: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT_B || 'YOUR_IN_CONTENT_AD_UNIT_B' }
    }
  },
  BOTTOM_BANNER: {
    id: process.env.NEXT_PUBLIC_ADSENSE_BOTTOM || 'YOUR_BOTTOM_BANNER_UNIT',
    size: 'large',
    className: 'my-8'
  },
  MOBILE_FOOTER: {
    id: process.env.NEXT_PUBLIC_ADSENSE_MOBILE || 'YOUR_MOBILE_FOOTER_UNIT',
    size: 'responsive',
    className: 'mt-8 lg:hidden'
  }
};

interface AdManagerProps {
  adUnit: AdUnitKey;
  className?: string;
  testVariant?: string;
}

const AdManager: React.FC<AdManagerProps> = ({ 
  adUnit, 
  className = '',
  testVariant = 'default'
}) => {
  const [adUnitConfig, setAdUnitConfig] = useState(AD_UNITS[adUnit]);
  
  // Apply A/B test variations if available
  useEffect(() => {
    if (adUnitConfig.testVariations && testVariant) {
      setAdUnitConfig(prev => ({
        ...prev,
        id: prev.testVariations?.[testVariant]?.id || prev.id
      }));
    }
  }, [adUnit, testVariant, adUnitConfig.testVariations]);

  // Get the final ad unit ID
  const getAdUnitId = () => {
    if (adUnitConfig.testVariations && testVariant) {
      return adUnitConfig.testVariations[testVariant]?.id || adUnitConfig.id;
    }
    return adUnitConfig.id;
  };

  return (
    <div className={`ad-container ${adUnitConfig.className} ${className}`}>
      <AdBanner 
        size={adUnitConfig.size} 
        adUnit={getAdUnitId()}
        className="mx-auto"
      />
    </div>
  );
};

export default AdManager;
