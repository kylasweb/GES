import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Vercel-specific configurations
  poweredByHeader: false,
  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
  // Enable compression
  compress: true,
  // Enable experimental features
  experimental: {
    optimizeCss: true,
    webpackBuildWorker: true,
  },
};

export default nextConfig;