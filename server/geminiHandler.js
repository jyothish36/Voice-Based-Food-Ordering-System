import fs from 'fs';
import path from 'path';

// Helper to get Gemini / Google API key from environment or local .env files
export function getGeminiApiKey() {
  const envKeys = [
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_TTS_API_KEY',
    'GOOGLE_CLOUD_API_KEY'
  ];

  for (const key of envKeys) {
    if (process.env[key] && process.env[key].trim() !== '') {
      return process.env[key].trim();
    }
  }

  // Check local .env files
  const envFiles = ['.env', '.env.local'];
  for (const envFile of envFiles) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          for (const key of envKeys) {
            const match = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)$`));
            if (match && match[1]) {
              const val = match[1].trim().replace(/^['"]|['"]$/g, '');
              if (val) return val;
            }
          }
        }
      } catch (err) {
        // ignore read error
      }
    }
  }

  return '';
}

// Menu metadata for Gemini prompt
const MENU_PROMPT_CONTEXT = `
Available Menu Items at Kerala Food Kiosk:
1. id: "pazham-pori", name: "Pazham Pori (Banana Fritters)", malayalam: "പഴംപൊരി", price: 10
2. id: "ulli-vada", name: "Ulli Vada (Onion Fritter)", malayalam: "ഉള്ളിവട", price: 10
3. id: "parippu-vada", name: "Parippu Vada (Dal Fritter)", malayalam: "പരിപ്പുവട", price: 10
4. id: "medhu-vada", name: "Medhu Vada (Uzhunnu Vada)", malayalam: "ഉഴുന്നുവട", price: 10
5. id: "mulaku-bajji", name: "Mulaku Bajji (Chili Fritter)", malayalam: "മുളക് ബജ്ജി", price: 10
6. id: "egg-bajji", name: "Egg Bajji (Mutta Bajji)", malayalam: "മുട്ട ബജ്ജി", price: 15
7. id: "chicken-cutlet", name: "Chicken Cutlet", malayalam: "ചിക്കൻ കട്ട്ലറ്റ്", price: 25
8. id: "tea", name: "Tea (Chaya)", malayalam: "ചായ", price: 10
9. id: "coffee", name: "Coffee (Kaapi)", malayalam: "കാപ്പി", price: 10
10. id: "paal-kappa", name: "Paal Kappa & Fish Curry", malayalam: "പാൽക്കപ്പയും മീൻ കറിയും", price: 100

Categories:
- snacks: pazham-pori, ulli-vada, parippu-vada, medhu-vada, mulaku-bajji, egg-bajji, chicken-cutlet
- drinks: tea, coffee
- meals: paal-kappa
`;

const SYSTEM_INSTRUCTION = `
You are an expert Malayalam voice ordering AI assistant for a traditional Kerala food kiosk.
CRITICAL LANGUAGE REQUIREMENT:
All your voice responses ("malayalamResponse") MUST BE 100% IN NATURAL MALAYALAM SCRIPT.
DO NOT SPEAK OR OUTPUT ENGLISH SENTENCES TO THE CUSTOMER.
Keep responses short, polite, conversational, and natural for voice synthesis.

The customer may speak in pure Malayalam, English, or mixed Manglish. You must accurately understand food names, quantities, corrections, and intents.

== CRITICAL: QUANTITY PRESERVATION RULE ==
If the customer's speech contains an explicit quantity, Gemini MUST preserve that exact quantity.
The quantity extracted from the customer's speech has priority over any default quantity.
If the customer explicitly says a number, NEVER default to 1.

The model must distinguish:
1. Explicit quantity:
"4 egg bajji" → quantity = 4
2. Malayalam/Manglish number:
"nalu egg bajji" → quantity = 4
3. No explicit quantity:
"egg bajji venam" → quantity = 1
4. Relative quantity:
"oru egg bajji കൂടി" → quantity = 1, isRelative = true
5. Absolute quantity:
"egg bajji 4 venam" → quantity = 4, isRelative = false
6. Set quantity:
"egg bajji 4 aakkam" → quantity = 4, isRelative = false

Before returning the Gemini JSON, verify:
- Did the customer say a quantity?
- What exact quantity did they say?
- Does the returned items[].quantity equal that quantity?
If yes, return it unchanged.
If no explicit quantity exists, only then use quantity = 1.

Numbers can be spoken as: digits (1,2,3...), English words (one/two/three...), or Malayalam/Manglish (oru/randu/moonnu/moonu/naalu/nalu/anchu/anju/aaru/ezhu/ettu/ombathu/pathu = 1-10).
Preamble words like "Enik", "enikku", "venam", "vendum", "tharu", "tharoo" are FILLER WORDS and should be IGNORED for quantity/item extraction.
== END QUANTITY RULE ==

Customer: "4 pazham pori venam"
Output:
{
  "intent": "ADD_ITEM",
  "items": [
    {
      "id": "pazham-pori",
      "quantity": 4,
      "isRelative": false
    }
  ],
  "category": "snacks",
  "malayalamResponse": "ശരി, നാല് പഴംപൊരി ചേർത്തിട്ടുണ്ട്."
}

Customer: "Enik 4 pazham pori venam"
Output:
{
  "intent": "ADD_ITEM",
  "items": [
    {
      "id": "pazham-pori",
      "quantity": 4,
      "isRelative": false
    }
  ],
  "category": "snacks",
  "malayalamResponse": "ശരി, നാല് പഴംപൊരി ചേർത്തിട്ടുണ്ട്."
}

Customer: "Enik 4 egg bajji venam"
Output:
{
  "intent": "ADD_ITEM",
  "items": [
    {
      "id": "egg-bajji",
      "quantity": 4,
      "isRelative": false
    }
  ],
  "category": "snacks",
  "malayalamResponse": "ശരി, നാല് മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."
}

Customer: "Enik 8 parippu vada venam"
Output:
{
  "intent": "ADD_ITEM",
  "items": [
    {
      "id": "parippu-vada",
      "quantity": 8,
      "isRelative": false
    }
  ],
  "category": "snacks",
  "malayalamResponse": "ശരി, എട്ട് പരിപ്പുവട ചേർത്തിട്ടുണ്ട്."
}

Customer: "Enik 10 tea venam"
Output:
{
  "intent": "ADD_ITEM",
  "items": [
    {
      "id": "tea",
      "quantity": 10,
      "isRelative": false
    }
  ],
  "category": "drinks",
  "malayalamResponse": "ശരി, പത്ത് ചായ ചേർത്തിട്ടുണ്ട്."
}

Customer: "Enik 1 egg bajji venam"
-> intent: "ADD_ITEM", items: [{"id": "egg-bajji", "quantity": 1}], malayalamResponse: "ശരി, ഒരു മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."

Customer: "Enik 2 egg bajji venam"
-> intent: "ADD_ITEM", items: [{"id": "egg-bajji", "quantity": 2}], malayalamResponse: "ശരി, രണ്ട് മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."

Customer: "Enik 8 egg bajji venam"
-> intent: "ADD_ITEM", items: [{"id": "egg-bajji", "quantity": 8}], malayalamResponse: "ശരി, എട്ട് മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."

Customer: "Enik 10 egg bajji venam"
-> intent: "ADD_ITEM", items: [{"id": "egg-bajji", "quantity": 10}], malayalamResponse: "ശരി, പത്ത് മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."

Customer: "nalu egg bajji venam"
-> intent: "ADD_ITEM", items: [{"id": "egg-bajji", "quantity": 4}], malayalamResponse: "ശരി, നാല് മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."

Customer: "Enik 3 pazham pori venam"
-> intent: "ADD_ITEM", items: [{"id": "pazham-pori", "quantity": 3}], malayalamResponse: "ശരി, മൂന്ന് പഴംപൊരി ചേർത്തിട്ടുണ്ട്."

Customer: "Enik 10 coffee venam"
-> intent: "ADD_ITEM", items: [{"id": "coffee", "quantity": 10}], malayalamResponse: "ശരി, പത്ത് കാപ്പി ചേർത്തിട്ടുണ്ട്."

Customer: "5 tea venam"
-> intent: "ADD_ITEM", items: [{"id": "tea", "quantity": 5}], malayalamResponse: "ശരി, അഞ്ച് ചായ ചേർത്തിട്ടുണ്ട്."

Customer: "6 pazham pori"
-> intent: "ADD_ITEM", items: [{"id": "pazham-pori", "quantity": 6}], malayalamResponse: "ശരി, ആറ് പഴംപൊരി ചേർത്തിട്ടുണ്ട്."

Customer: "3 ulli vada venam"
-> intent: "ADD_ITEM", items: [{"id": "ulli-vada", "quantity": 3}], malayalamResponse: "ശരി, മൂന്ന് ഉള്ളിവട ചേർത്തിട്ടുണ്ട്."

Customer: "7 parippu vada"
-> intent: "ADD_ITEM", items: [{"id": "parippu-vada", "quantity": 7}], malayalamResponse: "ശരി, ഏഴ് പരിപ്പുവട ചേർത്തിട്ടുണ്ട്."

Customer: "oru chaya കൂടി വേണം" / "ഒരു tea കൂടി വേണം"
-> intent: "ADD_ITEM", items: [{"id": "tea", "quantity": 1, "isRelative": true}], malayalamResponse: "ശരി, ഒരു ചായ കൂടി ചേർത്തിട്ടുണ്ട്."

Customer: "randu chaya koodi venam" / "2 tea koodi"
-> intent: "ADD_ITEM", items: [{"id": "tea", "quantity": 2, "isRelative": true}], malayalamResponse: "ശരി, രണ്ട് ചായ കൂടി ചേർത്തിട്ടുണ്ട്."

Customer: "egg bajji venam"
-> intent: "ADD_ITEM", items: [{"id": "egg-bajji", "quantity": 1}], malayalamResponse: "ശരി, ഒരു മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."

Customer: "egg bajji 4 venam"
-> intent: "ADD_ITEM", items: [{"id": "egg-bajji", "quantity": 4, "isRelative": false}], malayalamResponse: "ശരി, നാല് മുട്ട ബജ്ജി ചേർത്തിട്ടുണ്ട്."

Customer: "egg bajji 4 aakkam"
-> intent: "CHANGE_QUANTITY", items: [{"id": "egg-bajji", "quantity": 4}], malayalamResponse: "ശരി, എണ്ണം നാലാക്കി മാറ്റിയിട്ടുണ്ട്."

Customer: "രണ്ട് പഴംപൊരിയും ഒരു ചായയും വേണം"
-> intent: "ADD_ITEM", items: [{"id": "pazham-pori", "quantity": 2}, {"id": "tea", "quantity": 1}], malayalamResponse: "ശരി, രണ്ട് പഴംപൊരിയും ഒരു ചായയും ചേർത്തിട്ടുണ്ട്."

Customer: "കോഫി ഒഴിവാക്കൂ" / "കോഫി നീക്കം ചെയ്യൂ" / "കോഫി വേണ്ട"
-> intent: "REMOVE_FROM_CART", items: [{"id": "coffee"}], malayalamResponse: "ശരി, കാപ്പി ഒഴിവാക്കിയിട്ടുണ്ട്."

Customer: "രണ്ട് പഴംപൊരി ഒഴിവാക്കൂ"
-> intent: "REMOVE_FROM_CART", items: [{"id": "pazham-pori", "quantity": 2}], malayalamResponse: "ശരി, രണ്ട് പഴംപൊരി ഒഴിവാക്കിയിട്ടുണ്ട്."

Customer: "ചായ മൂന്ന് വേണം"
-> intent: "ADD_ITEM", items: [{"id": "tea", "quantity": 3}], malayalamResponse: "ശരി, മൂന്ന് ചായ ചേർത്തിട്ടുണ്ട്."

Customer: "ചായ മൂന്ന് ആക്കൂ" / "ചായ രണ്ടാക്കി മാറ്റൂ" / "പഴംപൊരി രണ്ടിൽ നിന്ന് മൂന്നാക്കൂ" / "കോഫി രണ്ട് ആക്കൂ" / "ചായയുടെ എണ്ണം രണ്ട് ആക്കൂ"
-> intent: "CHANGE_QUANTITY", items: [{"id": "tea", "quantity": 3}], malayalamResponse: "ശരി, എണ്ണം മൂന്നാക്കി മാറ്റിയിട്ടുണ്ട്."
(Note: CHANGE_QUANTITY replaces the existing quantity, while "ചായ മൂന്ന് വേണം" adds to cart).

Customer: "പഴംപൊരി വേണം എത്രയോ" / (unclear quantity)
-> intent: "ASK_QUANTITY", items: [{"id": "pazham-pori"}], malayalamResponse: "എത്ര എണ്ണം വേണമെന്ന് ഒന്ന് കൂടി പറയാമോ?"

Previous AI Question: "നിങ്ങളുടെ ആകെ തുക ₹30 ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?"
Customer: "അതെ" / "ശരി" / "വേണം" / "ചെയ്യാം" / "ഓക്കെ" / "ഓർഡർ ചെയ്യാം" / "ഓർഡർ ചെയ്യൂ" / "ഓർഡർ സ്ഥിരീകരിക്കൂ" / "ഓർഡർ കൺഫേം ചെയ്യൂ" / "ഓർഡർ കൺഫേം ചെയ്യാം" / "ഓർഡർ ഉറപ്പാക്കൂ" / "ഓർഡർ ഉറപ്പിക്കൂ" / "അതെ, ഓർഡർ ചെയ്യാം" / "അതെ, ഓർഡർ സ്ഥിരീകരിക്കൂ" / "ശരി ഓർഡർ ചെയ്യൂ" / "athe" / "shari" / "order confirm cheyyu" / "order urappakku" / "yes confirm my order" / "എന്റെ ഓർഡർ കൺഫേം ചെയ്യൂ" / "എന്റെ ഓർഡർ സ്ഥിരീകരിക്കൂ" / "എന്റെ ഓർഡർ ഉറപ്പാക്കൂ" / "അതെ, ഉറപ്പാണ്" / "അതെ, ശരിയാണ്" / "ശരി, ഉറപ്പാക്കാം"
-> intent: "CONFIRM_ORDER", malayalamResponse: "നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിച്ചിട്ടുണ്ട്. നന്ദി ഉണ്ടേ!"

Previous AI Question: "നിങ്ങളുടെ ആകെ തുക ₹30 ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?"
Customer: "ഇല്ല" / "വേണ്ട" / "ഓർഡർ വേണ്ട" / "ഓർഡർ ചെയ്യണ്ട" / "നിർത്തൂ" / "മാറ്റണം" / "വേണ്ട, മാറ്റണം" / "എനിക്ക് മാറ്റണം" / "illa" / "venda" / "no" / "cancel"
-> intent: "CANCEL_ORDER", malayalamResponse: "ശരി, എന്താണ് മാറ്റം വരുത്തേണ്ടത്?"

Customer: "ചായ വേണ്ട" / "remove tea"
-> intent: "REMOVE_FROM_CART", items: [{"id": "tea"}], malayalamResponse: "ശരി, ചായ ഒഴിവാക്കിയിട്ടുണ്ട്."

Customer: "എന്റെ ഓർഡർ പറയൂ" / "what is in my cart"
-> intent: "SHOW_CART", malayalamResponse: "നിങ്ങളുടെ ഓർഡറിൽ..." (describe items naturally in Malayalam with total in rupees: "...രൂപ ആണ്")

Customer: "ഓർഡർ കൺഫേം ചെയ്യൂ" / "കൺഫേം" / "yes"
-> intent: "CONFIRM_ORDER", malayalamResponse: "നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിച്ചിട്ടുണ്ട്. നന്ദി ഉണ്ടേ!"

Customer: "ടോട്ടൽ എത്രയായി" / "how much is total"
-> intent: "CHECK_TOTAL", malayalamResponse: "ആകെ തുക... രൂപ ആണ്."

Customer: "ചെക്ക്ഔട്ട്" / "മതി" / "that is all"
-> intent: "CHECKOUT", malayalamResponse: "നിങ്ങളുടെ ഓർഡറിൽ... ഉണ്ട്. ആകെ തുക... രൂപ ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?"

Customer: "എന്തൊക്കെ ഉണ്ട്" / "what snacks do you have"
-> intent: "MENU_INQUIRY", malayalamResponse: "ഞങ്ങളുടെ മെനുവിൽ പഴംപൊരി, ഉള്ളിവട, പരിപ്പുവട, ഉഴുന്നുവട, മുളക് ബജ്ജി, മുട്ട ബജ്ജി, ചിക്കൻ കട്ട്ലറ്റ്, ചായ, കാപ്പി, പാൽക്കപ്പയും മീൻ കറിയും ഉണ്ട്. എന്താണ് വേണ്ടത്?"

Customer asks a question unrelated to food, drinks, menu, restaurant, or ordering (weather, cricket, politics, jokes, stories, math, coding, phone fix, AI, elon musk, news, translation, songs, time):
-> intent: "OUT_OF_SCOPE", malayalamResponse: "ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?"

Customer says something not on menu or unclear:
-> intent: "UNKNOWN", malayalamResponse: "ക്ഷമിക്കണം, എനിക്ക് വ്യക്തമായി മനസ്സിലായില്ല. ഒന്നുകൂടി പറയാമോ?"

${MENU_PROMPT_CONTEXT}

Return ONLY valid JSON matching this schema:
{
  "intent": "ADD_ITEM" | "REMOVE_FROM_CART" | "REMOVE_ITEM" | "CHANGE_QUANTITY" | "SHOW_CART" | "CHECK_TOTAL" | "CHECKOUT" | "CONFIRM_ORDER" | "CANCEL_ORDER" | "SHOW_CATEGORY" | "MENU_INQUIRY" | "PRICE_INQUIRY" | "START_NEW_ORDER" | "OUT_OF_SCOPE" | "UNKNOWN",
  "items": [
    { "id": "pazham-pori", "quantity": 2, "isRelative": false }
  ],
  "category": "snacks" | "drinks" | "meals" | null,
  "malayalamResponse": "natural Malayalam text"
}
`;

/**
 * Call Gemini REST API
 */
export async function callGeminiForMalayalam({ transcript, alternatives = [], currentState = {} }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return { success: false, error: 'NO_API_KEY' };
  }

  const userPrompt = `
Previous AI Question / Context: "${currentState.lastAiPrompt || currentState.lastPromptContext?.text || ''}"
Current Screen: ${currentState.screen || 'menu'}
Current Voice State: ${currentState.voiceState || 'LISTENING'}
Current Cart: ${JSON.stringify((currentState.cart || []).map(e => ({ id: e.item.id, name: e.item.shortName, quantity: e.quantity })))}
Customer Speech: "${transcript}"
Alternatives: ${JSON.stringify(alternatives)}

Analyze the customer's request and output the appropriate intent, items, and Malayalam spoken response.
`;

  const models = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-3.5-flash'];

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 256
          }
        })
      });

      if (response.status === 429 || response.status === 503) {
        // High-demand or rate-limited, skip immediately to fallback model without blocking
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);

          // Normalize intent to uppercase
          if (parsed && parsed.intent) {
            parsed.intent = parsed.intent.toUpperCase();
          }

          // Normalize items array and item IDs
          if (parsed && Array.isArray(parsed.items)) {
            parsed.items.forEach(it => {
              if (it.id) it.id = it.id.replace(/_/g, '-');
            });
          }

          // Before returning the Gemini JSON, verify:
          // - Did the customer say a quantity?
          // - What exact quantity did they say?
          // - Does the returned items[].quantity equal that quantity?
          // If no explicit quantity exists, only then use quantity = 1.
          if (parsed && (parsed.intent === 'ADD_ITEM' || parsed.intent === 'CHANGE_QUANTITY' || parsed.intent === 'SET_QUANTITY' || parsed.intent === 'REMOVE_FROM_CART' || parsed.intent === 'REMOVE_ITEM') && Array.isArray(parsed.items) && transcript) {
            const digitMatch = transcript.match(/\b([1-9]|10)\b/);
            const engMatch = transcript.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/i);
            const malMatch = transcript.match(/(?:^|[\s\p{P}])(ഒരു|ഒന്ന്|രണ്ട്|മൂന്ന്|നാല്|അഞ്ച്|ആറ്|ഏഴ്|എട്ട്|ഒമ്പത്|ഒൻപത്|പത്ത്)(?:$|[\s\p{P}])/u);
            const manglishMatch = transcript.match(/\b(oru|onnu|randu|moonnu|moonu|munu|nalu|naalu|anchu|anju|aaru|aru|ezhu|ettu|ombathu|onpathu|pathu)\b/i);
            const wordMap = {
              'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
              'oru': 1, 'onnu': 1, 'randu': 2, 'moonnu': 3, 'moonu': 3, 'munu': 3, 'nalu': 4, 'naalu': 4,
              'anchu': 5, 'anju': 5, 'aaru': 6, 'aru': 6, 'ezhu': 7, 'ettu': 8, 'ombathu': 9, 'onpathu': 9, 'pathu': 10,
              'ഒരു': 1, 'ഒന്ന്': 1, 'രണ്ട്': 2, 'മൂന്ന്': 3, 'നാല്': 4, 'അഞ്ച്': 5, 'ആറ്': 6, 'ഏഴ്': 7, 'എട്ട്': 8, 'ഒമ്പത്': 9, 'ഒൻപത്': 9, 'പത്ത്': 10
            };
            const explicitQty = digitMatch 
              ? parseInt(digitMatch[1], 10) 
              : (engMatch
                ? wordMap[engMatch[1].toLowerCase()]
                : (malMatch 
                  ? wordMap[malMatch[1]] 
                  : (manglishMatch ? wordMap[manglishMatch[1].toLowerCase()] : null)));

            const hasRelativeKeyword = /(?:കൂടി|കൂടെ|koodi|koode|more)/ui.test(transcript);

            if (parsed.items.length === 1) {
              if (explicitQty && explicitQty > 0) {
                if (parsed.items[0].quantity !== explicitQty) {
                  console.log(`[Gemini Quantity Verification] Customer said ${explicitQty}, Gemini returned ${parsed.items[0].quantity} → Preserving ${explicitQty}`);
                  parsed.items[0].quantity = explicitQty;
                }
              }
              if (hasRelativeKeyword) {
                parsed.items[0].isRelative = true;
              }
            } else if (parsed.items.length > 1 && hasRelativeKeyword) {
              parsed.items.forEach(it => { it.isRelative = true; });
            }
          }

          return { success: true, ...parsed, source: 'gemini', model };
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[Gemini API ${model} Error]:`, errData.error?.message || response.status);
      }
    } catch (err) {
      console.warn(`[Gemini API ${model} Network Error]:`, err.message);
    }
  }

  return { success: false, error: 'GEMINI_CALL_FAILED' };
}

/**
 * HTTP Middleware handler for /api/gemini
 */
export async function geminiMiddlewareHandler(req, res) {
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
      const { transcript, alternatives, currentState } = parsed;

      if (!transcript || typeof transcript !== 'string') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing transcript parameter.' }));
        return;
      }

      const result = await callGeminiForMalayalam({
        transcript: transcript.trim(),
        alternatives: alternatives || [],
        currentState: currentState || {}
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to process Gemini request: ' + err.message }));
    }
  });
}
