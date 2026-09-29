import { parseVoiceCommand, normalizeText, extractQuantity, matchMenuItem, extractMultipleItems, detectLanguage } from './src/services/voiceParser.js';
import { speechRecognizer } from './src/services/speechRecognizer.js';
import { MENU_DICTIONARY } from './src/services/menuDictionary.js';

console.log('--- RUNNING EXPANDED ASR & VOICE ACCURACY TEST SUITE ---\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`✗ FAIL: ${message}`);
  }
}

// 0. STRUCTURED MENU DICTIONARY CHECK (Requirement 8)
console.log('\n[0. Structured Menu Dictionary Validation]');
{
  assert(MENU_DICTIONARY.length === 10, 'Menu dictionary contains all 10 canonical menu items');
  const sampleItem = MENU_DICTIONARY.find(i => i.id === 'pazham-pori');
  assert(sampleItem && sampleItem.canonicalName && sampleItem.aliases && sampleItem.malayalamName && sampleItem.commonSpeechVariants,
    'Menu dictionary items contain canonicalName, aliases, commonSpeechVariants, and malayalamName'
  );
}

// 1. COMPLETE SENTENCE CAPTURE & COMPOUND SENTENCES (Requirements 1, 2, 9 & 12)
console.log('\n[1. Complete Sentence & Multi-Item Tests]');
{
  // 3-item compound sentence from Requirement 12
  const rMulti = parseVoiceCommand('I want two pazham pori, one tea and three chicken cutlets.');
  assert(rMulti && rMulti.type === 'ADD_ITEM' && rMulti.items.length === 3 &&
    rMulti.items.some(i => i.item.id === 'pazham-pori' && i.quantity === 2) &&
    rMulti.items.some(i => i.item.id === 'tea' && i.quantity === 1) &&
    rMulti.items.some(i => i.item.id === 'chicken-cutlet' && i.quantity === 3),
    'Three items in one sentence: "I want two pazham pori, one tea and three chicken cutlets."'
  );

  const r1 = parseVoiceCommand('I want two pazham pori and one tea.');
  assert(r1 && r1.type === 'ADD_ITEM' && r1.items.length === 2 &&
    r1.items.some(i => i.item.id === 'pazham-pori' && i.quantity === 2) &&
    r1.items.some(i => i.item.id === 'tea' && i.quantity === 1),
    'Complete sentence: "I want two pazham pori and one tea."'
  );

  const r2 = parseVoiceCommand('Can I get two pazham pori?');
  assert(r2 && r2.type === 'ADD_ITEM' && r2.item.id === 'pazham-pori' && r2.quantity === 2,
    'Natural question: "Can I get two pazham pori?"'
  );

  const r3 = parseVoiceCommand('I would like one tea please.');
  assert(r3 && r3.type === 'ADD_ITEM' && r3.item.id === 'tea' && r3.quantity === 1,
    'Polite request: "I would like one tea please."'
  );

  const r4 = parseVoiceCommand('Can you give me three ulli vada?');
  assert(r4 && r4.type === 'ADD_ITEM' && r4.item.id === 'ulli-vada' && r4.quantity === 3,
    'Polite request: "Can you give me three ulli vada?"'
  );

  const r5 = parseVoiceCommand("I'll have a coffee and two chicken cutlets.");
  assert(r5 && r5.type === 'ADD_ITEM' && r5.items.length === 2 &&
    r5.items.some(i => i.item.id === 'coffee' && i.quantity === 1) &&
    r5.items.some(i => i.item.id === 'chicken-cutlet' && i.quantity === 2),
    'Natural contraction: "I\'ll have a coffee and two chicken cutlets."'
  );

  const r6 = parseVoiceCommand('Please add another tea.');
  assert(r6 && r6.type === 'ADD_ITEM' && r6.item.id === 'tea' && r6.isRelative === true,
    'Relative add: "Please add another tea."'
  );

  const r7 = parseVoiceCommand('Actually, remove the coffee.');
  assert(r7 && (r7.type === 'REMOVE_ITEM' || r7.type === 'REMOVE_FROM_CART') && r7.item.id === 'coffee',
    'Correction with filler: "Actually, remove the coffee."'
  );
}

// 2. CORRECTION HANDLING WITHIN SPEECH (Requirement 15)
console.log('\n[2. Spoken Correction Handling Tests]');
{
  const rCorr1 = parseVoiceCommand('I want two pazham pori... sorry, three.');
  assert(rCorr1 && rCorr1.type === 'ADD_ITEM' && rCorr1.item.id === 'pazham-pori' && rCorr1.quantity === 3,
    'Correction: "I want two pazham pori... sorry, three." -> Pazham Pori x 3'
  );

  const rCorr2 = parseVoiceCommand('Add one tea... actually make that two.');
  assert(rCorr2 && rCorr2.type === 'ADD_ITEM' && rCorr2.item.id === 'tea' && rCorr2.quantity === 2,
    'Correction: "Add one tea... actually make that two." -> Tea x 2'
  );

  const rCorr3 = parseVoiceCommand('Give me two ulli vada... no wait, four.');
  assert(rCorr3 && rCorr3.type === 'ADD_ITEM' && rCorr3.item.id === 'ulli-vada' && rCorr3.quantity === 4,
    'Correction: "Give me two ulli vada... no wait, four." -> Ulli Vada x 4'
  );
}

// 3. ASR TRANSCRIPTION MISHEARINGS & NORMALIZATION (Requirements 6, 7 & 9)
console.log('\n[3. Normalization & ASR Mishearing Correction Tests]');
{
  const r1 = parseVoiceCommand('give me too pazham puri and one chaya');
  assert(r1 && r1.type === 'ADD_ITEM' && r1.items.length === 2 &&
    r1.items.some(i => i.item.id === 'pazham-pori' && i.quantity === 2) &&
    r1.items.some(i => i.item.id === 'tea' && i.quantity === 1),
    'ASR typos: "give me too pazham puri and one chaya" -> 2 Pazham Pori + 1 Tea'
  );

  const r2 = parseVoiceCommand('two ulli wada');
  assert(r2 && r2.type === 'ADD_ITEM' && r2.item.id === 'ulli-vada' && r2.quantity === 2,
    'ASR variation: "two ulli wada" -> Ulli Vada x 2'
  );

  const r3 = parseVoiceCommand('three dal vada');
  assert(r3 && r3.type === 'ADD_ITEM' && r3.item.id === 'parippu-vada' && r3.quantity === 3,
    'ASR variation: "three dal vada" -> Parippu Vada x 3'
  );

  const r4 = parseVoiceCommand('two medu vada');
  assert(r4 && r4.type === 'ADD_ITEM' && r4.item.id === 'medhu-vada' && r4.quantity === 2,
    'ASR variation: "two medu vada" -> Medhu Vada x 2'
  );

  const r5 = parseVoiceCommand('one mulaku bhaji');
  assert(r5 && r5.type === 'ADD_ITEM' && r5.item.id === 'mulaku-bajji' && r5.quantity === 1,
    'ASR variation: "one mulaku bhaji" -> Mulaku Bajji x 1'
  );

  const r6 = parseVoiceCommand('two motta bajji');
  assert(r6 && r6.type === 'ADD_ITEM' && r6.item.id === 'egg-bajji' && r6.quantity === 2,
    'Malayalam variation: "two motta bajji" -> Egg Bajji x 2'
  );

  const r7 = parseVoiceCommand('two chicken katlet');
  assert(r7 && r7.type === 'ADD_ITEM' && r7.item.id === 'chicken-cutlet' && r7.quantity === 2,
    'ASR phonetics: "two chicken katlet" -> Chicken Cutlet x 2'
  );

  const r8 = parseVoiceCommand('one kaapi and one chai');
  assert(r8 && r8.type === 'ADD_ITEM' && r8.items.length === 2 &&
    r8.items.some(i => i.item.id === 'coffee' && i.quantity === 1) &&
    r8.items.some(i => i.item.id === 'tea' && i.quantity === 1),
    'Indian loanwords: "one kaapi and one chai" -> Coffee x 1 + Tea x 1'
  );

  const r9 = parseVoiceCommand('paal kappa fish curry');
  assert(r9 && r9.type === 'ADD_ITEM' && r9.item.id === 'paal-kappa',
    'Meal compound: "paal kappa fish curry" -> Paal Kappa & Fish Curry'
  );

  const r10 = parseVoiceCommand('tapioca fish curry');
  assert(r10 && r10.type === 'ADD_ITEM' && r10.item.id === 'paal-kappa',
    'English alias: "tapioca fish curry" -> Paal Kappa & Fish Curry'
  );
}

// 4. MALAYALAM SCRIPT & MANGLISH RECOGNITION (Requirements 5, 6 & 9)
console.log('\n[4. Malayalam Script & Manglish Tests]');
{
  const r1 = parseVoiceCommand('രണ്ട് ചായ');
  assert(r1 && r1.type === 'ADD_ITEM' && r1.item.id === 'tea' && r1.quantity === 2,
    'Malayalam script: "രണ്ട് ചായ" -> Tea x 2'
  );

  const r2 = parseVoiceCommand('ഒരു കാപ്പി');
  assert(r2 && r2.type === 'ADD_ITEM' && r2.item.id === 'coffee' && r2.quantity === 1,
    'Malayalam script: "ഒരു കാപ്പി" -> Coffee x 1'
  );

  const r3 = parseVoiceCommand('രണ്ട് പഴംപൊരി വേണം');
  assert(r3 && r3.type === 'ADD_ITEM' && r3.item.id === 'pazham-pori' && r3.quantity === 2,
    'Malayalam sentence: "രണ്ട് പഴംപൊരി വേണം" -> Pazham Pori x 2'
  );

  const r4 = parseVoiceCommand('rand pazham pori venam');
  assert(r4 && r4.type === 'ADD_ITEM' && r4.item.id === 'pazham-pori' && r4.quantity === 2,
    'Manglish sentence: "rand pazham pori venam" -> Pazham Pori x 2'
  );

  const r5 = parseVoiceCommand('Two pazham pori venam.');
  assert(r5 && r5.type === 'ADD_ITEM' && r5.item.id === 'pazham-pori' && r5.quantity === 2,
    'Mixed sentence: "Two pazham pori venam." -> Pazham Pori x 2'
  );
}

// 5. FOOD-RELATED QUESTIONS (Requirements 16 & 17)
console.log('\n[5. Food-Related Questions & Out-Of-Scope Filtering]');
{
  const q1 = parseVoiceCommand('What is pazham pori?');
  assert(q1 && q1.type === 'ITEM_EXPLANATION' && q1.item.id === 'pazham-pori',
    'Food explanation: "What is pazham pori?" -> ITEM_EXPLANATION'
  );

  const q2 = parseVoiceCommand('Which one is cheaper?');
  assert(q2 && q2.type === 'PRICE_COMPARISON',
    'Price comparison: "Which one is cheaper?" -> PRICE_COMPARISON'
  );

  const q3 = parseVoiceCommand('Do you have coffee?');
  assert(q3 && q3.type === 'AVAILABILITY_INQUIRY' && q3.item.id === 'coffee',
    'Availability inquiry: "Do you have coffee?" -> AVAILABILITY_INQUIRY'
  );

  const q4 = parseVoiceCommand("What's good here?");
  assert(q4 && q4.type === 'RESTAURANT_INQUIRY' && q4.topic === 'recommendation',
    'Recommendation: "What\'s good here?" -> RESTAURANT_INQUIRY'
  );

  const q5 = parseVoiceCommand('How much is tea?');
  assert(q5 && q5.type === 'PRICE_INQUIRY' && q5.item.id === 'tea',
    'Price inquiry: "How much is tea?" -> PRICE_INQUIRY'
  );

  const o1 = parseVoiceCommand('What is the capital of India?');
  assert(o1 && o1.type === 'OUT_OF_SCOPE',
    'Out of scope: "What is the capital of India?" -> OUT_OF_SCOPE'
  );

  const o2 = parseVoiceCommand('Tell me a joke.');
  assert(o2 && o2.type === 'OUT_OF_SCOPE',
    'Out of scope: "Tell me a joke." -> OUT_OF_SCOPE'
  );
}

// 6. MULTI-ALTERNATIVE FALLBACK (Requirement 5)
console.log('\n[6. Multi-Alternative Fallback Tests]');
{
  // Primary has phonetic misrecognition ("pasan podi"), alternative 2 has exact menu match ("two pazham pori")
  const rAlt = parseVoiceCommand('give me two pasan podi', {
    alternatives: ['give me two pasan podi', 'give me two pazham pori']
  });
  assert(rAlt && rAlt.type === 'ADD_ITEM' && rAlt.item.id === 'pazham-pori' && rAlt.quantity === 2,
    'Multi-alternative fallback: alternative "give me two pazham pori" rescued primary error'
  );
}

// 7. AMBIGUITY DETECTION & DISAMBIGUATION (Requirements 10 & 11)
console.log('\n[7. Ambiguity Detection & Disambiguation Tests]');
{
  const r1 = parseVoiceCommand('I want a vada');
  assert(r1 && r1.type === 'CLARIFICATION_NEEDED' && r1.candidates && r1.candidates.length === 3,
    'Ambiguous item "vada" triggers CLARIFICATION_NEEDED with 3 candidates'
  );

  const r2 = parseVoiceCommand('Give me a bajji');
  assert(r2 && r2.type === 'CLARIFICATION_NEEDED' && r2.candidates && r2.candidates.length === 2,
    'Ambiguous item "bajji" triggers CLARIFICATION_NEEDED with 2 candidates'
  );
}

// 8. CONTEXT-AWARE RECOGNITION (Requirement 14)
console.log('\n[8. Context-Aware Recognition Tests]');
{
  const contextAskQty = {
    lastPromptContext: {
      type: 'ASK_QUANTITY',
      item: { id: 'tea', shortName: 'Tea' }
    }
  };
  const r1 = parseVoiceCommand('Two.', contextAskQty);
  assert(r1 && r1.type === 'ADD_ITEM' && r1.item.id === 'tea' && r1.quantity === 2,
    'Context quantity: AI asked teas, customer said "Two." -> Tea x 2'
  );

  const contextConfirm = {
    lastPromptContext: {
      type: 'CONFIRM_ITEM',
      item: { id: 'coffee', shortName: 'Coffee' },
      quantity: 1
    }
  };
  const r2 = parseVoiceCommand('Yes.', contextConfirm);
  assert(r2 && r2.type === 'ADD_ITEM' && r2.item.id === 'coffee' && r2.quantity === 1,
    'Context confirmation: AI asked coffee, customer said "Yes." -> Coffee x 1'
  );

  const r3 = parseVoiceCommand('No.', contextConfirm);
  assert(r3 && r3.type === 'CANCEL_CONFIRMATION',
    'Context rejection: Customer said "No." -> CANCEL_CONFIRMATION'
  );
}

// 9. SPEECH RECOGNIZER LIFECYCLE & DEDUPLICATION (Requirements 3, 4, 5)
console.log('\n[9. SpeechRecognizer Lifecycle & Deduplication Tests]');
{
  speechRecognizer.setLanguage('ml-IN');
  assert(speechRecognizer.getLanguage() === 'ml-IN', 'Language configuration: setLanguage("ml-IN")');

  speechRecognizer.setLanguage('en-IN');
  assert(speechRecognizer.getLanguage() === 'en-IN', 'Language configuration: setLanguage("en-IN")');

  let callbackCount = 0;
  speechRecognizer.setCallbacks({
    onResult: () => { callbackCount++; },
    onStateChange: () => {},
    onError: () => {}
  });

  speechRecognizer.simulateInput('two pazham pori');
  speechRecognizer.simulateInput('two pazham pori');

  setTimeout(() => {
    assert(callbackCount === 1, 'Duplicate recognition prevention: duplicate call ignored within cooldown');

    console.log(`\n========================================`);
    console.log(`ASR Test Suite: ${passed} passed, ${failed} failed out of ${passed + failed} assertions.`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  }, 200);
}
