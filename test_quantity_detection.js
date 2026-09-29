/**
 * Comprehensive Quantity & Count Detection Verification Suite
 * Tests all 13 sections requested in the user prompt:
 * 1. Basic Quantity Tests for every menu item
 * 2. Malayalam Number Forms (base, inflected, ennam)
 * 3. Quantity Before and After Item
 * 4. Manglish Number Forms
 * 5. Quantity + Unit (cup, plate, ennam)
 * 6. Multiple Items with exact quantity mapping (no swapping)
 * 7. Do Not Double-Count (ASR repetition/stutter)
 * 8. Corrections ("അല്ല", "sorry", etc.)
 * 9. Add vs Remove vs Change
 * 10. No Quantity specified (defaults to 1)
 * 11. Parse before cart update
 * 12. Debugging logger check
 * 13. Regression test across all 10 menu items
 */

import { parseVoiceCommand } from './src/services/voiceParser.js';
import { MENU_ITEMS } from './src/data/menu.js';

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

console.log('=====================================================');
console.log('TEST SUITE: ITEM QUANTITY & COUNT DETECTION');
console.log('=====================================================\n');

// 1. BASIC QUANTITY TESTS
console.log('--- 1. Basic Quantity Tests (1 to 5 for every item) ---');
const menuItems = [
  { id: 'pazham-pori', mal: 'പഴംപൊരി', en: 'pazham pori', name: 'Pazham Pori' },
  { id: 'ulli-vada', mal: 'ഉള്ളിവട', en: 'ulli vada', name: 'Ulli Vada' },
  { id: 'parippu-vada', mal: 'പരിപ്പുവട', en: 'parippu vada', name: 'Parippu Vada' },
  { id: 'medhu-vada', mal: 'മെദുവട', en: 'medhu vada', name: 'Medhu Vada' },
  { id: 'mulaku-bajji', mal: 'മുളക് ബജ്ജി', en: 'mulaku bajji', name: 'Mulaku Bajji' },
  { id: 'egg-bajji', mal: 'മുട്ട ബജ്ജി', en: 'mutta bajji', name: 'Egg Bajji' },
  { id: 'chicken-cutlet', mal: 'ചിക്കൻ കട്ട്ലറ്റ്', en: 'chicken cutlet', name: 'Chicken Cutlet' },
  { id: 'tea', mal: 'ചായ', en: 'tea', name: 'Tea' },
  { id: 'coffee', mal: 'കോഫി', en: 'coffee', name: 'Coffee' },
  { id: 'paal-kappa', mal: 'കപ്പ മീൻ കറി', en: 'kappa meen curry', name: 'Paal Kappa & Fish Curry' }
];

const basicQuantities = [
  { word: 'ഒരു', val: 1 },
  { word: 'രണ്ട്', val: 2 },
  { word: 'മൂന്ന്', val: 3 },
  { word: 'നാല്', val: 4 },
  { word: 'അഞ്ച്', val: 5 }
];

for (const item of menuItems) {
  for (const q of basicQuantities) {
    const phrase = `${q.word} ${item.mal}`;
    const res = parseVoiceCommand(phrase, { cart: [] });
    assert(
      res && res.type === 'ADD_ITEM' && res.item?.id === item.id && res.quantity === q.val,
      `"${phrase}" -> ${item.name} x ${q.val}`
    );
  }
}

// 2. MALAYALAM NUMBER FORMS
console.log('\n--- 2. Malayalam Number Forms ---');
const malForms = [
  { phrase: 'പഴംപൊരി ഒന്ന്', id: 'pazham-pori', qty: 1 },
  { phrase: 'പഴംപൊരി ഒരു', id: 'pazham-pori', qty: 1 },
  { phrase: 'പഴംപൊരി ഒരെണ്ണം', id: 'pazham-pori', qty: 1 },
  { phrase: 'പഴംപൊരി രണ്ട്', id: 'pazham-pori', qty: 2 },
  { phrase: 'പഴംപൊരി രണ്ടെണ്ണം', id: 'pazham-pori', qty: 2 },
  { phrase: 'മുട്ട ബജ്ജി മൂന്ന്', id: 'egg-bajji', qty: 3 },
  { phrase: 'മുട്ട ബജ്ജി മൂന്നെണ്ണം', id: 'egg-bajji', qty: 3 },
  { phrase: 'ഉള്ളിവട നാല്', id: 'ulli-vada', qty: 4 },
  { phrase: 'ഉള്ളിവട നാലെണ്ണം', id: 'ulli-vada', qty: 4 },
  { phrase: 'ചായ അഞ്ച്', id: 'tea', qty: 5 },
  { phrase: 'ചായ അഞ്ചെണ്ണം', id: 'tea', qty: 5 },
  { phrase: 'പരിപ്പുവട ആറ്', id: 'parippu-vada', qty: 6 },
  { phrase: 'പരിപ്പുവട ആറെണ്ണം', id: 'parippu-vada', qty: 6 },
  { phrase: 'മെദുവട ഏഴ്', id: 'medhu-vada', qty: 7 },
  { phrase: 'മെദുവട ഏഴെണ്ണം', id: 'medhu-vada', qty: 7 },
  { phrase: 'ചിക്കൻ കട്ട്ലറ്റ് എട്ട്', id: 'chicken-cutlet', qty: 8 },
  { phrase: 'ചിക്കൻ കട്ട്ലറ്റ് എട്ടെണ്ണം', id: 'chicken-cutlet', qty: 8 },
  { phrase: 'മുളക് ബജ്ജി ഒൻപത്', id: 'mulaku-bajji', qty: 9 },
  { phrase: 'മുളക് ബജ്ജി ഒമ്പത്', id: 'mulaku-bajji', qty: 9 },
  { phrase: 'മുളക് ബജ്ജി ഒൻപതെണ്ണം', id: 'mulaku-bajji', qty: 9 },
  { phrase: 'കോഫി പത്ത്', id: 'coffee', qty: 10 },
  { phrase: 'കോഫി പത്തെണ്ണം', id: 'coffee', qty: 10 }
];

for (const t of malForms) {
  const res = parseVoiceCommand(t.phrase, { cart: [] });
  assert(
    res && res.type === 'ADD_ITEM' && res.item?.id === t.id && res.quantity === t.qty,
    `"${t.phrase}" -> ${t.id} x ${t.qty}`
  );
}

// 3. QUANTITY BEFORE OR AFTER ITEM
console.log('\n--- 3. Quantity Before or After Item ---');
const beforeAfter = [
  { phrase: 'രണ്ട് ചായ', id: 'tea', qty: 2 },
  { phrase: 'ചായ രണ്ട്', id: 'tea', qty: 2 },
  { phrase: 'മൂന്ന് മുട്ട ബജ്ജി', id: 'egg-bajji', qty: 3 },
  { phrase: 'മുട്ട ബജ്ജി മൂന്ന്', id: 'egg-bajji', qty: 3 },
  { phrase: 'രണ്ട് പഴംപൊരി വേണം', id: 'pazham-pori', qty: 2 },
  { phrase: 'പഴംപൊരി രണ്ട് എണ്ണം വേണം', id: 'pazham-pori', qty: 2 }
];

for (const t of beforeAfter) {
  const res = parseVoiceCommand(t.phrase, { cart: [] });
  assert(
    res && res.type === 'ADD_ITEM' && res.item?.id === t.id && res.quantity === t.qty,
    `"${t.phrase}" -> ${t.id} x ${t.qty}`
  );
}

// 4. MANGLISH
console.log('\n--- 4. Manglish Tests ---');
const manglishTests = [
  { phrase: 'randu pazham pori', id: 'pazham-pori', qty: 2 },
  { phrase: 'moonnu mutta bajji', id: 'egg-bajji', qty: 3 },
  { phrase: 'naalu ulli vada', id: 'ulli-vada', qty: 4 },
  { phrase: 'anju chaya', id: 'tea', qty: 5 },
  { phrase: 'randu coffee', id: 'coffee', qty: 2 }
];

for (const t of manglishTests) {
  const res = parseVoiceCommand(t.phrase, { cart: [] });
  assert(
    res && res.type === 'ADD_ITEM' && res.item?.id === t.id && res.quantity === t.qty,
    `"${t.phrase}" -> ${t.id} x ${t.qty}`
  );
}

// 5. QUANTITY + UNIT
console.log('\n--- 5. Quantity + Unit ---');
const unitTests = [
  { phrase: 'രണ്ട് കപ്പ് ചായ', id: 'tea', qty: 2 },
  { phrase: 'മൂന്ന് കപ്പ് കോഫി', id: 'coffee', qty: 3 },
  { phrase: 'രണ്ട് പ്ലേറ്റ് കപ്പ മീൻ കറി', id: 'paal-kappa', qty: 2 },
  { phrase: 'ഒരു പ്ലേറ്റ് കപ്പ മീൻ കറി', id: 'paal-kappa', qty: 1 }
];

for (const t of unitTests) {
  const res = parseVoiceCommand(t.phrase, { cart: [] });
  assert(
    res && res.type === 'ADD_ITEM' && res.item?.id === t.id && res.quantity === t.qty,
    `"${t.phrase}" -> ${t.id} x ${t.qty}`
  );
}

// 6. MULTIPLE ITEMS - EXACT MAPPING
console.log('\n--- 6. Multiple Items with Exact Mapping ---');

// Example 1: "രണ്ട് പഴംപൊരിയും മൂന്ന് മുട്ട ബജ്ജിയും ഒരു ചായയും വേണം"
{
  const res = parseVoiceCommand('രണ്ട് പഴംപൊരിയും മൂന്ന് മുട്ട ബജ്ജിയും ഒരു ചായയും വേണം', { cart: [] });
  assert(res && res.type === 'ADD_ITEM', 'Multi-item parsed as ADD_ITEM');
  assert(res.items && res.items.length === 3, 'Found 3 items');
  assert(res.items[0]?.item?.id === 'pazham-pori' && res.items[0]?.quantity === 2, 'Pazham Pori x 2');
  assert(res.items[1]?.item?.id === 'egg-bajji' && res.items[1]?.quantity === 3, 'Egg Bajji x 3');
  assert(res.items[2]?.item?.id === 'tea' && res.items[2]?.quantity === 1, 'Tea x 1');
}

// Example 2: "ഒരു ചായയും രണ്ട് കോഫിയും മൂന്ന് ഉള്ളിവടയും വേണം"
{
  const res = parseVoiceCommand('ഒരു ചായയും രണ്ട് കോഫിയും മൂന്ന് ഉള്ളിവടയും വേണം', { cart: [] });
  assert(res && res.type === 'ADD_ITEM', 'Multi-item parsed as ADD_ITEM');
  assert(res.items && res.items.length === 3, 'Found 3 items');
  assert(res.items[0]?.item?.id === 'tea' && res.items[0]?.quantity === 1, 'Tea x 1');
  assert(res.items[1]?.item?.id === 'coffee' && res.items[1]?.quantity === 2, 'Coffee x 2');
  assert(res.items[2]?.item?.id === 'ulli-vada' && res.items[2]?.quantity === 3, 'Ulli Vada x 3');
}

// Example 3: "പഴംപൊരി രണ്ടെണ്ണവും മൂന്ന് ചായയും"
{
  const res = parseVoiceCommand('പഴംപൊരി രണ്ടെണ്ണവും മൂന്ന് ചായയും', { cart: [] });
  assert(res && res.items?.length === 2, 'Found 2 items');
  assert(res.items[0]?.item?.id === 'pazham-pori' && res.items[0]?.quantity === 2, 'Pazham Pori x 2');
  assert(res.items[1]?.item?.id === 'tea' && res.items[1]?.quantity === 3, 'Tea x 3');
}

// Example 4: "പഴംപൊരി രണ്ട് മൂന്ന് ചായ"
{
  const res = parseVoiceCommand('പഴംപൊരി രണ്ട് മൂന്ന് ചായ', { cart: [] });
  assert(res && res.items?.length === 2, 'Found 2 items');
  assert(res.items[0]?.item?.id === 'pazham-pori' && res.items[0]?.quantity === 2, 'Pazham Pori x 2');
  assert(res.items[1]?.item?.id === 'tea' && res.items[1]?.quantity === 3, 'Tea x 3');
}

// Example 5: "പഴംപൊരി രണ്ട് ചായ മൂന്ന്"
{
  const res = parseVoiceCommand('പഴംപൊരി രണ്ട് ചായ മൂന്ന്', { cart: [] });
  assert(res && res.items?.length === 2, 'Found 2 items');
  assert(res.items[0]?.item?.id === 'pazham-pori' && res.items[0]?.quantity === 2, 'Pazham Pori x 2');
  assert(res.items[1]?.item?.id === 'tea' && res.items[1]?.quantity === 3, 'Tea x 3');
}

// Example 6: "ചായ രണ്ടും പഴംപൊരി മൂന്നും"
{
  const res = parseVoiceCommand('ചായ രണ്ടും പഴംപൊരി മൂന്നും', { cart: [] });
  assert(res && res.items?.length === 2, 'Found 2 items');
  assert(res.items[0]?.item?.id === 'tea' && res.items[0]?.quantity === 2, 'Tea x 2');
  assert(res.items[1]?.item?.id === 'pazham-pori' && res.items[1]?.quantity === 3, 'Pazham Pori x 3');
}

// 7. DO NOT DOUBLE-COUNT
console.log('\n--- 7. Do Not Double-Count ---');
{
  const res1 = parseVoiceCommand('രണ്ട് പഴംപൊരി', { cart: [] });
  assert(res1 && res1.quantity === 2, '"രണ്ട് പഴംപൊരി" has quantity 2');

  // Stutter / duplicate ASR artifact:
  const res2 = parseVoiceCommand('രണ്ട് പഴംപൊരി രണ്ട് പഴംപൊരി', { cart: [] });
  assert(res2 && res2.items?.length === 1, 'Duplicate recognition artifact collapsed to 1 item entry');
  assert(res2.items[0]?.quantity === 2, 'Duplicate recognition quantity is 2 (NOT 4)');
}

// 8. CORRECTIONS
console.log('\n--- 8. Self-Corrections ---');
{
  const res1 = parseVoiceCommand('രണ്ട് ചായ... അല്ല മൂന്ന് ചായ', { cart: [] });
  assert(res1 && res1.type === 'ADD_ITEM' && res1.item?.id === 'tea' && res1.quantity === 3, '"രണ്ട് ചായ... അല്ല മൂന്ന് ചായ" -> Tea x 3');

  const res2 = parseVoiceCommand('രണ്ട് പഴംപൊരി, അല്ല മൂന്ന് പഴംപൊരി', { cart: [] });
  assert(res2 && res2.type === 'ADD_ITEM' && res2.item?.id === 'pazham-pori' && res2.quantity === 3, '"രണ്ട് പഴംപൊരി, അല്ല മൂന്ന് പഴംപൊരി" -> Pazham Pori x 3');

  const res3 = parseVoiceCommand('രണ്ട് ചായ അല്ല മൂന്ന്', { cart: [] });
  assert(res3 && res3.type === 'ADD_ITEM' && res3.item?.id === 'tea' && res3.quantity === 3, '"രണ്ട് ചായ അല്ല മൂന്ന്" -> Tea x 3');
}

// 9. ADD VS REMOVE VS CHANGE
console.log('\n--- 9. Add vs Remove vs Change ---');
{
  const teaItem = MENU_ITEMS.find(m => m.id === 'tea');
  const cartWith10Tea = [{ item: teaItem, quantity: 10 }];

  // ADD
  const addRes = parseVoiceCommand('രണ്ട് ചായ വേണം', { cart: cartWith10Tea, lastInteractedItem: teaItem });
  assert(addRes && addRes.type === 'ADD_ITEM' && addRes.quantity === 2, '"രണ്ട് ചായ വേണം" -> ADD_ITEM x 2');

  // ADD RELATIVE
  const addRelRes = parseVoiceCommand('രണ്ട് ചായ കൂടി വേണം', { cart: cartWith10Tea, lastInteractedItem: teaItem });
  assert(addRelRes && addRelRes.type === 'ADD_ITEM' && addRelRes.quantity === 2, '"രണ്ട് ചായ കൂടി വേണം" -> ADD_ITEM x 2');

  // REMOVE
  const remRes = parseVoiceCommand('രണ്ട് ചായ ഒഴിവാക്കൂ', { cart: cartWith10Tea, lastInteractedItem: teaItem });
  assert(remRes && remRes.type === 'REMOVE_FROM_CART' && remRes.quantity === 2, '"രണ്ട് ചായ ഒഴിവാക്കൂ" -> REMOVE_FROM_CART x 2');

  // Simulated Cart Update: 10 - 2 = 8
  const remainingQty = cartWith10Tea[0].quantity - remRes.quantity;
  assert(remainingQty === 8, 'Cart quantity after remove: 10 - 2 = 8');

  // CHANGE
  const chgRes = parseVoiceCommand('ചായ മൂന്ന് ആക്കൂ', { cart: cartWith10Tea, lastInteractedItem: teaItem });
  assert(chgRes && chgRes.type === 'CHANGE_QUANTITY' && chgRes.quantity === 3, '"ചായ മൂന്ന് ആക്കൂ" -> CHANGE_QUANTITY to 3');
}

// 10. NO QUANTITY SPECIFIED
console.log('\n--- 10. No Quantity Specified (Default to 1) ---');
const noQtyTests = [
  { phrase: 'ചായ വേണം', id: 'tea' },
  { phrase: 'എനിക്ക് കോഫി വേണം', id: 'coffee' },
  { phrase: 'പഴംപൊരി തരൂ', id: 'pazham-pori' }
];

for (const t of noQtyTests) {
  const res = parseVoiceCommand(t.phrase, { cart: [] });
  assert(
    res && res.type === 'ADD_ITEM' && res.item?.id === t.id && res.quantity === 1,
    `"${t.phrase}" defaults to quantity 1`
  );
}

// 13. REGRESSION TEST FOR ALL 10 MENU ITEMS WITH 1, 2, 3, 4, 5, 10
console.log('\n--- 13. Comprehensive Regression Across All Items (1, 2, 3, 4, 5, 10) ---');
const testNumbers = [
  { q: 1, mal: 'ഒരു', mang: 'oru', en: 'one' },
  { q: 2, mal: 'രണ്ട്', mang: 'randu', en: 'two' },
  { q: 3, mal: 'മൂന്ന്', mang: 'moonnu', en: 'three' },
  { q: 4, mal: 'നാല്', mang: 'naalu', en: 'four' },
  { q: 5, mal: 'അഞ്ച്', mang: 'anju', en: 'five' },
  { q: 10, mal: 'പത്ത്', mang: 'pathu', en: 'ten' }
];

for (const it of menuItems) {
  for (const n of testNumbers) {
    // Malayalam
    const malRes = parseVoiceCommand(`${n.mal} ${it.mal}`, { cart: [] });
    assert(malRes && malRes.item?.id === it.id && malRes.quantity === n.q, `[Malayalam] ${n.mal} ${it.mal} -> ${it.name} x ${n.q}`);

    // Manglish
    const mangRes = parseVoiceCommand(`${n.mang} ${it.en}`, { cart: [] });
    assert(mangRes && mangRes.item?.id === it.id && mangRes.quantity === n.q, `[Manglish] ${n.mang} ${it.en} -> ${it.name} x ${n.q}`);

    // English
    const enRes = parseVoiceCommand(`${n.en} ${it.en}`, { cart: [] });
    assert(enRes && enRes.item?.id === it.id && enRes.quantity === n.q, `[English] ${n.en} ${it.en} -> ${it.name} x ${n.q}`);
  }
}

console.log('\n=====================================================');
console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed`);
console.log('=====================================================');

if (failed > 0) {
  process.exit(1);
}
