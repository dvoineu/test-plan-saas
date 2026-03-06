import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev) {
      const existingOptions = config.watchOptions || {};

      // Safely extract existing ignored patterns, ensuring they are an array and filtering out falsy values
      let ignoredArray: string[] = [];
      if (Array.isArray(existingOptions.ignored)) {
        ignoredArray = existingOptions.ignored.filter(Boolean);
      } else if (typeof existingOptions.ignored === 'string' && existingOptions.ignored) {
        ignoredArray = [existingOptions.ignored];
      }

      // Avoid mutating the read-only watchOptions object directly
      config.watchOptions = {
        ...existingOptions,
        ignored: process.env.DISABLE_HMR === 'true' ? /.*/ : [
          ...ignoredArray,
          '**/dev.db',
          '**/dev.db-*',
          '**/electron/**'
        ]
      };
    }
    return config;
  },
};

export default nextConfig;
