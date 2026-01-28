/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acdn-us.mitiendanube.com',
      },
      {
        protocol: 'https',
        hostname: 'd26lpennugtm8s.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'api.tiendanube.com',
      },
    ],
    // Fallback para permitir todas as origens em desenvolvimento
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Permitir requisições para o n8n
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
