/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'your-supabase-project.supabase.co'],
    unoptimized: process.env.NODE_ENV === 'production', // This helps with Netlify deployment
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'https://farm2fork-api.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
