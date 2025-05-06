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
  // Removed rewrites as they're incompatible with static export mode
};

module.exports = nextConfig;
