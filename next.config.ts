import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_STATIC_EXPORT === 'true' ? 'export' : undefined,

  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Performance: experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'framer-motion', '@dnd-kit/core', '@dnd-kit/sortable'],
  },
};

export default nextConfig;
