export const MALAYALAM_ITEM_NAMES = {
  'pazham-pori': 'പഴംപൊരി',
  'egg-bajji': 'മുട്ട ബജ്ജി',
  'ulli-vada': 'ഉള്ളിവട',
  'parippu-vada': 'പരിപ്പുവട',
  'medhu-vada': 'ഉഴുന്നുവട',
  'mulaku-bajji': 'മുളക് ബജ്ജി',
  'chicken-cutlet': 'ചിക്കൻ കട്ട്ലറ്റ്',
  'tea': 'ചായ',
  'coffee': 'കാപ്പി',
  'paal-kappa': 'പാൽക്കപ്പയും മീൻ കറിയും'
};

export const MALAYALAM_NUMBERS = {
  1: 'ഒരു',
  2: 'രണ്ട്',
  3: 'മൂന്ന്',
  4: 'നാല്',
  5: 'അഞ്ച്',
  6: 'ആറ്',
  7: 'ഏഴ്',
  8: 'എട്ട്',
  9: 'ഒമ്പത്',
  10: 'പത്ത്'
};

export function getMalayalamItemName(itemIdOrShortName) {
  if (!itemIdOrShortName) return '';
  if (MALAYALAM_ITEM_NAMES[itemIdOrShortName]) {
    return MALAYALAM_ITEM_NAMES[itemIdOrShortName];
  }
  const clean = String(itemIdOrShortName).toLowerCase();
  for (const [id, name] of Object.entries(MALAYALAM_ITEM_NAMES)) {
    if (clean.includes(id) || clean.includes(name)) {
      return name;
    }
  }
  if (clean.includes('pazham') || clean.includes('banana')) return 'പഴംപൊരി';
  if (clean.includes('egg') || clean.includes('mutta') || clean.includes('motta')) return 'മുട്ട ബജ്ജി';
  if (clean.includes('tea') || clean.includes('chaya') || clean.includes('chai')) return 'ചായ';
  if (clean.includes('coffee') || clean.includes('kaapi')) return 'കാപ്പി';
  if (clean.includes('ulli') || clean.includes('onion')) return 'ഉള്ളിവട';
  if (clean.includes('parippu') || clean.includes('dal')) return 'പരിപ്പുവട';
  if (clean.includes('medhu') || clean.includes('uzhunnu')) return 'ഉഴുന്നുവട';
  if (clean.includes('mulaku') || clean.includes('chili') || clean.includes('chilli')) return 'മുളക് ബജ്ജി';
  if (clean.includes('chicken') || clean.includes('cutlet')) return 'ചിക്കൻ കട്ട്ലറ്റ്';
  if (clean.includes('kappa') || clean.includes('fish')) return 'പാൽക്കപ്പയും മീൻ കറിയും';
  return itemIdOrShortName;
}

export function getMalayalamNumber(qty) {
  return MALAYALAM_NUMBERS[qty] || `${qty}`;
}

export function formatMalayalamItemsSpeech(items) {
  if (!items || items.length === 0) return '';
  const itemStrings = items.map(entry => {
    const qty = entry.quantity || 1;
    const qtyText = getMalayalamNumber(qty);
    const malName = getMalayalamItemName(entry.item ? entry.item.id : entry.id);
    return `${qtyText} ${malName}`;
  });

  if (itemStrings.length === 1) return itemStrings[0];
  if (itemStrings.length === 2) return `${itemStrings[0]}യും ${itemStrings[1]}യും`;
  return `${itemStrings.slice(0, -1).map(s => s + 'യും').join(', ')} കൂടാതെ ${itemStrings[itemStrings.length - 1]}യും`;
}

class VoiceSynthesizer {
  constructor() {
    this.currentAudio = null;
    this.isSpeaking = false;
    this.currentRequestId = 0;
    this.audioCache = new Map();
    this.lastResponseIndices = {};
    this.voiceInfo = {
      name: 'ml-IN-Wavenet-A',
      lang: 'ml-IN',
      gender: 'FEMALE'
    };
    this._isPreloading = false;
  }

  onVoiceReady(cb) {
    if (cb) cb(this.voiceInfo);
  }

  /**
   * Pre-fetches and caches common Malayalam voice responses in the background
   * so they play with zero network latency.
   */
  async preloadCommonResponses() {
    if (this._isPreloading || typeof fetch === 'undefined') return;
    this._isPreloading = true;

    const commonPhrases = [
      "നമസ്കാരം! എന്താണ് കഴിക്കാൻ വേണ്ടത്?",
      "ശരി, ചേർത്തിട്ടുണ്ട്.",
      "ശരി, എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?",
      "നിങ്ങളുടെ കാർട്ട് ഇപ്പോൾ ശൂന്യമാണ്. എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?",
      "നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്. ദയവായി വിഭവങ്ങൾ ചേർത്ത ശേഷം ഓർഡർ ചെയ്യുക.",
      "ക്ഷമിക്കണം, എനിക്ക് വ്യക്തമായി മനസ്സിലായില്ല. ഒന്നുകൂടി പറയാമോ?",
      "ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?",
      "ഡ്രിങ്ക്സ് കാണിക്കുന്നു.",
      "സ്നാക്ക്സ് കാണിക്കുന്നു.",
      "മീൽസ് കാണിക്കുന്നു."
    ];

    const topItems = [
      'മുളക് ബജ്ജി',
      'ചായ',
      'കാപ്പി',
      'പഴംപൊരി',
      'മുട്ട ബജ്ജി',
      'ഉള്ളിവട',
      'പരിപ്പുവട',
      'ഉഴുന്നുവട',
      'ചിക്കൻ കട്ട്ലറ്റ്',
      'പാൽക്കപ്പയും മീൻ കറിയും'
    ];

    const nums = ['ഒരു', 'രണ്ട്', 'മൂന്ന്', 'നാല്', 'അഞ്ച്'];

    for (const itemName of topItems) {
      for (const numWord of nums) {
        commonPhrases.push(`ശരി, ${numWord} ${itemName} ചേർത്തിട്ടുണ്ട്.`);
      }
      commonPhrases.push(`ശരി, ${itemName} ഒഴിവാക്കിയിട്ടുണ്ട്.`);
    }

    // Preload in background
    for (const phrase of commonPhrases) {
      if (this.audioCache.has(phrase)) continue;
      try {
        const isMalayalam = /[\u0D00-\u0D7F]/.test(phrase);
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: phrase,
            languageCode: isMalayalam ? 'ml-IN' : 'en-IN',
            voiceName: isMalayalam ? 'ml-IN-Wavenet-A' : 'en-IN-Neural2-D'
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.audioContent) {
            this.audioCache.set(phrase, data.audioContent);
          }
        }
      } catch (e) {
        // Silently continue
      }
    }
    this._isPreloading = false;
  }

  /**
   * Speak using Malayalam Google Cloud Text-to-Speech
   */
  speak(text, { onStart, onEnd, onError } = {}) {
    this.stop();

    if (!text || typeof text !== 'string' || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    const cleanText = text.trim();
    const requestId = ++this.currentRequestId;
    let hasEnded = false;
    let watchdogTimer = null;

    const safeEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        clearTimeout(watchdogTimer);
        this.isSpeaking = false;
        if (this.currentAudio) {
          this.currentAudio.onended = null;
          this.currentAudio.onerror = null;
          this.currentAudio = null;
        }
        if (onEnd) onEnd();
      }
    };

    // Safety watchdog timer
    const maxDuration = Math.max(7000, cleanText.length * 150);
    watchdogTimer = setTimeout(() => {
      if (!hasEnded && this.currentRequestId === requestId) {
        console.warn('[MalayalamTTS] Playback timeout watchdog triggered');
        safeEnd();
      }
    }, maxDuration);

    const playAudioBuffer = (base64Audio) => {
      if (this.currentRequestId !== requestId) return;

      try {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        this.currentAudio = audio;

        audio.onplay = () => {
          if (this.currentRequestId === requestId) {
            this.isSpeaking = true;
            if (onStart) onStart();
          }
        };

        audio.onended = () => {
          if (this.currentRequestId === requestId) {
            safeEnd();
          }
        };

        audio.onerror = (e) => {
          console.warn('[MalayalamTTS] Audio error:', e);
          if (this.currentRequestId === requestId) {
            if (onError) onError(e);
            safeEnd();
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('[MalayalamTTS] Audio play() promise caught, using browser fallback:', err.message);
            if (this.currentRequestId === requestId) {
              this.speakWithBrowserFallback(cleanText, { onStart, onEnd, onError });
            }
          });
        }
      } catch (err) {
        console.warn('[MalayalamTTS] Failed to play audio, using browser fallback:', err.message);
        this.speakWithBrowserFallback(cleanText, { onStart, onEnd, onError });
      }
    };

    // Check in-memory cache
    if (this.audioCache.has(cleanText)) {
      playAudioBuffer(this.audioCache.get(cleanText));
      return;
    }

    const isMalayalam = /[\u0D00-\u0D7F]/.test(cleanText);
    const langCode = isMalayalam ? 'ml-IN' : 'en-IN';
    const voice = isMalayalam ? 'ml-IN-Wavenet-A' : 'en-IN-Neural2-D';

    // Call TTS endpoint
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        languageCode: langCode,
        voiceName: voice
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `HTTP ${res.status}`);
          }).catch(() => {
            throw new Error(`HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (this.currentRequestId !== requestId) return;
        if (data && data.audioContent) {
          this.audioCache.set(cleanText, data.audioContent);
          playAudioBuffer(data.audioContent);
        } else {
          throw new Error('No audio content returned from Malayalam TTS');
        }
      })
      .catch(err => {
        console.warn('[MalayalamTTS] Request failed, using browser speechSynthesis fallback:', err.message);
        if (this.currentRequestId === requestId) {
          this.speakWithBrowserFallback(cleanText, { onStart, onEnd, onError });
        }
      });
  }

  /**
   * Browser SpeechSynthesis Fallback if Google Cloud TTS is unreachable
   */
  speakWithBrowserFallback(text, { onStart, onEnd, onError } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[VoiceSynthesizer] Neither Google TTS nor browser speechSynthesis is available.');
      if (onError) onError(new Error('No TTS engine available'));
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices() || [];
      const isMalayalam = /[\u0D00-\u0D7F]/.test(text);
      if (isMalayalam) {
        const malVoice = voices.find(v => (v.lang === 'ml-IN' || v.lang === 'ml' || v.name.toLowerCase().includes('malayalam')));
        if (malVoice) utterance.voice = malVoice;
        utterance.lang = 'ml-IN';
      } else {
        const enVoice = voices.find(v => (v.lang === 'en-IN' || v.lang.startsWith('en') || v.name.toLowerCase().includes('english')));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = 'en-IN';
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        this.isSpeaking = false;
        if (onError) onError(e);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[VoiceSynthesizer] Browser fallback error:', e);
      if (onError) onError(e);
      if (onEnd) onEnd();
    }
  }

  /**
   * Stop audio playback immediately
   */
  stop() {
    this.currentRequestId++;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
      } catch (e) {
        // Ignore
      }
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore
      }
    }
    this.isSpeaking = false;
  }

  pickVariation(key, variations) {
    const lastIdx = this.lastResponseIndices[key] ?? -1;
    let nextIdx = Math.floor(Math.random() * variations.length);
    if (variations.length > 1 && nextIdx === lastIdx) {
      nextIdx = (nextIdx + 1) % variations.length;
    }
    this.lastResponseIndices[key] = nextIdx;
    return variations[nextIdx];
  }

  /**
   * Natural Malayalam response for adding items
   * Requirement examples:
   * "രണ്ട് പഴംപൊരി വേണം" -> "ശരി, രണ്ട് പഴംപൊരി ചേർത്തിട്ടുണ്ട്."
   * "ഒരു egg bajji വേണം" -> "ശരി, ഒരു മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."
   * "ഒരു tea കൂടി വേണം" -> "ശരി, ഒരു ചായ കൂടി ചേർത്തിട്ടുണ്ട്."
   */
  getAddResponse(items) {
    if (!items || items.length === 0) return "ശരി, ചേർത്തിട്ടുണ്ട്.";

    if (items.length === 1) {
      const entry = items[0];
      const item = entry.item || entry;
      const malName = getMalayalamItemName(item.id || item.shortName);
      const qty = entry.quantity || 1;
      const qtyText = getMalayalamNumber(qty);

      if (entry.isRelative) {
        return `ശരി, ${qtyText} ${malName} കൂടി ചേർത്തിട്ടുണ്ട്.`;
      }
      return `ശരി, ${qtyText} ${malName} ചേർത്തിട്ടുണ്ട്.`;
    }

    const itemsDesc = formatMalayalamItemsSpeech(items);
    return `ശരി, ${itemsDesc} ചേർത്തിട്ടുണ്ട്.`;
  }

  /**
   * Natural Malayalam response for removing an item or multiple items
   */
  getRemoveResponse(itemOrItems, quantity = null) {
    if (Array.isArray(itemOrItems)) {
      if (itemOrItems.length === 0) return 'ശരി, സാധനങ്ങൾ ഒഴിവാക്കിയിട്ടുണ്ട്.';
      if (itemOrItems.length === 1) {
        return this.getRemoveResponse(itemOrItems[0].item, itemOrItems[0].quantity);
      }
      const parts = itemOrItems.map(entry => {
        const it = entry.item || entry;
        const q = entry.quantity;
        const malName = getMalayalamItemName(it.id || it.shortName);
        if (q) {
          const qtyText = getMalayalamNumber(q);
          return `${qtyText} ${malName}`;
        }
        return malName;
      });
      if (parts.length === 2) {
        return `ശരി, ${parts[0]}യും ${parts[1]}യും ഒഴിവാക്കിയിട്ടുണ്ട്.`;
      }
      const last = parts[parts.length - 1];
      const initial = parts.slice(0, -1).map(p => `${p}യും`).join(', ');
      return `ശരി, ${initial} കൂടാതെ ${last}യും ഒഴിവാക്കിയിട്ടുണ്ട്.`;
    }

    const malName = getMalayalamItemName(itemOrItems.id || itemOrItems.shortName);
    if (quantity && quantity > 1) {
      const qtyText = getMalayalamNumber(quantity);
      return `ശരി, ${qtyText} ${malName} ഒഴിവാക്കിയിട്ടുണ്ട്.`;
    } else if (quantity === 1) {
      return `ശരി, ഒരു ${malName} ഒഴിവാക്കിയിട്ടുണ്ട്.`;
    }
    return `ശരി, ${malName} ഒഴിവാക്കിയിട്ടുണ്ട്.`;
  }

  /**
   * Natural Malayalam response for quantity change
   */
  getQuantityChangeResponse(item, quantity) {
    const malName = getMalayalamItemName(item.id || item.shortName);
    const qtyText = getMalayalamNumber(quantity);
    return `ശരി, ${malName} ${qtyText} എണ്ണമാക്കി മാറ്റിയിട്ടുണ്ട്.`;
  }

  /**
   * Natural Malayalam category navigation response
   */
  getCategoryResponse(category) {
    if (category === 'drinks') return 'ഡ്രിങ്ക്സ് കാണിക്കുന്നു.';
    if (category === 'meals') return 'മീൽസ് കാണിക്കുന്നു.';
    return 'സ്നാക്ക്സ് കാണിക്കുന്നു.';
  }

  /**
   * Natural Malayalam total inquiry response
   */
  getTotalResponse(total) {
    return `ആകെ തുക ${total} രൂപ ആണ്.`;
  }

  /**
   * Natural Malayalam clarification questions
   */
  getClarificationPrompt(itemOrCandidates) {
    if (Array.isArray(itemOrCandidates) && itemOrCandidates.length > 1) {
      const names = itemOrCandidates.map(c => getMalayalamItemName(c.id || c.shortName));
      if (names.length === 2) {
        return `നിങ്ങൾ ഉദ്ദേശിച്ചത് ${names[0]} ആണോ അതോ ${names[1]} ആണോ?`;
      }
      return `നിങ്ങൾ ഉദ്ദേശിച്ചത് ${names.slice(0, -1).join(', ')} ആണോ അതോ ${names[names.length - 1]} ആണോ?`;
    }
    const single = Array.isArray(itemOrCandidates) ? itemOrCandidates[0] : itemOrCandidates;
    const malName = getMalayalamItemName(single ? (single.id || single.shortName) : '');
    return `നിങ്ങൾ ഉദ്ദേശിച്ചത് ${malName} ആണോ?`;
  }

  getConfirmationPrompt(item, quantity = 1) {
    const malName = getMalayalamItemName(item.id || item.shortName);
    const qtyText = getMalayalamNumber(quantity);
    return `${qtyText} ${malName} ആണോ നിങ്ങൾ ഉദ്ദേശിച്ചത്?`;
  }

  getOutOfScopeResponse(isEnglish = false) {
    return isEnglish ? ENGLISH_OUT_OF_SCOPE_RESPONSE : MALAYALAM_OUT_OF_SCOPE_RESPONSE;
  }

  getPriceResponse(item) {
    if (!item) {
      return "സ്നാക്ക്സിനും ചായയ്ക്കും 10 രൂപ മുതൽ 25 രൂപ വരെയും, പാൽക്കപ്പ മീൻ കറിക്ക് 100 രൂപയും ആണ്. എത്ര എണ്ണം വേണം?";
    }
    const malName = getMalayalamItemName(item.id || item.shortName);
    return `${malName}-ന്റെ വില ${item.price} രൂപ ആണ്. എത്ര എണ്ണം വേണം?`;
  }

  getMenuResponse(category = null) {
    if (category === 'drinks') {
      return "ഡ്രിങ്ക്സിൽ ചൂടുള്ള കേരള മീറ്റർ ചായയും ഫിൽട്ടർ കാപ്പിയും ഉണ്ട്. എന്താണ് വേണ്ടത്?";
    }
    if (category === 'snacks') {
      return "സ്നാക്ക്സിൽ പഴംപൊരി, ഉള്ളിവട, പരിപ്പുവട, ഉഴുന്നുവട, മുളക് ബജ്ജി, മുട്ട ബജ്ജി, ചിക്കൻ കട്ട്ലറ്റ് എന്നിവ ഉണ്ട്. എന്താണ് വേണ്ടത്?";
    }
    if (category === 'meals') {
      return "മീൽസിൽ പാൽക്കപ്പയും മീൻ കറിയും ഉണ്ട്. എന്താണ് വേണ്ടത്?";
    }
    return "ഞങ്ങളുടെ മെനുവിൽ പഴംപൊരി, ഉള്ളിവട, പരിപ്പുവട, ഉഴുന്നുവട, മുളക് ബജ്ജി, മുട്ട ബജ്ജി, ചിക്കൻ കട്ട്ലറ്റ്, ചായ, കാപ്പി, പാൽക്കപ്പയും മീൻ കറിയും ഉണ്ട്. എന്താണ് വേണ്ടത്?";
  }

  getRecommendationResponse() {
    const variations = [
      "ചൂടുള്ള പഴംപൊരിയും മീറ്റർ ചായയും ഞങ്ങളുടെ സ്പെഷ്യൽ ആണ്! ഓർഡർ ചെയ്യട്ടെ?",
      "നല്ല മൊരിഞ്ഞ ഉള്ളിവടയും സ്ട്രോങ്ങ് ഫിൽട്ടർ കാപ്പിയും വളരെ നല്ലതാണ്! ചേർക്കട്ടെ?",
      "ചൂടുള്ള മുട്ട ബജ്ജിയും ഒരു ചായയും ട്രൈ ചെയ്തു നോക്കൂ! ഓർഡർ ചെയ്യട്ടെ?"
    ];
    return this.pickVariation('recommendation', variations);
  }

  getItemExplanationResponse(item) {
    if (!item) return "ഞങ്ങളുടെ എല്ലാ വിഭവങ്ങളും ചൂടോടെ ഉണ്ടാക്കുന്ന നാടൻ വിഭവങ്ങളാണ്. ഏതിനെക്കുറിച്ചാണ് അറിയേണ്ടത്?";
    const malName = getMalayalamItemName(item.id || item.shortName);
    return `${malName} കേരളത്തിന്റെ പ്രിയപ്പെട്ട നാടൻ വിഭവമാണ്. ഓർഡർ ചെയ്യട്ടെ?`;
  }

  getWelcomeResponse() {
    return "നമസ്കാരം! എന്താണ് കഴിക്കാൻ വേണ്ടത്?";
  }

  getCartSummaryResponse(cart, total) {
    if (!cart || cart.length === 0) {
      return "നിങ്ങളുടെ കാർട്ട് ഇപ്പോൾ ശൂന്യമാണ്. എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?";
    }
    const itemsDesc = formatMalayalamItemsSpeech(cart);
    return `നിങ്ങളുടെ ഓർഡറിൽ ${itemsDesc} ഉണ്ട്. ആകെ തുക ${total} രൂപ ആണ്.`;
  }

  getCheckoutConfirmationPrompt(cart, total) {
    if (!cart || cart.length === 0) {
      return "നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്. ദയവായി വിഭവങ്ങൾ ചേർത്ത ശേഷം ഓർഡർ ചെയ്യുക.";
    }
    const itemsDesc = formatMalayalamItemsSpeech(cart);
    return `നിങ്ങളുടെ ഓർഡറിൽ ${itemsDesc} ഉണ്ട്. ആകെ തുക ${total} രൂപ ആണ്. ഓർഡർ കൺഫേം ചെയ്യട്ടെ?`;
  }

  getOrderConfirmationResponse(orderNumber) {
    return `പേയ്‌മെന്റ് വിജയകരമായി പൂർത്തിയായി. ഓർഡർ കൺഫേം ചെയ്തിട്ടുണ്ട്. നിങ്ങളുടെ ഓർഡർ നമ്പർ ${orderNumber}. നന്ദി ഉണ്ടേ!`;
  }
}

export const ENGLISH_OUT_OF_SCOPE_RESPONSE = "Sorry, I can only help with food, menu, and your order. What would you like to order?";
export const MALAYALAM_OUT_OF_SCOPE_RESPONSE = "ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?";
export const DEFAULT_OUT_OF_SCOPE_RESPONSE = MALAYALAM_OUT_OF_SCOPE_RESPONSE;

export const voiceSynthesizer = new VoiceSynthesizer();
