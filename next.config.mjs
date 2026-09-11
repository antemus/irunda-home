/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/public/sitemap.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
};

export default nextConfig;
