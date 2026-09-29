/**
 * Comprehensive Regression Suite for Quantities 1 to 10
 * Verifies that spoken quantities before products are strictly preserved
 * and correctly added to the cart without defaulting to 1.
 */

import { parseVoiceCommand } from './src/services/voiceParser.js';

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

// OrderContext Cart Simulation
function simulateAddToCart(parsed) {
  const cart = [];
  if (parsed.type === 'ADD_ITEM') {
    const itemsToAdd = parsed.items && parsed.items.length > 0
      ? parsed.items
      : [{ item: parsed.item, quantity: parsed.quantity || 1 }];
    
    itemsToAdd.forEach(({ item, quantity }) => {
      const validQty = (typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0) ? quantity : 1;
      const existing = cart.find(e => e.item.id === item.id);
      if (existing) {
        existing.quantity += validQty;
      } else {
        cart.push({ item, quantity: validQty });
      }
    });
  }
  return cart;
}

console.log('=====================================================');
console.log('REGRESSION SUITE: QUANTITIES 1 TO 10 ACROSS ALL ITEMS');
console.log('=====================================================\n');

// 1. SPECIFIC MANDATORY PROMPT TESTS
console.log('--- 1. Specific Target Commands ---');
const targetCommands = [
  { phrase: '4 mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 4 },
  { phrase: '1 mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 1 },
  { phrase: '2 mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 2 },
  { phrase: '3 mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 3 },
  { phrase: '5 mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 5 },
  { phrase: 'enikk 4 mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 4 },
  { phrase: 'enikku 3 mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 3 },
  { phrase: '4 kaappi venam', expectedId: 'coffee', expectedQty: 4 },
  { phrase: '3 mutta bajji venam', expectedId: 'egg-bajji', expectedQty: 3 },
  { phrase: '2 pazham pori venam', expectedId: 'pazham-pori', expectedQty: 2 },
  { phrase: '5 ulli vada venam', expectedId: 'ulli-vada', expectedQty: 5 },
  { phrase: '3 chicken cutlet venam', expectedId: 'chicken-cutlet', expectedQty: 3 },
  { phrase: 'naalu mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 4 },
  { phrase: 'moonnu kaappi venam', expectedId: 'coffee', expectedQty: 3 },
  { phrase: 'randu mutta bajji venam', expectedId: 'egg-bajji', expectedQty: 2 },
  { phrase: 'anchu mulaku bajji venam', expectedId: 'mulaku-bajji', expectedQty: 5 }
];

for (const t of targetCommands) {
  const parsed = parseVoiceCommand(t.phrase, { screen: 'menu', voiceState: 'LISTENING', cart: [] });
  const cart = simulateAddToCart(parsed);
  assert(
    cart.length === 1 && cart[0].item.id === t.expectedId && cart[0].quantity === t.expectedQty,
    `"${t.phrase}" -> Cart has ${cart[0]?.quantity}x ${cart[0]?.item?.shortName} (Expected ${t.expectedQty}x ${t.expectedId})`
  );
}

// 2. ALL 10 MENU ITEMS x DIGITS 1 TO 10
console.log('\n--- 2. All 10 Menu Items x Numeric Quantities 1 to 10 ---');
const allMenuItems = [
  { id: 'pazham-pori', phrase: 'pazham pori', name: 'Pazham Pori' },
  { id: 'ulli-vada', phrase: 'ulli vada', name: 'Ulli Vada' },
  { id: 'parippu-vada', phrase: 'parippu vada', name: 'Parippu Vada' },
  { id: 'medhu-vada', phrase: 'medhu vada', name: 'Medhu Vada' },
  { id: 'mulaku-bajji', phrase: 'mulaku bajji', name: 'Mulaku Bajji' },
  { id: 'egg-bajji', phrase: 'egg bajji', name: 'Egg Bajji' },
  { id: 'chicken-cutlet', phrase: 'chicken cutlet', name: 'Chicken Cutlet' },
  { id: 'tea', phrase: 'tea', name: 'Tea' },
  { id: 'coffee', phrase: 'coffee', name: 'Coffee' },
  { id: 'paal-kappa', phrase: 'paal kappa', name: 'Paal Kappa & Fish Curry' }
];

for (const it of allMenuItems) {
  for (let q = 1; q <= 10; q++) {
    const phrase = `enik ${q} ${it.phrase} venam`;
    const parsed = parseVoiceCommand(phrase, { screen: 'menu', voiceState: 'LISTENING', cart: [] });
    const cart = simulateAddToCart(parsed);
    assert(
      cart.length === 1 && cart[0].item.id === it.id && cart[0].quantity === q,
      `Numeric ${q}x ${it.name}: "${phrase}" -> ${cart[0]?.quantity} in cart`
    );
  }
}

// 3. ALL 10 MENU ITEMS x MANGLISH NUMBER WORDS 1 TO 10
console.log('\n--- 3. All 10 Menu Items x Manglish Words 1 to 10 ---');
const manglishWords = [
  { word: 'oru', val: 1 },
  { word: 'randu', val: 2 },
  { word: 'moonnu', val: 3 },
  { word: 'naalu', val: 4 },
  { word: 'nalu', val: 4 },
  { word: 'anchu', val: 5 },
  { word: 'anju', val: 5 },
  { word: 'aaru', val: 6 },
  { word: 'ezhu', val: 7 },
  { word: 'ettu', val: 8 },
  { word: 'onpathu', val: 9 },
  { word: 'pathu', val: 10 }
];

for (const it of allMenuItems) {
  for (const mw of manglishWords) {
    const phrase = `enik ${mw.word} ${it.phrase} venam`;
    const parsed = parseVoiceCommand(phrase, { screen: 'menu', voiceState: 'LISTENING', cart: [] });
    const cart = simulateAddToCart(parsed);
    assert(
      cart.length === 1 && cart[0].item.id === it.id && cart[0].quantity === mw.val,
      `Word "${mw.word}" (${mw.val}x) ${it.name}: "${phrase}" -> ${cart[0]?.quantity} in cart`
    );
  }
}

console.log('\n=====================================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('=====================================================');

if (failed > 0) {
  process.exit(1);
}
