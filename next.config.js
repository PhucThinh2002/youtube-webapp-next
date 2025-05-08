/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
    domains: [
      'yt3.ggpht.com',
      'i.ytimg.com'
    ],
  },
}

module.exports = nextConfig