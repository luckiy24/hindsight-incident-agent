/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/backend/**', '**/frontend/**', '**/.git/**'],
    };
    return config;
  },
};

export default nextConfig;
