import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { ttsMiddlewareHandler } from './server/ttsHandler.js'
import { geminiMiddlewareHandler } from './server/geminiHandler.js'

function googleTtsPlugin() {
  return {
    name: 'google-tts-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/tts', (req, res) => {
        ttsMiddlewareHandler(req, res);
      });
      server.middlewares.use('/api/gemini', (req, res) => {
        geminiMiddlewareHandler(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/tts', (req, res) => {
        ttsMiddlewareHandler(req, res);
      });
      server.middlewares.use('/api/gemini', (req, res) => {
        geminiMiddlewareHandler(req, res);
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), googleTtsPlugin()],
})

