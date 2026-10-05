/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_E2E === '1' ? { distDir: '.next-e2e' } : {}),
  images: {
    unoptimized: true,
  },
}

export default nextConfig
