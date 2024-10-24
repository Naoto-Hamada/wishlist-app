/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
    ],
  },
  experimental: {
    runtime: 'experimental-edge',
  },
};

export default nextConfig;
