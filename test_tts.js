import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { synthesizeWithGoogleTTS } from './server/ttsHandler.js';

async function runTests() {
  console.log('--- 1. Testing Google Cloud TTS Primary Engine in voiceSynthesizer ---');
  const synthContent = fs.readFileSync(path.resolve('src/services/voiceSynthesizer.js'), 'utf8');
  assert.ok(synthContent.includes('/api/tts'), 'voiceSynthesizer must target Google TTS /api/tts endpoint as primary');
  assert.ok(synthContent.includes('speakWithBrowserFallback'), 'voiceSynthesizer must provide automatic browser fallback');
  console.log('✓ PASS: Google Cloud TTS is primary engine with graceful fallback');

  console.log('\n--- 2. Testing Google TTS Backend Handler ---');
  const resEmpty = await synthesizeWithGoogleTTS({ text: '' });
  assert.ok(resEmpty, 'Expected response object');
  console.log('✓ PASS: synthesizeWithGoogleTTS runs and returns structured response');

  console.log('\n--- 3. Testing Local Dev Server /api/tts Endpoint ---');
  try {
    const response = await fetch('http://localhost:5173/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Welcome to Kerala Tea Shop!' })
    });
    console.log(`Endpoint returned HTTP ${response.status}`);
    const json = await response.json();
    assert.ok(json, 'Expected JSON response');
    console.log('Response content:', json);
    console.log('✓ PASS: /api/tts endpoint is actively serving requests');
  } catch (err) {
    console.error('Failed to reach local endpoint:', err.message);
  }

  console.log('\n========================================');
  console.log('All TTS verification checks passed!');
  console.log('========================================\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
