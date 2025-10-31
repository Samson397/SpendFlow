'use client';

import Script from 'next/script';

export const GoogleAdSenseScript = () => {
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID"
    />
  );
};

export default GoogleAdSenseScript;
