import { parseVoiceCommand } from './src/services/voiceParser.js';

console.log("==================================================");
console.log("TESTING ORDER CONFIRMATION INTENT & CONTEXT SAFETY");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`✓ PASS: ${description}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${description}`);
    console.error(`   Expected: "${expected}", but got: "${actual}"`);
    failed++;
  }
}

// -------------------------------------------------------------
// 1. TEST THE 14 EXACT CASES FROM USER SPECIFICATION
// When confirmation state is active (screen: 'review' or prompt context)
// -------------------------------------------------------------
console.log("--- 1. Testing 14 Exact Cases from User Specification ---");
const contextReview = { screen: 'review' };
const contextPrompt = {
  lastAiPrompt: "നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?",
  lastPromptContext: { type: 'ORDER_CONFIRMATION', text: "നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?" }
};

const exactCases = [
  { text: "അതെ", expected: "CONFIRM_ORDER" },
  { text: "ശരി", expected: "CONFIRM_ORDER" },
  { text: "ഓർഡർ ചെയ്യാം", expected: "CONFIRM_ORDER" },
  { text: "ഓർഡർ ചെയ്യൂ", expected: "CONFIRM_ORDER" },
  { text: "ഓർഡർ സ്ഥിരീകരിക്കൂ", expected: "CONFIRM_ORDER" },
  { text: "ഓർഡർ കൺഫേം ചെയ്യൂ", expected: "CONFIRM_ORDER" },
  { text: "ഓർഡർ ഉറപ്പാക്കൂ", expected: "CONFIRM_ORDER" },
  { text: "അതെ, ഓർഡർ ചെയ്യാം", expected: "CONFIRM_ORDER" },
  { text: "അതെ, ഓർഡർ സ്ഥിരീകരിക്കൂ", expected: "CONFIRM_ORDER" },
  { text: "ശരി ഓർഡർ ചെയ്യൂ", expected: "CONFIRM_ORDER" },
  { text: "athe", expected: "CONFIRM_ORDER" },
  { text: "shari", expected: "CONFIRM_ORDER" },
  { text: "order confirm cheyyu", expected: "CONFIRM_ORDER" },
  { text: "yes, confirm my order", expected: "CONFIRM_ORDER" }
];

for (const { text, expected } of exactCases) {
  const resReview = parseVoiceCommand(text, contextReview);
  assert(`[Review screen] "${text}" -> ${expected}`, resReview?.type, expected);

  const resPrompt = parseVoiceCommand(text, contextPrompt);
  assert(`[AI prompt context] "${text}" -> ${expected}`, resPrompt?.type, expected);
}

// -------------------------------------------------------------
// 2. ADDITIONAL NATURAL MALAYALAM PHRASES FROM USER SPECIFICATION
// -------------------------------------------------------------
console.log("\n--- 2. Additional Natural Malayalam Phrases ---");
const additionalMalayalam = [
  "അതെ ഓർഡർ ചെയ്യൂ",
  "ഓർഡർ കൺഫേം ചെയ്യാം",
  "ഓർഡർ ഉറപ്പിക്കൂ",
  "ശരി, ഓർഡർ ചെയ്യാം",
  "എന്റെ ഓർഡർ കൺഫേം ചെയ്യൂ",
  "എന്റെ ഓർഡർ സ്ഥിരീകരിക്കൂ",
  "എന്റെ ഓർഡർ ഉറപ്പാക്കൂ",
  "അതെ, ഉറപ്പാണ്",
  "അതെ, ശരിയാണ്",
  "ശരി, ഉറപ്പാക്കാം"
];

for (const phrase of additionalMalayalam) {
  const res = parseVoiceCommand(phrase, contextPrompt);
  assert(`"${phrase}" -> CONFIRM_ORDER`, res?.type, "CONFIRM_ORDER");
}

// -------------------------------------------------------------
// 3. CONTEXTUAL SHORT RESPONSES WHEN ASSISTANT ASKED CONFIRMATION
// "നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?"
// -------------------------------------------------------------
console.log("\n--- 3. Short Contextual Responses after Confirmation Prompt ---");
const shortContextual = [
  "അതെ",
  "ശരി",
  "വേണം",
  "ചെയ്യാം",
  "ഓക്കെ",
  "ഓക്കേ",
  "അതെ ചെയ്യൂ",
  "order urappakku",
  "yes confirm my order"
];

for (const phrase of shortContextual) {
  const res = parseVoiceCommand(phrase, contextPrompt);
  assert(`Short reply "${phrase}" -> CONFIRM_ORDER`, res?.type, "CONFIRM_ORDER");
}

// -------------------------------------------------------------
// 4. NEGATIVE RESPONSES (MUST NOT CONFIRM)
// -------------------------------------------------------------
console.log("\n--- 4. Negative Responses (Must NOT confirm) ---");
const negativeCases = [
  "ഇല്ല",
  "വേണ്ട",
  "ഓർഡർ വേണ്ട",
  "ഓർഡർ ചെയ്യണ്ട",
  "നിർത്തൂ",
  "മാറ്റണം",
  "വേണ്ട, മാറ്റണം"
];

for (const phrase of negativeCases) {
  const res = parseVoiceCommand(phrase, contextPrompt);
  assert(`Negative "${phrase}" -> CANCEL_ORDER`, res?.type, "CANCEL_ORDER");
  assert(`Negative "${phrase}" must NOT be CONFIRM_ORDER`, res?.type !== "CONFIRM_ORDER", true);
}

// -------------------------------------------------------------
// 5. SAFETY: SHORT AFFIRMATIONS IN UNRELATED CONTEXT
// When screen is 'menu' and no confirmation was asked,
// saying "ശരി" or "അതെ" MUST NOT confirm the order!
// -------------------------------------------------------------
console.log("\n--- 5. Safety in Unrelated Context (Screen: menu) ---");
const unrelatedContext = {
  screen: 'menu',
  voiceState: 'LISTENING',
  cart: [{ item: { id: 'tea', shortName: 'Tea', price: 10 }, quantity: 1 }]
};

const safetyPhrases = ["ശരി", "അതെ", "athe", "shari", "വേണം", "ok"];

for (const phrase of safetyPhrases) {
  const res = parseVoiceCommand(phrase, unrelatedContext);
  assert(`Safety: "${phrase}" on menu screen must NOT trigger CONFIRM_ORDER`, res?.type !== "CONFIRM_ORDER", true);
}

// -------------------------------------------------------------
// 6. EXPLICIT ORDER CONFIRMATION IN UNRELATED CONTEXT
// When a customer explicitly says "ഓർഡർ കൺഫേം ചെയ്യൂ" or "confirm order"
// it SHOULD be recognized as CONFIRM_ORDER to prompt review/confirm
// -------------------------------------------------------------
console.log("\n--- 6. Explicit Order Commands from Menu ---");
const explicitFromMenu = [
  "ഓർഡർ കൺഫേം ചെയ്യൂ",
  "ഓർഡർ സ്ഥിരീകരിക്കൂ",
  "ഓർഡർ ഉറപ്പാക്കൂ",
  "order confirm cheyyu",
  "yes confirm my order"
];

for (const phrase of explicitFromMenu) {
  const res = parseVoiceCommand(phrase, unrelatedContext);
  assert(`Explicit "${phrase}" from menu -> CONFIRM_ORDER`, res?.type, "CONFIRM_ORDER");
}

console.log("\n==================================================");
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL ORDER CONFIRMATION TESTS PASSED PERFECTLY!");
}
