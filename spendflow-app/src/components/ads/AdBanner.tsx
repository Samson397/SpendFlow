'use client';

import { useEffect, useState } from 'react';
import GoogleAdSense from './GoogleAdSense';

type AdBannerProps = {
  size?: 'small' | 'medium' | 'large' | 'responsive';
  className?: string;
  adUnit?: string;
  style?: React.CSSProperties;
};

const AdBanner = ({ 
  size = 'medium', 
  className = '', 
  adUnit,
  style = {}
}: AdBannerProps) => {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect if we're on the client and check for ad blockers
  useEffect(() => {
    setIsClient(true);
    
    const checkAdBlock = async () => {
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
        });
      } catch (e) {
        setAdBlockDetected(true);
      }
    };
    
    checkAdBlock();
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return null;
  }

  // Ad sizes
  const adSizes = {
    small: { width: 300, height: 250 },   // Medium Rectangle
    medium: { width: 300, height: 600 },  // Half Page
    large: { width: 728, height: 90 },    // Leaderboard
    responsive: { width: '100%', height: 'auto' } // Responsive
  };

  // Fallback content if no ad unit or ad blocker detected
  if (adBlockDetected || !adUnit) {
    return (
      <div 
        className={`${className} bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-500`}
        style={{ 
          ...adSizes[size as keyof typeof adSizes],
          ...style,
          minHeight: size === 'responsive' ? '250px' : `${adSizes[size as keyof typeof adSizes]?.height}px`,
          maxWidth: '100%',
          margin: '0 auto'
        }}
      >
        <div className="text-center p-4">
          <p className="text-sm">Advertisement</p>
          {adBlockDetected && (
            <p className="text-xs mt-1">Please consider supporting us by disabling your ad blocker</p>
          )}
        </div>
      </div>
    );
  }

  // Render actual ad
  return (
    <div 
      className={className} 
      style={{
        ...(size === 'responsive' ? { width: '100%' } : adSizes[size as keyof typeof adSizes]),
        ...style,
        margin: '0 auto',
        overflow: 'hidden'
      }}
    >
      <GoogleAdSense 
        adSlot={adUnit}
        format={size === 'responsive' ? 'auto' : undefined}
        responsive={size === 'responsive'}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: size === 'responsive' ? '250px' : `${adSizes[size as keyof typeof adSizes]?.height}px`,
        }}
      />
    </div>
  );
};

export default AdBanner;
