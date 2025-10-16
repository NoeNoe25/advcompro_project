/** @type {import('next').NextConfig} */

// For client-side requests (browser), use localhost
// For server-side requests (Docker internal), use service name
const isServer = typeof window === 'undefined';
const API_URL = isServer ? "http://fastapi:8000" : "http://localhost:8000";

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
  // Remove the webpackDevMiddleware section entirely
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      }
    }
    return config
  },
};

export default nextConfig;