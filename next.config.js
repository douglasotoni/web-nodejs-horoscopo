/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CORS é aplicado no middleware.ts (permite diversos domínios; opcional ALLOWED_ORIGINS)
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

