import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const localApiTarget = env.VITE_LOCAL_API_URL || 'http://127.0.0.1:3099'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/contact': {
          target: localApiTarget,
          changeOrigin: true,
        },
        '/vision': {
          target: localApiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
