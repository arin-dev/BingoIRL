/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
      if (process.env.NODE_ENV === 'production') {
        return [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN}/api/:path*`,
          },
        ];
      } else {
        return [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_DEV_DOMAIN}/api/:path*`,
          },
        ];
      }
    },
  }
  
  export default nextConfig;