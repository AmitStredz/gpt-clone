/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Keep lint errors during builds to maintain quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Do not ignore build errors so strict typing is enforced
    ignoreBuildErrors: false,
  },
  images: {
    // We'll allow remote Cloudinary images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
