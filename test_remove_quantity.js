import { parseVoiceCommand, extractMultipleItems, extractQuantity } from './src/services/voiceParser.js';
import { MENU_ITEMS } from './src/data/menu.js';
import { voiceSynthesizer } from './src/services/voiceSynthesizer.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

// Helper to simulate cart subtraction logic from OrderContext
function simulateRemove(initialCart, parsed) {
  let cart = JSON.parse(JSON.stringify(initialCart));
  const itemsToRemove = (parsed.items && parsed.items.length > 0)
    ? parsed.items
    : (parsed.item ? [{ item: parsed.item, quantity: parsed.quantity || null }] : []);

  for (const { item, quantity } of itemsToRemove) {
    const existingIndex = cart.findIndex(e => e.item.id === item.id);
    if (existingIndex === -1) continue;

    const existing = cart[existingIndex];
    if (quantity === null || existing.quantity <= quantity) {
      cart.splice(existingIndex, 1);
    } else {
      existing.quantity = existing.quantity - quantity;
    }
  }
  return cart;
}

console.log('=== 1. All 10 Menu Items Subtraction Tests ===');

const menuTests = [
  // 1. Pazham pori: Cart x 10 -> "നാല് പഴംപൊരി ഒഴിവാക്കൂ" -> x 6
  {
    itemId: 'pazham-pori',
    startQty: 10,
    command: 'നാല് പഴംപൊരി ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 4
  },
  {
    itemId: 'pazham-pori',
    startQty: 10,
    command: 'രണ്ട് പഴംപൊരി ഒഴിവാക്കൂ',
    expectedQty: 8,
    expectedRemoved: 2
  },
  {
    itemId: 'pazham-pori',
    startQty: 10,
    command: 'ഒരു പഴംപൊരി ഒഴിവാക്കൂ',
    expectedQty: 9,
    expectedRemoved: 1
  },

  // 2. Ulli vada: Cart x 10 -> "മൂന്ന് ഉള്ളിവട ഒഴിവാക്കൂ" -> x 7, Cart x 8 -> "രണ്ട് ഉള്ളിവട മാറ്റൂ" -> x 6
  {
    itemId: 'ulli-vada',
    startQty: 10,
    command: 'മൂന്ന് ഉള്ളിവട ഒഴിവാക്കൂ',
    expectedQty: 7,
    expectedRemoved: 3
  },
  {
    itemId: 'ulli-vada',
    startQty: 8,
    command: 'രണ്ട് ഉള്ളിവട മാറ്റൂ',
    expectedQty: 6,
    expectedRemoved: 2
  },

  // 3. Parippu vada: Cart x 10 -> "നാല് പരിപ്പുവട ഒഴിവാക്കൂ" -> x 6, Cart x 5 -> "രണ്ട് പരിപ്പുവട വേണ്ട" -> x 3
  {
    itemId: 'parippu-vada',
    startQty: 10,
    command: 'നാല് പരിപ്പുവട ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 4
  },
  {
    itemId: 'parippu-vada',
    startQty: 5,
    command: 'രണ്ട് പരിപ്പുവട വേണ്ട',
    expectedQty: 3,
    expectedRemoved: 2
  },

  // 4. Medhu vada: Cart x 10 -> "മൂന്ന് ഉഴുന്നുവട ഒഴിവാക്കൂ" -> x 7, Cart x 6 -> "രണ്ട് ഉഴുന്നുവട മാറ്റൂ" -> x 4
  {
    itemId: 'medhu-vada',
    startQty: 10,
    command: 'മൂന്ന് ഉഴുന്നുവട ഒഴിവാക്കൂ',
    expectedQty: 7,
    expectedRemoved: 3
  },
  {
    itemId: 'medhu-vada',
    startQty: 6,
    command: 'രണ്ട് ഉഴുന്നുവട മാറ്റൂ',
    expectedQty: 4,
    expectedRemoved: 2
  },

  // 5. Mulaku bajji: Cart x 10 -> "നാല് മുളക് ബജ്ജി ഒഴിവാക്കൂ" -> x 6, Cart x 7 -> "രണ്ട് മുളക് ബജ്ജി വേണ്ട" -> x 5
  {
    itemId: 'mulaku-bajji',
    startQty: 10,
    command: 'നാല് മുളക് ബജ്ജി ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 4
  },
  {
    itemId: 'mulaku-bajji',
    startQty: 7,
    command: 'രണ്ട് മുളക് ബജ്ജി വേണ്ട',
    expectedQty: 5,
    expectedRemoved: 2
  },

  // 6. Mutta bajji: Cart x 10 -> "നാല് മുട്ട ബജ്ജി ഒഴിവാക്കൂ" -> x 6, Cart x 5 -> "രണ്ട് മുട്ട ബജ്ജി മാറ്റൂ" -> x 3
  {
    itemId: 'egg-bajji',
    startQty: 10,
    command: 'നാല് മുട്ട ബജ്ജി ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 4
  },
  {
    itemId: 'egg-bajji',
    startQty: 5,
    command: 'രണ്ട് മുട്ട ബജ്ജി മാറ്റൂ',
    expectedQty: 3,
    expectedRemoved: 2
  },

  // 7. Chicken cutlet: Cart x 10 -> "മൂന്ന് ചിക്കൻ കട്ട്ലറ്റ് ഒഴിവാക്കൂ" -> x 7, Cart x 6 -> "രണ്ട് ചിക്കൻ കട്ട്ലറ്റ് വേണ്ട" -> x 4
  {
    itemId: 'chicken-cutlet',
    startQty: 10,
    command: 'മൂന്ന് ചിക്കൻ കട്ട്ലറ്റ് ഒഴിവാക്കൂ',
    expectedQty: 7,
    expectedRemoved: 3
  },
  {
    itemId: 'chicken-cutlet',
    startQty: 6,
    command: 'രണ്ട് ചിക്കൻ കട്ട്ലറ്റ് വേണ്ട',
    expectedQty: 4,
    expectedRemoved: 2
  },

  // 8. Tea: Cart x 10 -> "നാല് ചായ ഒഴിവാക്കൂ" -> x 6, Cart x 8 -> "രണ്ട് കപ്പ് ചായ ഒഴിവാക്കൂ" -> x 6, Cart x 5 -> "ഒരു ചായ മാറ്റൂ" -> x 4
  {
    itemId: 'tea',
    startQty: 10,
    command: 'നാല് ചായ ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 4
  },
  {
    itemId: 'tea',
    startQty: 8,
    command: 'രണ്ട് കപ്പ് ചായ ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 2
  },
  {
    itemId: 'tea',
    startQty: 5,
    command: 'ഒരു ചായ മാറ്റൂ',
    expectedQty: 4,
    expectedRemoved: 1
  },

  // 9. Coffee: Cart x 10 -> "നാല് കോഫി ഒഴിവാക്കൂ" -> x 6, Cart x 8 -> "രണ്ട് കപ്പ് കാപ്പി ഒഴിവാക്കൂ" -> x 6, Cart x 5 -> "ഒരു കാപ്പി വേണ്ട" -> x 4
  {
    itemId: 'coffee',
    startQty: 10,
    command: 'നാല് കോഫി ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 4
  },
  {
    itemId: 'coffee',
    startQty: 8,
    command: 'രണ്ട് കപ്പ് കാപ്പി ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 2
  },
  {
    itemId: 'coffee',
    startQty: 5,
    command: 'ഒരു കാപ്പി വേണ്ട',
    expectedQty: 4,
    expectedRemoved: 1
  },

  // 10. Paal kappa: Cart x 10 -> "നാല് കപ്പ മീൻ കറി ഒഴിവാക്കൂ" -> x 6, Cart x 5 -> "രണ്ട് പ്ലേറ്റ് കപ്പ മീൻ കറി മാറ്റൂ" -> x 3
  {
    itemId: 'paal-kappa',
    startQty: 10,
    command: 'നാല് കപ്പ മീൻ കറി ഒഴിവാക്കൂ',
    expectedQty: 6,
    expectedRemoved: 4
  },
  {
    itemId: 'paal-kappa',
    startQty: 5,
    command: 'രണ്ട് പ്ലേറ്റ് കപ്പ മീൻ കറി മാറ്റൂ',
    expectedQty: 3,
    expectedRemoved: 2
  }
];

for (const tc of menuTests) {
  const item = MENU_ITEMS.find(m => m.id === tc.itemId);
  const initialCart = [{ item, quantity: tc.startQty }];
  const parsed = parseVoiceCommand(tc.command, { cart: initialCart });

  assert(parsed && parsed.type === 'REMOVE_FROM_CART', `"${tc.command}" recognized as REMOVE_FROM_CART`);
  const removedQty = parsed.quantity;
  assert(removedQty === tc.expectedRemoved, `"${tc.command}" parsed quantity to remove: ${removedQty} (expected ${tc.expectedRemoved})`);

  const updatedCart = simulateRemove(initialCart, parsed);
  const remaining = updatedCart.find(e => e.item.id === tc.itemId)?.quantity;
  assert(remaining === tc.expectedQty, `Cart updated: ${tc.startQty} - ${tc.expectedRemoved} = ${remaining} (expected ${tc.expectedQty})`);
}

console.log('\n=== 2. Remove vs Change Quantity Distinction ===');
// "പഴംപൊരി നാല് എണ്ണം ഒഴിവാക്കൂ" -> 10 - 4 = 6 (REMOVE)
{
  const item = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const initialCart = [{ item, quantity: 10 }];
  const parsed = parseVoiceCommand('പഴംപൊരി നാല് എണ്ണം ഒഴിവാക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'REMOVE_FROM_CART', '"പഴംപൊരി നാല് എണ്ണം ഒഴിവാക്കൂ" -> REMOVE_FROM_CART');
  assert(parsed.quantity === 4, 'Parsed remove quantity = 4');
  const updated = simulateRemove(initialCart, parsed);
  assert(updated[0]?.quantity === 6, 'Cart quantity is 6 (10 - 4 = 6)');
}

// "പഴംപൊരി നാല് ആക്കൂ" -> 4 (SET)
{
  const item = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const initialCart = [{ item, quantity: 10 }];
  const parsed = parseVoiceCommand('പഴംപൊരി നാല് ആക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'CHANGE_QUANTITY', '"പഴംപൊരി നാല് ആക്കൂ" -> CHANGE_QUANTITY');
  assert(parsed.quantity === 4, 'Target set quantity = 4');
}

// "പഴംപൊരി നാല് ആക്കി മാറ്റൂ" -> 4 (SET)
{
  const item = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const initialCart = [{ item, quantity: 10 }];
  const parsed = parseVoiceCommand('പഴംപൊരി നാല് ആക്കി മാറ്റൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'CHANGE_QUANTITY', '"പഴംപൊരി നാല് ആക്കി മാറ്റൂ" -> CHANGE_QUANTITY');
  assert(parsed.quantity === 4, 'Target set quantity = 4');
}

// "പഴംപൊരി എണ്ണം നാല് ആക്കൂ" -> 4 (SET)
{
  const item = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const initialCart = [{ item, quantity: 10 }];
  const parsed = parseVoiceCommand('പഴംപൊരി എണ്ണം നാല് ആക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'CHANGE_QUANTITY', '"പഴംപൊരി എണ്ണം നാല് ആക്കൂ" -> CHANGE_QUANTITY');
  assert(parsed.quantity === 4, 'Target set quantity = 4');
}

console.log('\n=== 3. Multiple Items in Single Command ===');
// Cart: Pazham pori x 10, Mutta bajji x 8, Tea x 5
// Command: "നാല് പഴംപൊരിയും രണ്ട് മുട്ട ബജ്ജിയും ഒരു ചായയും ഒഴിവാക്കൂ"
// Expected: Pazham pori x 6, Mutta bajji x 6, Tea x 4
{
  const pazhamPori = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const muttaBajji = MENU_ITEMS.find(m => m.id === 'egg-bajji');
  const tea = MENU_ITEMS.find(m => m.id === 'tea');

  const initialCart = [
    { item: pazhamPori, quantity: 10 },
    { item: muttaBajji, quantity: 8 },
    { item: tea, quantity: 5 }
  ];

  const parsed = parseVoiceCommand('നാല് പഴംപൊരിയും രണ്ട് മുട്ട ബജ്ജിയും ഒരു ചായയും ഒഴിവാക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'REMOVE_FROM_CART', 'Multi-item parsed as REMOVE_FROM_CART');
  assert(parsed.items && parsed.items.length === 3, `Extracted 3 items (found ${parsed.items?.length})`);

  const updated = simulateRemove(initialCart, parsed);
  const remPazham = updated.find(e => e.item.id === 'pazham-pori')?.quantity;
  const remEgg = updated.find(e => e.item.id === 'egg-bajji')?.quantity;
  const remTea = updated.find(e => e.item.id === 'tea')?.quantity;

  assert(remPazham === 6, `Pazham pori 10 - 4 = ${remPazham} (expected 6)`);
  assert(remEgg === 6, `Mutta bajji 8 - 2 = ${remEgg} (expected 6)`);
  assert(remTea === 4, `Tea 5 - 1 = ${remTea} (expected 4)`);
}

console.log('\n=== 4. Removing Entire Item When Quantity Omitted ===');
// "ചായ ഒഴിവാക്കൂ" -> Remove Tea completely
{
  const tea = MENU_ITEMS.find(m => m.id === 'tea');
  const initialCart = [{ item: tea, quantity: 5 }];
  const parsed = parseVoiceCommand('ചായ ഒഴിവാക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'REMOVE_FROM_CART', '"ചായ ഒഴിവാക്കൂ" -> REMOVE_FROM_CART');
  assert(parsed.quantity === null, 'Quantity is null (meaning full remove)');
  const updated = simulateRemove(initialCart, parsed);
  assert(updated.length === 0, 'Tea completely removed from cart');
}

// "കോഫി വേണ്ട" -> Remove Coffee completely
{
  const coffee = MENU_ITEMS.find(m => m.id === 'coffee');
  const initialCart = [{ item: coffee, quantity: 5 }];
  const parsed = parseVoiceCommand('കോഫി വേണ്ട', { cart: initialCart });
  assert(parsed && parsed.type === 'REMOVE_FROM_CART', '"കോഫി വേണ്ട" -> REMOVE_FROM_CART');
  assert(parsed.quantity === null, 'Quantity is null (meaning full remove)');
  const updated = simulateRemove(initialCart, parsed);
  assert(updated.length === 0, 'Coffee completely removed from cart');
}

console.log('\n=== 5. Excess Quantity Clamped (No Negative Quantity) ===');
// Cart: Pazham pori x 3
// Command: "അഞ്ച് പഴംപൊരി ഒഴിവാക്കൂ"
// Expected: Item removed, quantity becomes 0
{
  const item = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const initialCart = [{ item, quantity: 3 }];
  const parsed = parseVoiceCommand('അഞ്ച് പഴംപൊരി ഒഴിവാക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'REMOVE_FROM_CART', 'Command is REMOVE_FROM_CART');
  assert(parsed.quantity === 5, 'Remove quantity is 5');
  const updated = simulateRemove(initialCart, parsed);
  assert(updated.length === 0, 'Pazham pori removed from cart, never negative');
}

console.log('\n=== 6. Conversational Natural Malayalam Commands ===');
// "10 പഴംപൊരി ഉണ്ട്, അതിൽ നിന്ന് 4 എണ്ണം ഒഴിവാക്കൂ"
// Result: 10 -> 4 removed -> 6 remaining
{
  const item = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const initialCart = [{ item, quantity: 10 }];
  const parsed = parseVoiceCommand('10 പഴംപൊരി ഉണ്ട്, അതിൽ നിന്ന് 4 എണ്ണം ഒഴിവാക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'REMOVE_FROM_CART', 'Conversational command recognized as REMOVE_FROM_CART');
  assert(parsed.quantity === 4, `Quantity to remove is 4 (not 10!), got ${parsed.quantity}`);
  const updated = simulateRemove(initialCart, parsed);
  assert(updated[0]?.quantity === 6, `Cart remaining is 6 (10 - 4 = ${updated[0]?.quantity})`);
}

console.log('\n=== 7. Ambiguous Quantity Clarification ===');
// "കുറച്ച് പഴംപൊരി ഒഴിവാക്കൂ" -> Clarification needed
{
  const item = MENU_ITEMS.find(m => m.id === 'pazham-pori');
  const initialCart = [{ item, quantity: 10 }];
  const parsed = parseVoiceCommand('കുറച്ച് പഴംപൊരി ഒഴിവാക്കൂ', { cart: initialCart });
  assert(parsed && parsed.type === 'CLARIFICATION_NEEDED', 'Ambiguous command triggers CLARIFICATION_NEEDED');
  assert(parsed.unclearRemoveQuantity === true, 'Flagged unclearRemoveQuantity: true');
}

console.log('\n========================================');
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log('========================================');
if (failed > 0) process.exit(1);
