/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' - incompatible with server features
  // distDir: 'dist', // Use default .next for development
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Enable type checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable linting
  },
  // Webpack configuration for better module resolution
  webpack: (config, { isServer }) => {
    // Don't override devtool in development (causes performance issues)
    // Next.js handles this automatically
    
    // Ensure proper module resolution
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
