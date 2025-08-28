/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  basePath: '',
  webpack: (config) => {
    // Handle node modules in Electron environment
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false
    }
    
    return config
  }
}

module.exports = nextConfig