'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface GoogleAdSenseProps {
  adSlot: string;
  format?: string;
  responsive?: boolean | 'true' | 'false';
  className?: string;
  style?: React.CSSProperties;
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  adSlot,
  format = 'auto',
  responsive = true,
  className = '',
  style = {},
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Failed to push ad', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_ADSENSE_ID"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      ></ins>
    </div>
  );
};

export default GoogleAdSense;
