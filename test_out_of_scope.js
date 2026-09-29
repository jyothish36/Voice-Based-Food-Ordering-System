import assert from 'assert';
import { parseVoiceCommand, isOutOfScopeQuery, detectLanguage } from './src/services/voiceParser.js';
import { voiceSynthesizer, ENGLISH_OUT_OF_SCOPE_RESPONSE, MALAYALAM_OUT_OF_SCOPE_RESPONSE } from './src/services/voiceSynthesizer.js';

console.log('====================================================');
console.log('  COMPREHENSIVE OUT_OF_SCOPE INTENT & TTS SUITE    ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ PASS: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${desc}`);
    console.error(`  Error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Helper to simulate response message resolution in OrderContext
// -------------------------------------------------------------
function resolveOutOfScopeResponse(raw, language) {
  const isMalayalam = /[\u0D00-\u0D7F]/.test(raw) ||
    /\b(engane|enganeyanu|ariyanam|enthanu|aaranu|parayamo|cheyyamo|eppol|samayam|kadha|paattu|pattu|thamasha|kollamo|aar|ethu|evide|nalla|chaya|kaapi|pazham|vada|bajji|venam|tharu|koodi|koode|illa|alla|athe|shari|chetta|chechi)\b/i.test(raw) ||
    language === 'Malayalam (ml-IN)';
  
  return isMalayalam ? MALAYALAM_OUT_OF_SCOPE_RESPONSE : ENGLISH_OUT_OF_SCOPE_RESPONSE;
}

// -------------------------------------------------------------
// 1. ENGLISH OUT-OF-SCOPE EXAMPLES
// -------------------------------------------------------------
console.log('--- 1. ENGLISH OUT-OF-SCOPE EXAMPLES ---');
const englishExamples = [
  "Who is the Prime Minister of India?",
  "What is the capital of India?",
  "What's the weather today?",
  "Who won the cricket match?",
  "Tell me a joke.",
  "Tell me a story.",
  "What is 25 multiplied by 10?",
  "Write Python code.",
  "Help me fix my phone.",
  "What is artificial intelligence?",
  "Who is Elon Musk?",
  "What happened in the news today?",
  "Can you translate this?",
  "Play a song.",
  "What time is it?"
];

for (const query of englishExamples) {
  runTest(`English Out-Of-Scope: "${query}"`, () => {
    assert.strictEqual(isOutOfScopeQuery(query, query), true, 'isOutOfScopeQuery should be true');
    const parsed = parseVoiceCommand(query);
    assert.ok(parsed, 'parsed command should exist');
    assert.strictEqual(parsed.type, 'OUT_OF_SCOPE', `Intent should be OUT_OF_SCOPE, got ${parsed.type}`);
    const response = resolveOutOfScopeResponse(query, parsed.language);
    assert.strictEqual(response, ENGLISH_OUT_OF_SCOPE_RESPONSE, `Expected English response, got: ${response}`);
  });
}

// -------------------------------------------------------------
// 2. MALAYALAM OUT-OF-SCOPE EXAMPLES
// -------------------------------------------------------------
console.log('\n--- 2. MALAYALAM OUT-OF-SCOPE EXAMPLES ---');
const malayalamExamples = [
  "ഇന്ത്യയുടെ പ്രധാനമന്ത്രി ആരാണ്?",
  "ഇന്ത്യയുടെ തലസ്ഥാനം ഏതാണ്?",
  "ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്?",
  "ഇന്നലെ ക്രിക്കറ്റ് ആര് ജയിച്ചു?",
  "ഒരു തമാശ പറയാമോ?",
  "ഒരു കഥ പറയൂ.",
  "25 ഗുണം 10 എത്രയാണ്?",
  "Python കോഡ് എഴുതാമോ?",
  "എന്റെ ഫോൺ എങ്ങനെ ശരിയാക്കാം?",
  "ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് എന്താണ്?",
  "ഇലോൺ മസ്ക് ആരാണ്?",
  "ഇന്നത്തെ വാർത്തകൾ എന്തൊക്കെയാണ്?",
  "ഇത് വിവർത്തനം ചെയ്യാമോ?",
  "ഒരു പാട്ട് പ്ലേ ചെയ്യൂ.",
  "ഇപ്പോൾ സമയം എത്രയാണ്?"
];

for (const query of malayalamExamples) {
  runTest(`Malayalam Out-Of-Scope: "${query}"`, () => {
    assert.strictEqual(isOutOfScopeQuery(query, query), true, 'isOutOfScopeQuery should be true');
    const parsed = parseVoiceCommand(query);
    assert.ok(parsed, 'parsed command should exist');
    assert.strictEqual(parsed.type, 'OUT_OF_SCOPE', `Intent should be OUT_OF_SCOPE, got ${parsed.type}`);
    const response = resolveOutOfScopeResponse(query, parsed.language);
    assert.strictEqual(response, MALAYALAM_OUT_OF_SCOPE_RESPONSE, `Expected Malayalam response, got: ${response}`);
  });
}

// -------------------------------------------------------------
// 3. MIXED LANGUAGE EXAMPLES
// -------------------------------------------------------------
console.log('\n--- 3. MIXED LANGUAGE EXAMPLES ---');
const mixedExamples = [
  {
    query: "Weather എങ്ങനെയാണ്?",
    expectedLang: 'ml',
    expectedResponse: MALAYALAM_OUT_OF_SCOPE_RESPONSE
  },
  {
    query: "Who is India's Prime Minister?",
    expectedLang: 'en',
    expectedResponse: ENGLISH_OUT_OF_SCOPE_RESPONSE
  },
  {
    query: "എനിക്ക് weather അറിയണം",
    expectedLang: 'ml',
    expectedResponse: MALAYALAM_OUT_OF_SCOPE_RESPONSE
  }
];

for (const { query, expectedLang, expectedResponse } of mixedExamples) {
  runTest(`Mixed Language Out-Of-Scope: "${query}"`, () => {
    assert.strictEqual(isOutOfScopeQuery(query, query), true, 'isOutOfScopeQuery should be true');
    const parsed = parseVoiceCommand(query);
    assert.ok(parsed, 'parsed command should exist');
    assert.strictEqual(parsed.type, 'OUT_OF_SCOPE', `Intent should be OUT_OF_SCOPE, got ${parsed.type}`);
    const response = resolveOutOfScopeResponse(query, parsed.language);
    assert.strictEqual(response, expectedResponse, `Expected ${expectedLang} response`);
  });
}

// -------------------------------------------------------------
// 4. IMPORTANT: FOOD & RESTAURANT QUESTIONS (ALLOWED)
// -------------------------------------------------------------
console.log('\n--- 4. ALLOWED RESTAURANT / FOOD QUESTIONS ---');
const allowedQuestions = [
  { query: "How much is tea?", expectedIntent: 'PRICE_INQUIRY', expectedItem: 'tea' },
  { query: "ചായയ്ക്ക് എത്രയാണ്?", expectedIntent: 'PRICE_INQUIRY', expectedItem: 'tea' },
  { query: "What snacks do you have?", expectedIntent: 'MENU_INQUIRY' },
  { query: "സ്നാക്സിൽ എന്തൊക്കെയുണ്ട്?", expectedIntent: 'MENU_INQUIRY' },
  { query: "Which food is good?", expectedIntent: 'RESTAURANT_INQUIRY' },
  { query: "ഏതാണ് നല്ല സ്നാക്ക്?", expectedIntent: 'RESTAURANT_INQUIRY' },
  { query: "What is pazham pori?", expectedIntent: 'ITEM_EXPLANATION', expectedItem: 'pazham-pori' },
  { query: "പഴംപൊരി എന്താണ്?", expectedIntent: 'ITEM_EXPLANATION', expectedItem: 'pazham-pori' },
  { query: "Is egg bajji spicy?", expectedIntent: 'RESTAURANT_INQUIRY', expectedItem: 'egg-bajji' },
  { query: "മുട്ട ബജ്ജി എരിവാണോ?", expectedIntent: 'RESTAURANT_INQUIRY', expectedItem: 'egg-bajji' }
];

for (const { query, expectedIntent, expectedItem } of allowedQuestions) {
  runTest(`Allowed Question: "${query}"`, () => {
    assert.strictEqual(isOutOfScopeQuery(query, query), false, 'isOutOfScopeQuery should be false for food questions');
    const parsed = parseVoiceCommand(query);
    assert.ok(parsed, 'parsed command should exist');
    assert.notStrictEqual(parsed.type, 'OUT_OF_SCOPE', 'Allowed food questions must NOT be OUT_OF_SCOPE');
    assert.strictEqual(parsed.type, expectedIntent, `Expected intent ${expectedIntent}, got ${parsed.type}`);
    if (expectedItem) {
      assert.strictEqual(parsed.item?.id, expectedItem, `Expected item ${expectedItem}, got ${parsed.item?.id}`);
    }
  });
}

// -------------------------------------------------------------
// 5. MIXED REQUESTS (Unrelated Question + Valid Order)
// -------------------------------------------------------------
console.log('\n--- 5. MIXED REQUESTS ---');
runTest('Mixed Request English: "What\'s the weather today? Anyway, give me two teas."', () => {
  const parsed = parseVoiceCommand("What's the weather today? Anyway, give me two teas.");
  assert.ok(parsed, 'parsed should exist');
  assert.strictEqual(parsed.type, 'ADD_ITEM', 'Intent must be ADD_ITEM');
  assert.strictEqual(parsed.items?.length, 1, 'Should extract 1 item');
  assert.strictEqual(parsed.items[0].item.id, 'tea', 'Extracted item should be tea');
  assert.strictEqual(parsed.items[0].quantity, 2, 'Extracted quantity should be 2');
});

runTest('Mixed Request Malayalam: "ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്? എനിക്ക് രണ്ട് ചായ വേണം."', () => {
  const parsed = parseVoiceCommand("ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്? എനിക്ക് രണ്ട് ചായ വേണം.");
  assert.ok(parsed, 'parsed should exist');
  assert.strictEqual(parsed.type, 'ADD_ITEM', 'Intent must be ADD_ITEM');
  assert.strictEqual(parsed.items?.length, 1, 'Should extract 1 item');
  assert.strictEqual(parsed.items[0].item.id, 'tea', 'Extracted item should be tea');
  assert.strictEqual(parsed.items[0].quantity, 2, 'Extracted quantity should be 2');
});

// -------------------------------------------------------------
// 6. CART PROTECTION ON OUT_OF_SCOPE
// -------------------------------------------------------------
console.log('\n--- 6. CART PROTECTION VERIFICATION ---');
runTest('Cart remains completely untouched when customer asks OUT_OF_SCOPE query', () => {
  // Simulate cart before out-of-scope query
  const cartBefore = [
    { item: { id: 'pazham-pori', shortName: 'Pazham Pori', price: 10 }, quantity: 3 }
  ];
  
  const parsed = parseVoiceCommand("What is the capital of India?", { cart: cartBefore });
  assert.strictEqual(parsed.type, 'OUT_OF_SCOPE');
  
  // Under OUT_OF_SCOPE, no items are returned or altered
  assert.ok(!parsed.items || parsed.items.length === 0, 'No items should be added or removed');
  assert.ok(!parsed.quantity, 'No quantity should be altered');
  
  // Cart invariant
  assert.strictEqual(cartBefore.length, 1);
  assert.strictEqual(cartBefore[0].quantity, 3);
  assert.strictEqual(cartBefore[0].item.id, 'pazham-pori');
});

// -------------------------------------------------------------
// 7. EXACT RESPONSE PHRASES VERIFICATION
// -------------------------------------------------------------
console.log('\n--- 7. EXACT RESPONSE STRINGS ---');
runTest('English exact response string matches requirements', () => {
  assert.strictEqual(
    ENGLISH_OUT_OF_SCOPE_RESPONSE,
    "Sorry, I can only help with food, menu, and your order. What would you like to order?"
  );
  assert.strictEqual(
    voiceSynthesizer.getOutOfScopeResponse(true),
    "Sorry, I can only help with food, menu, and your order. What would you like to order?"
  );
});

runTest('Malayalam exact response string matches requirements', () => {
  assert.strictEqual(
    MALAYALAM_OUT_OF_SCOPE_RESPONSE,
    "ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?"
  );
  assert.strictEqual(
    voiceSynthesizer.getOutOfScopeResponse(false),
    "ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?"
  );
});

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} passed`);
console.log('====================================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL OUT_OF_SCOPE TESTS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error(`💥 ${totalTests - passedTests} tests failed!`);
  process.exit(1);
}
