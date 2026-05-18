import { createReadStream, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

const rootDir = dirname(fileURLToPath(import.meta.url))
const mediaPipeWasmDir = join(rootDir, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm')

function mediaPipeWasmPlugin(): Plugin {
  const files = new Set(readdirSync(mediaPipeWasmDir))

  return {
    name: 'local-mediapipe-wasm',
    configureServer(server) {
      server.middlewares.use('/mediapipe/wasm', (request, response, next) => {
        const fileName = decodeURIComponent((request.url || '').split('?')[0].replace(/^\/+/, ''))
        if (!files.has(fileName)) {
          next()
          return
        }

        response.setHeader('Content-Type', fileName.endsWith('.wasm') ? 'application/wasm' : 'application/javascript')
        createReadStream(join(mediaPipeWasmDir, fileName)).pipe(response)
      })
    },
    generateBundle() {
      for (const fileName of files) {
        this.emitFile({
          type: 'asset',
          fileName: `mediapipe/wasm/${fileName}`,
          source: readFileSync(join(mediaPipeWasmDir, fileName)),
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mediaPipeWasmPlugin()],
})
