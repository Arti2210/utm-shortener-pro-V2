/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['uk', 'en'],
    defaultLocale: 'uk',
  },
};

module.exports = nextConfig;
