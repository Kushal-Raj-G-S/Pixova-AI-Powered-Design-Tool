/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'api.a4f.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors (for faster builds during development)
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack for faster builds
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              chunks: 'all',
              test: /node_modules/,
              name: 'vendor',
            },
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig