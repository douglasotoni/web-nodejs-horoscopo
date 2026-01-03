/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para hot reload no Docker
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Verifica mudanças a cada segundo
      aggregateTimeout: 300, // Delay antes de recompilar
    }
    return config
  },
}

module.exports = nextConfig

