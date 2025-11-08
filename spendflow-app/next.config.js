/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use export for static site deployment
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // Optimize images
  images: {
    unoptimized: process.env.NODE_ENV === 'production', // Required for static export
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // Performance optimizations
  compress: true,
  
  // Reduce bundle size
  // Removed modularizeImports for lucide-react as it causes build errors
  // lucide-react already tree-shakes automatically

  // Enable React strict mode for better performance
  reactStrictMode: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    // Removed optimizePackageImports as it causes module resolution issues
  },
};

module.exports = nextConfig;
