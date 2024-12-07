/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["i.imgur.com"]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://postgresql.memcoin.stepzen.net/api/memecoin/:path*', // StepZen endpoint
      },
    ];
  },
};

module.exports = nextConfig;

