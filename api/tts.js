import { synthesizeWithGoogleTTS } from '../server/ttsHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = parsed.text;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty text parameter.' });
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
      return res.status(result.isMissingKey ? 401 : (result.status || 500)).json(result);
    }

    return res.status(200).json({
      audioContent: result.audioContent,
      format: 'mp3'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process TTS request: ' + err.message });
  }
}
