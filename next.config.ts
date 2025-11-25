import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable standalone output for custom server deployment
  output: 'standalone',
  // Vercel-specific configurations
  poweredByHeader: false,
  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
  // Enable compression
  compress: true,
};

export default nextConfig;