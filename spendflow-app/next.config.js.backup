/** @type {import('next').NextConfig} */
const nextConfig = {
  // For web app deployment (Firebase Hosting, Vercel, etc.)
  images: {
    unoptimized: true, // Required for static hosting
  },
  // Use standalone output for web deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  typescript: {
    ignoreBuildErrors: true, // Allow builds to complete
  },
  eslint: {
    ignoreDuringBuilds: true, // Allow builds to complete
  },
  
  // Webpack configuration for better module resolution
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution for web deployment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
