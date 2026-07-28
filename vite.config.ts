import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables for the current mode so we can use them in config
  const env = loadEnv(mode, process.cwd(), '')

  const apiTarget = env.VITE_API_URL ?? 'http://localhost:5000/api/v1'
  // Extract just the origin (protocol + host + port) for the proxy target
  const apiOrigin = (() => {
    try { return new URL(apiTarget).origin } catch { return 'http://localhost:5000' }
  })()

  return {
    plugins: [react()],

    // In local development, proxy /api/* requests to the backend.
    // This avoids CORS issues entirely when running both locally.
    // In production (Vercel), the full VITE_API_URL is used directly.
    server: {
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
