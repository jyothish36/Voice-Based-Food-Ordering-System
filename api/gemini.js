import { callGeminiForMalayalam } from '../server/geminiHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { transcript, alternatives, currentState } = parsed;

    if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return res.status(400).json({ error: 'Missing transcript parameter.' });
    }

    const result = await callGeminiForMalayalam({
      transcript: transcript.trim(),
      alternatives: alternatives || [],
      currentState: currentState || {}
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process Gemini request: ' + err.message });
  }
}
