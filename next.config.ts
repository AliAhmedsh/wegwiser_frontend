import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Environment variables configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  },
  async headers() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'https://bfp7ecvmnz.us-east-2.awsapprunner.com';
    
    const connectSources = [
      "'self'",
      'https://dev-7yf0quijjygyy5p0.us.auth0.com',
      'https://*.auth0.com',
    ];

    if (backendUrl.startsWith('http://')) {
      connectSources.push(backendUrl);
      const wsUrl = backendUrl.replace('http://', 'ws://');
      connectSources.push(wsUrl);
    } else if (backendUrl.startsWith('https://')) {
      connectSources.push(backendUrl);
      const wssUrl = backendUrl.replace('https://', 'wss://');
      connectSources.push(wssUrl);
    }

    if (fastApiUrl.startsWith('http://')) {
      connectSources.push(fastApiUrl);
      const wsUrl = fastApiUrl.replace('http://', 'ws://');
      connectSources.push(wsUrl);
    } else if (fastApiUrl.startsWith('https://')) {
      connectSources.push(fastApiUrl);
      const wssUrl = fastApiUrl.replace('https://', 'wss://');
      connectSources.push(wssUrl);
    }

    const csp = [
      "default-src 'self'",
      `connect-src ${connectSources.join(' ')}`,
      `img-src 'self' data: https: http: blob: ${backendUrl}`,
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
      "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com",
      "worker-src 'self' blob: data:",
      "child-src 'self' blob:",
      "frame-src 'self' https:"
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
          },
        },
      ],
    });

    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
