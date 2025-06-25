/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['covers.openlibrary.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/b/**',
      },
    ],
  },
}

module.exports = nextConfig