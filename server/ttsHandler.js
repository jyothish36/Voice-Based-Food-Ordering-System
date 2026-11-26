import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

// Setup persistent TTS cache directory
const TTS_CACHE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), '.tts_cache')
  : path.resolve(process.cwd(), '.tts_cache');
if (!fs.existsSync(TTS_CACHE_DIR)) {
  try {
    fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
  } catch (e) {
    // Ignore directory creation failure
  }
}

const ttsMemoryCache = new Map();

// Helper to read .env file manually if process.env doesn't have the key yet
function getApiKeyFromEnv() {
  if (process.env.GOOGLE_TTS_API_KEY && process.env.GOOGLE_TTS_API_KEY.trim() !== '') {
    return process.env.GOOGLE_TTS_API_KEY.trim();
  }
  if (process.env.GOOGLE_CLOUD_API_KEY && process.env.GOOGLE_CLOUD_API_KEY.trim() !== '') {
    return process.env.GOOGLE_CLOUD_API_KEY.trim();
  }
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '') {
    return process.env.GOOGLE_API_KEY.trim();
  }

  // Fallback: Check local .env files
  const envPaths = ['.env', '.env.local'];
  for (const envFile of envPaths) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^\s*(GOOGLE_TTS_API_KEY|GOOGLE_CLOUD_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)$/);
          if (match && match[2]) {
            const val = match[2].trim().replace(/^['"]|['"]$/g, '');
            if (val) return val;
          }
        }
      } catch (err) {
        // Ignore read error
      }
    }
  }

  return '';
}

/**
 * Applies SSML pronunciation formatting
 */
export function applyPronunciationSSML(text) {
  if (!text) return '';
  let inner = text;
  // If already wrapped in <speak>, extract inner
  if (/<speak>[\s\S]*<\/speak>/i.test(inner)) {
    inner = inner.replace(/<\/?speak>/gi, '');
  }

  const isMalayalam = /[\u0D00-\u0D7F]/.test(inner);

  // Convert Indian rupee symbol ₹X into natural spoken form
  if (isMalayalam) {
    inner = inner.replace(/₹\s*(\d+(?:\.\d+)?)/g, '$1 രൂപ');
  } else {
    inner = inner.replace(/₹\s*(\d+(?:\.\d+)?)/g, '$1 rupees');
  }

  // Replace occurrences of Pazham Pori with Malayalam pronunciation alias if English text
  if (!isMalayalam) {
    inner = inner.replace(/(?:<sub\s+alias=["'][^"']*["']>\s*)?pazham\s+pori(?:\s*<\/sub>)?/gi, '<sub alias="പഴം പൊരി">Pazham Pori</sub>');
  }

  return `<speak>${inner}</speak>`;
}

/**
 * Direct Google Cloud TTS service fallback (no API key required)
 * Automatically detects Malayalam and synthesizes native Malayalam voice
 */
async function synthesizeWithGoogleCloudFallback(text) {
  let speechText = text;
  // If SSML <sub alias="..."> is present, extract the alias value
  speechText = speechText.replace(/<sub\s+alias=["']([^"']+)["']>[\s\S]*?<\/sub>/gi, '$1');
  // Strip any other SSML tags
  speechText = speechText.replace(/<[^>]+>/g, ' ');

  const isMalayalam = /[\u0D00-\u0D7F]/.test(speechText);

  // Convert currency symbol ₹ to spoken form
  if (isMalayalam) {
    speechText = speechText.replace(/₹\s*(\d+(?:\.\d+)?)/g, '$1 രൂപ');
  } else {
    speechText = speechText.replace(/₹\s*(\d+(?:\.\d+)?)/g, '$1 rupees');
  }

  speechText = speechText.replace(/\s+/g, ' ').trim();

  const tl = isMalayalam ? 'ml' : 'en-IN';
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(speechText)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Cloud TTS service returned HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

/**
 * Call Google Cloud Text-to-Speech API
 */
export async function synthesizeWithGoogleTTS({
  text,
  voiceName = null,
  languageCode = null,
  gender = process.env.GOOGLE_TTS_GENDER || 'FEMALE',
  rate = parseFloat(process.env.GOOGLE_TTS_SPEAKING_RATE || '1.0'),
  pitch = parseFloat(process.env.GOOGLE_TTS_PITCH || '0.0')
}) {
  const isMalayalam = /[\u0D00-\u0D7F]/.test(text) || languageCode === 'ml-IN' || languageCode === 'ml';
  const resolvedLang = isMalayalam ? 'ml-IN' : (languageCode || process.env.GOOGLE_TTS_LANGUAGE_CODE || 'ml-IN');
  const resolvedVoice = voiceName || (isMalayalam ? 'ml-IN-Wavenet-A' : (process.env.GOOGLE_TTS_VOICE_NAME || 'ml-IN-Wavenet-A'));

  const cleanText = text.trim();
  const cacheKey = `${resolvedLang}_${resolvedVoice}_${rate}_${pitch}_${cleanText}`;

  // 1. Fast in-memory cache check (0ms)
  if (ttsMemoryCache.has(cacheKey)) {
    return {
      audioContent: ttsMemoryCache.get(cacheKey),
      format: 'mp3',
      source: 'cache-memory'
    };
  }

  // 2. Persistent disk cache check (<2ms)
  const hash = crypto.createHash('md5').update(cacheKey).digest('hex');
  const cacheFilePath = path.join(TTS_CACHE_DIR, `${hash}.json`);
  if (fs.existsSync(cacheFilePath)) {
    try {
      const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      if (cachedData && cachedData.audioContent) {
        ttsMemoryCache.set(cacheKey, cachedData.audioContent);
        return {
          audioContent: cachedData.audioContent,
          format: 'mp3',
          source: 'cache-disk'
        };
      }
    } catch (e) {
      // Ignore read error and re-synthesize
    }
  }

  const saveToCache = (base64Content) => {
    if (!base64Content) return;
    ttsMemoryCache.set(cacheKey, base64Content);
    try {
      fs.writeFileSync(cacheFilePath, JSON.stringify({
        text: cleanText,
        audioContent: base64Content,
        createdAt: new Date().toISOString()
      }), 'utf8');
    } catch (e) {
      // Ignore write errors
    }
  };

  const apiKey = getApiKeyFromEnv();
  const ssml = applyPronunciationSSML(text);

  // If API key is provided, use Google Cloud Text-to-Speech v1 REST API
  if (apiKey) {
    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`;

    const requestBody = {
      input: { ssml },
      voice: {
        languageCode: resolvedLang,
        name: resolvedVoice,
        ssmlGender: gender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: rate,
        pitch: pitch,
        sampleRateHertz: 24000
      }
    };

    try {
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(requestBody)
      });

      // If requested voice is not enabled/available, fallback to standard voice
      if (!response.ok && resolvedVoice.includes('Wavenet')) {
        const fallbackBody = {
          ...requestBody,
          voice: {
            languageCode: resolvedLang,
            name: `${resolvedLang}-Standard-A`,
            ssmlGender: gender
          }
        };
        const fallbackResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(fallbackBody)
        });
        if (fallbackResponse.ok) {
          response = fallbackResponse;
        }
      }

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          saveToCache(data.audioContent);
          return { audioContent: data.audioContent, format: 'mp3', source: 'google-cloud-v1' };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn('[Google Cloud TTS API Error, falling back to Google Cloud voice service]:', errJson.error?.message || response.status);
      }
    } catch (err) {
      console.warn('[Google Cloud TTS API Network Error, falling back]:', err.message);
    }
  }

  // Automatic Google Cloud TTS service fallback (supports Malayalam natively)
  try {
    const fallbackAudio = await synthesizeWithGoogleCloudFallback(ssml);
    saveToCache(fallbackAudio);
    return {
      audioContent: fallbackAudio,
      format: 'mp3',
      source: 'google-cloud-tts'
    };
  } catch (err) {
    console.error('[Google Cloud TTS Failed]:', err.message);
    return {
      error: err.message
    };
  }
}

/**
 * HTTP Middleware handler for /api/tts
 */
export async function ttsMiddlewareHandler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      const text = parsed.text;

      if (!text || typeof text !== 'string' || text.trim() === '') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing or empty text parameter.' }));
        return;
      }

      const result = await synthesizeWithGoogleTTS({
        text: text.trim(),
        voiceName: parsed.voiceName,
        languageCode: parsed.languageCode,
        gender: parsed.gender,
        rate: parsed.rate,
        pitch: parsed.pitch
      });

      if (result.error) {
        res.statusCode = result.isMissingKey ? 401 : (result.status || 500);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        audioContent: result.audioContent,
        format: 'mp3'
      }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to process TTS request: ' + err.message }));
    }
  });
}
