/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      'plus.unsplash.com',
    ],
  },
  experimental: {
    runtime: 'experimental-edge',
  },
};

export default nextConfig;
