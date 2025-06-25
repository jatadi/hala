/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'media.formula1.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ferrari.com',
        pathname: '/cms/network/media/img/**',
      }
    ],
    domains: [
      'media.formula1.com',
      'example.com',
      'ui-avatars.com',
      'formulaonestuff.com',
      'cdn.ferrari.com'
    ],
  },
};

export default nextConfig; 