/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN}/api/:path*`, // Points to your external API
  //     },
  //   ];
  // },
};

export default nextConfig;