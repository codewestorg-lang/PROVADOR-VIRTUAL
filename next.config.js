/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['d26lpennugtm8s.cloudfront.net', 'oaidalleapiprodscus.blob.core.windows.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
