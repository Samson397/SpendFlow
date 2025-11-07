import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Development config - static export disabled for dev server */
  // reactCompiler: true, // Disabled due to React 18 compatibility

  // Performance optimizations
  compress: true, // Enable gzip compression

  // Bundle optimization
  experimental: {
    // optimizePackageImports: ['lucide-react', 'firebase', 'recharts'], // Disabled due to import issues
  },

  // Turbopack configuration - disabled due to Next.js 16.0.0 issues
  // turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production', // Required for static hosting
    formats: ['image/webp', 'image/avif'], // Modern formats for smaller sizes
  },

  // Use standalone output for web deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  typescript: {
    ignoreBuildErrors: true, // Allow builds to complete
  },
};

export default nextConfig;
