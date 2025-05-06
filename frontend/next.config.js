/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'your-supabase-project.supabase.co'],
    unoptimized: process.env.NODE_ENV === 'production', // This helps with Netlify deployment
  },
  // Add output configuration for static export
  output: 'export',
  // Disable server-side features that are incompatible with static export
  distDir: 'out',
  // Keep the rewrites for development but not for production static export
  async rewrites() {
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api/:path*',
          destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'https://farm2fork-api.onrender.com/api/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
