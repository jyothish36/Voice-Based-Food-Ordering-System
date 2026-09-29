import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { geminiMiddlewareHandler } from './server/geminiHandler.js';
import { ttsMiddlewareHandler } from './server/ttsHandler.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup TTS cache directory (ensure it exists)
const TTS_CACHE_DIR = path.join(__dirname, '.tts_cache');
if (!fs.existsSync(TTS_CACHE_DIR)) {
  try {
    fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
  } catch (e) {
    console.warn('[Server] Could not create .tts_cache directory, disk caching may be unavailable.');
  }
}

// API Routes
// Note: We intentionally avoid express.json() here because the handlers
// manually consume the request data stream (req.on('data')).
app.post('/api/gemini', (req, res) => {
  geminiMiddlewareHandler(req, res);
});

app.post('/api/tts', (req, res) => {
  ttsMiddlewareHandler(req, res);
});

// Serve static assets from the React production build
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: Any other request routes to index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

// Error handling middleware (just in case)
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving static files from /dist`);
});
