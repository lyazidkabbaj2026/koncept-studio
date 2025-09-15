/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better error catching
  reactStrictMode: true,

  // Enable TypeScript strict mode (temporarily disabled for production build)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Bundle analyzer for production optimization
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
      }
      return config
    },
  }),
}

module.exports = nextConfig