// SpeechRecognizer service

// Detect mobile browsers — continuous=true is unreliable on iOS Safari and Android Chrome
const isMobileBrowser = typeof window !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

class SpeechRecognizer {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    this.isSupported = !!SpeechRecognition;
    this.SpeechRecognitionClass = SpeechRecognition;
    this.recognition = null;
    this.isListening = false;
    this.isPausedForSpeech = false;
    this.isStarting = false;
    this.isSpeakingTTS = false;
    this.onResultCallback = null;
    this.onInterimCallback = null;
    this.onStateChangeCallback = null;
    this.onErrorCallback = null;
    this.restartTimeout = null;
    this.hasPermission = null;

    // Sentence buffering & debouncing
    this.sentenceBuffer = '';
    this.alternativesBuffer = [];
    this.sentenceTimeout = null;
    this.SENTENCE_DEBOUNCE_MS = 650; // Wait 650ms of silence before considering complete sentence finished

    // Deduplication cache to prevent repeated or duplicate triggers
    this.lastProcessedTranscript = '';
    this.lastProcessedTime = 0;
    this.DEDUP_WINDOW_MS = 2500;
    this.lastProcessedIndex = -1;

    // Configurable language: Default to Malayalam (ml-IN)
    this.lang = 'ml-IN';
    if (this.isSupported) {
      this.initRecognition();
    }
  }

  setLanguage(lang) {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  getLanguage() {
    return this.lang;
  }

  initRecognition() {
    if (!this.isSupported) return;

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (e) {
          // ignore
        }
      }

      this.recognition = new this.SpeechRecognitionClass();
      // Mobile: use single-shot mode (continuous=true is blocked by gesture policy on mobile)
      this.recognition.continuous = isMobileBrowser ? false : true;
      // Interim results work on desktop; on mobile they can cause duplicate onresult events
      this.recognition.interimResults = isMobileBrowser ? false : true;
      this.recognition.maxAlternatives = 5; // Request multiple ASR hypotheses where supported
      this.recognition.lang = this.lang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.isStarting = false;
        if (!this.isPausedForSpeech && !this.isSpeakingTTS) {
          this.notifyStateChange('LISTENING');
        }
      };

      this.recognition.onresult = (event) => {
        // Strict guard: Do not process ANY speech while AI is speaking TTS or paused
        if (this.isPausedForSpeech || this.isSpeakingTTS) {
          return;
        }

        let interimTranscript = '';
        let finalizedSegments = [];

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            if (i > this.lastProcessedIndex) {
              const alts = [];
              for (let a = 0; a < res.length; a++) {
                if (res[a] && res[a].transcript) {
                  alts.push(res[a].transcript.trim());
                }
              }
              this.lastConfidence = res[0].confidence;
              finalizedSegments.push({
                text: res[0].transcript.trim(),
                confidence: res[0].confidence,
                alternatives: alts,
                index: i
              });

              // Debug console logging
              console.log('[SpeechRecognizer]', {
                'raw STT transcript': res[0].transcript.trim(),
                'final transcript': res[0].transcript.trim(),
                'STT alternatives': alts,
                'confidence': res[0].confidence,
                'normalized transcript': res[0].transcript.trim().toLowerCase(),
                'recognition language being used': this.lang
              });
            }
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        // Notify interim callback if present (for visual caption/hint only - NEVER for command execution)
        if (interimTranscript.trim() && this.onInterimCallback) {
          this.onInterimCallback(interimTranscript.trim());
        }

        // Only process final results
        if (finalizedSegments.length > 0) {
          for (const seg of finalizedSegments) {
            this.lastProcessedIndex = Math.max(this.lastProcessedIndex, seg.index);
            if (this.sentenceBuffer) {
              this.sentenceBuffer += ' ' + seg.text;
            } else {
              this.sentenceBuffer = seg.text;
            }
            if (seg.alternatives && seg.alternatives.length > 0) {
              this.alternativesBuffer.push(...seg.alternatives);
            }
          }

          // Debounce complete sentence dispatch:
          // Wait briefly for customer to complete multi-clause utterance (e.g. "two pazham pori... and one tea")
          clearTimeout(this.sentenceTimeout);
          this.sentenceTimeout = setTimeout(() => {
            this.flushSentenceBuffer();
          }, this.SENTENCE_DEBOUNCE_MS);
        }
      };

      this.recognition.onerror = (event) => {
        this.isStarting = false;
        if (event.error === 'aborted') {
          // Expected when stopping or pausing for TTS
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.hasPermission = false;
          if (this.onErrorCallback) {
            this.onErrorCallback('MICROPHONE_DENIED');
          }
        } else if (event.error === 'no-speech') {
          // Silence timeout: flush any pending finalized buffer if present
          if (this.sentenceBuffer) {
            this.flushSentenceBuffer();
          }
          // On mobile, no-speech kills the session — restart it explicitly
          if (isMobileBrowser && !this.isPausedForSpeech && !this.isSpeakingTTS && this.hasPermission !== false) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = setTimeout(() => { this.start(); }, 150);
          }
        } else {
          console.warn('[SpeechRecognizer] Recognition error:', event.error);
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.isStarting = false;

        // If there's uncommitted final speech in the buffer, flush it now
        if (this.sentenceBuffer && !this.isSpeakingTTS && !this.isPausedForSpeech) {
          this.flushSentenceBuffer();
        }

        // Automatically restart only if we should be listening and are NOT paused for TTS speech
        if (!this.isPausedForSpeech && !this.isSpeakingTTS && this.hasPermission !== false) {
          clearTimeout(this.restartTimeout);
          // On mobile, restart faster (single-shot ends immediately after each result)
          const delay = isMobileBrowser ? 100 : 250;
          this.restartTimeout = setTimeout(() => {
            this.start();
          }, delay);
        } else if (!this.isPausedForSpeech && !this.isSpeakingTTS) {
          this.notifyStateChange('IDLE');
        }
      };
    } catch (e) {
      console.error('[SpeechRecognizer] Failed to initialize speech recognition:', e);
    }
  }

  /**
   * Dispatches the accumulated complete sentence after speech finishes
   */
  flushSentenceBuffer() {
    clearTimeout(this.sentenceTimeout);
    const completeSentence = (this.sentenceBuffer || '').trim();
    const alternatives = [...new Set(this.alternativesBuffer)];
    this.sentenceBuffer = '';
    this.alternativesBuffer = [];

    if (!completeSentence) return;

    // Guard: Do not process if AI is speaking TTS or paused
    if (this.isPausedForSpeech || this.isSpeakingTTS) return;

    // Deduplication check: Avoid re-processing identical utterance within window (exempting short confirmation words)
    const isShortReply = /^(?:അതെ|ശരി|ഇല്ല|വേണ്ട|വേണം|ചെയ്യാം|ചെയ്യട്ടെ|ഓക്കെ|ഓക്കേ|ഒക്കെ|yes|no|athe|shari|sari|illa|venda|venam|cheyyam|cheyyu|ok|okay)$/i.test(completeSentence.trim());
    const now = Date.now();
    const normalized = completeSentence.toLowerCase().replace(/\s+/g, ' ');
    if (
      !isShortReply &&
      normalized === this.lastProcessedTranscript &&
      now - this.lastProcessedTime < this.DEDUP_WINDOW_MS
    ) {
      return;
    }

    this.lastProcessedTranscript = normalized;
    this.lastProcessedTime = now;

    this.notifyStateChange('PROCESSING');

    // Debug console logging
    console.log('[SpeechRecognizer Final Sentence]', {
      'raw STT transcript': completeSentence,
      'final transcript': completeSentence,
      'STT alternatives': alternatives,
      'confidence': this.lastConfidence || 1.0,
      'normalized transcript': completeSentence.toLowerCase(),
      'recognition language being used': this.lang
    });

    if (this.onResultCallback) {
      this.onResultCallback(completeSentence, alternatives, this.lastConfidence || 1.0);
    }
  }

  setCallbacks({ onResult, onInterim, onStateChange, onError }) {
    this.onResultCallback = onResult;
    this.onInterimCallback = onInterim;
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;
  }

  notifyStateChange(state) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state);
    }
  }

  start() {
    if (!this.isSupported) {
      if (this.onErrorCallback) this.onErrorCallback('NOT_SUPPORTED');
      return;
    }
    if (this.isListening || this.isStarting || this.isPausedForSpeech || this.isSpeakingTTS) return;

    try {
      this.isStarting = true;
      this.lastProcessedIndex = -1;
      this.sentenceBuffer = '';
      this.recognition.start();
      this.hasPermission = true;
    } catch (e) {
      this.isStarting = false;
      if (e.name === 'InvalidStateError') {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => {
          if (!this.isListening && !this.isPausedForSpeech && !this.isSpeakingTTS) {
            this.start();
          }
        }, 300);
      } else {
        console.warn('[SpeechRecognizer] start failed:', e);
      }
    }
  }

  /**
   * Pause listening while AI TTS speaks
   */
  pause() {
    this.isPausedForSpeech = true;
    this.isSpeakingTTS = true;
    clearTimeout(this.restartTimeout);
    clearTimeout(this.sentenceTimeout);
    this.sentenceBuffer = '';

    if (this.recognition && (this.isListening || this.isStarting)) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Safe ignore
      }
    }
    this.isListening = false;
    this.isStarting = false;
  }

  /**
   * Resume listening after AI TTS finishes and delay expires
   */
  resume() {
    this.isPausedForSpeech = false;
    this.isSpeakingTTS = false;
    this.sentenceBuffer = '';
    clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(() => {
      this.start();
    }, 200);
  }

  stop() {
    this.isPausedForSpeech = false;
    this.isSpeakingTTS = false;
    this.sentenceBuffer = '';
    clearTimeout(this.restartTimeout);
    clearTimeout(this.sentenceTimeout);

    if (this.recognition && (this.isListening || this.isStarting)) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Safe ignore
      }
    }
    this.isListening = false;
    this.isStarting = false;
    this.notifyStateChange('IDLE');
  }

  /**
   * Testing / simulation helper
   */
  simulateInput(text, alternatives = [], bypassDedup = false) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    const isShortReply = /^(?:അതെ|ശരി|ഇല്ല|വേണ്ട|വേണം|ചെയ്യാം|ചെയ്യട്ടെ|ഓക്കെ|ഓക്കേ|ഒക്കെ|yes|no|athe|shari|sari|illa|venda|venam|cheyyam|cheyyu|ok|okay)$/i.test(cleanText);
    const now = Date.now();
    const normalized = cleanText.toLowerCase().replace(/\s+/g, ' ');
    if (
      !bypassDedup &&
      !isShortReply &&
      normalized === this.lastProcessedTranscript &&
      now - this.lastProcessedTime < this.DEDUP_WINDOW_MS
    ) {
      return;
    }

    this.lastProcessedTranscript = normalized;
    this.lastProcessedTime = now;

    // Debug console logging
    console.log('[SpeechRecognizer Simulated Input]', {
      'raw STT transcript': cleanText,
      'final transcript': cleanText,
      'STT alternatives': alternatives,
      'confidence': 1.0,
      'normalized transcript': cleanText.toLowerCase(),
      'recognition language being used': this.lang
    });

    if (this.onResultCallback) {
      this.notifyStateChange('PROCESSING');
      setTimeout(() => {
        this.onResultCallback(cleanText, alternatives, 1.0);
      }, 50);
    }
  }
}

export const speechRecognizer = new SpeechRecognizer();

if (typeof window !== 'undefined') {
  window.speechRecognizer = speechRecognizer;
}
