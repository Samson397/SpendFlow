import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Development config - static export disabled for dev server */
  reactCompiler: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;
