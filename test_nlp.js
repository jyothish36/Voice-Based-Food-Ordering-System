import { parseVoiceCommand, matchMenuItem, extractQuantity, normalizeText, extractMultipleItems } from './src/services/voiceParser.js';

const testCases = [
  // --- USER SPECIFIED TEST SCENARIOS ---
  {
    text: 'Give me two pazham pori.',
    expectedType: 'ADD_ITEM',
    expectedId: 'pazham-pori',
    expectedQty: 2
  },
  {
    text: 'I want one tea and one coffee.',
    expectedType: 'ADD_ITEM',
    expectedMulti: [
      { id: 'tea', qty: 1 },
      { id: 'coffee', qty: 1 }
    ]
  },
  {
    text: 'Add three ulli vada.',
    expectedType: 'ADD_ITEM',
    expectedId: 'ulli-vada',
    expectedQty: 3
  },
  {
    text: 'Remove the tea.',
    expectedType: 'REMOVE_ITEM',
    expectedId: 'tea'
  },
  {
    text: 'Make that two coffees.',
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'coffee',
    expectedQty: 2
  },
  {
    text: "What's my total?",
    expectedType: 'CHECK_TOTAL'
  },
  {
    text: 'Show me drinks.',
    expectedType: 'SHOW_CATEGORY',
    expectedCat: 'drinks'
  },
  {
    text: "That's all.",
    expectedType: 'CHECKOUT'
  },
  {
    text: 'Yes, place the order.',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'No, I want to change something.',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },

  // --- MALAYALAM VOICE COMMAND REQUIREMENTS ---
  // 1. REMOVE ITEM — Malayalam
  {
    text: 'കോഫി ഒഴിവാക്കൂ',
    expectedType: 'REMOVE_FROM_CART',
    expectedId: 'coffee'
  },
  {
    text: 'കോഫി നീക്കം ചെയ്യൂ',
    expectedType: 'REMOVE_FROM_CART',
    expectedId: 'coffee'
  },
  {
    text: 'കോഫി വേണ്ട',
    expectedType: 'REMOVE_FROM_CART',
    expectedId: 'coffee'
  },
  {
    text: 'ചായ ഒഴിവാക്കൂ',
    expectedType: 'REMOVE_FROM_CART',
    expectedId: 'tea'
  },
  {
    text: 'രണ്ട് പഴംപൊരി ഒഴിവാക്കൂ',
    expectedType: 'REMOVE_FROM_CART',
    expectedId: 'pazham-pori',
    expectedQty: 2
  },

  // 2. CHANGE QUANTITY — Malayalam
  {
    text: 'ചായ രണ്ടാക്കി മാറ്റൂ',
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'tea',
    expectedQty: 2
  },
  {
    text: 'ചായ മൂന്ന് വേണം',
    cart: [{ item: { id: 'tea', shortName: 'Tea', price: 10 }, quantity: 1 }],
    expectedType: 'ADD_ITEM',
    expectedId: 'tea',
    expectedQty: 3
  },
  {
    text: 'ചായ മൂന്ന് ആക്കൂ',
    cart: [{ item: { id: 'tea', shortName: 'Tea', price: 10 }, quantity: 1 }],
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'tea',
    expectedQty: 3
  },
  {
    text: 'പഴംപൊരി രണ്ടിൽ നിന്ന് മൂന്നാക്കൂ',
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'pazham-pori',
    expectedQty: 3
  },
  {
    text: 'കോഫി രണ്ട് ആക്കൂ',
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'coffee',
    expectedQty: 2
  },
  {
    text: 'ചായയുടെ എണ്ണം രണ്ട് ആക്കൂ',
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'tea',
    expectedQty: 2
  },

  // 3. ORDER CONFIRMATION — Malayalam
  {
    text: 'അതെ',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ശരി',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓർഡർ ചെയ്യാം',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓർഡർ ചെയ്യൂ',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓർഡർ സ്ഥിരീകരിക്കൂ',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓർഡർ കൺഫേം ചെയ്യൂ',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓർഡർ കൺഫേം ചെയ്യാം',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓർഡർ ഉറപ്പാക്കൂ',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓർഡർ ഉറപ്പിക്കൂ',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'അതെ, ഓർഡർ ചെയ്യാം',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'അതെ ഓർഡർ ചെയ്യൂ',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'അതെ, ഓർഡർ സ്ഥിരീകരിക്കൂ',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ശരി ഓർഡർ ചെയ്യൂ',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ശരി, ഓർഡർ ചെയ്യാം',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'എന്റെ ഓർഡർ കൺഫേം ചെയ്യൂ',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'എന്റെ ഓർഡർ സ്ഥിരീകരിക്കൂ',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'എന്റെ ഓർഡർ ഉറപ്പാക്കൂ',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'അതെ, ഉറപ്പാണ്',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'അതെ, ശരിയാണ്',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ശരി, ഉറപ്പാക്കാം',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'athe',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'shari',
    screen: 'review',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'order confirm cheyyu',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'order urappakku',
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'yes, confirm my order',
    expectedType: 'CONFIRM_ORDER'
  },

  // 4. NEGATIVE CONFIRMATION RESPONSES (MUST NOT confirm)
  {
    text: 'ഇല്ല',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'വേണ്ട',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'ഓർഡർ വേണ്ട',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'ഓർഡർ ചെയ്യണ്ട',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'നിർത്തൂ',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'മാറ്റണം',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'വേണ്ട, മാറ്റണം',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'എനിക്ക് മാറ്റണം',
    screen: 'review',
    expectedType: 'CANCEL_ORDER'
  },

  // 5. CONTEXT-BASED REPLIES (from AI question "നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?")
  {
    text: 'അതെ',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ആകെ തുക ₹30 ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ശരി',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'വേണം',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ചെയ്യാം',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓക്കെ',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഓക്കേ',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'അതെ ചെയ്യൂ',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CONFIRM_ORDER'
  },
  {
    text: 'ഇല്ല',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ആകെ തുക ₹30 ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CANCEL_ORDER'
  },
  {
    text: 'വേണ്ട, മാറ്റണം',
    lastPromptContext: { type: 'ORDER_CONFIRMATION', text: 'നിങ്ങളുടെ ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?' },
    expectedType: 'CANCEL_ORDER'
  },

  // --- NATURAL PHRASES WITH FILLERS & COMPOUND ITEMS ---
  {
    text: 'I would like two pazham pori please',
    expectedType: 'ADD_ITEM',
    expectedId: 'pazham-pori',
    expectedQty: 2
  },
  {
    text: 'Can I get one tea?',
    expectedType: 'ADD_ITEM',
    expectedId: 'tea',
    expectedQty: 1
  },
  {
    text: 'Please give me three ulli vada',
    expectedType: 'ADD_ITEM',
    expectedId: 'ulli-vada',
    expectedQty: 3
  },
  {
    text: 'I want a coffee and two pazham pori',
    expectedType: 'ADD_ITEM',
    expectedMulti: [
      { id: 'coffee', qty: 1 },
      { id: 'pazham-pori', qty: 2 }
    ]
  },
  {
    text: 'Can you give me two pazham pori and one tea please',
    expectedType: 'ADD_ITEM',
    expectedMulti: [
      { id: 'pazham-pori', qty: 2 },
      { id: 'tea', qty: 1 }
    ]
  },

  // --- 1. PAZHAM PORI ALIASES & VARIATIONS ---
  { text: 'pazham pori', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },
  { text: 'pazham puri', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },
  { text: 'banana fritter', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },
  { text: 'banana fritters', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },
  { text: 'pazham pori banana', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },
  { text: 'banana pori', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },
  { text: 'ethakka appam', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },
  { text: 'പഴം പൊരി', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori' },

  // --- 2. ULLI VADA ALIASES & VARIATIONS ---
  { text: 'ulli vada', expectedType: 'ADD_ITEM', expectedId: 'ulli-vada' },
  { text: 'ulli wada', expectedType: 'ADD_ITEM', expectedId: 'ulli-vada' },
  { text: 'onion vada', expectedType: 'ADD_ITEM', expectedId: 'ulli-vada' },
  { text: 'onion fritter', expectedType: 'ADD_ITEM', expectedId: 'ulli-vada' },
  { text: 'onion fritters', expectedType: 'ADD_ITEM', expectedId: 'ulli-vada' },
  { text: 'ulli bada', expectedType: 'ADD_ITEM', expectedId: 'ulli-vada' },
  { text: 'ഉള്ളി വട', expectedType: 'ADD_ITEM', expectedId: 'ulli-vada' },

  // --- 3. PARIPPU VADA ALIASES & VARIATIONS ---
  { text: 'parippu vada', expectedType: 'ADD_ITEM', expectedId: 'parippu-vada' },
  { text: 'parippu wada', expectedType: 'ADD_ITEM', expectedId: 'parippu-vada' },
  { text: 'dal vada', expectedType: 'ADD_ITEM', expectedId: 'parippu-vada' },
  { text: 'paripp vada', expectedType: 'ADD_ITEM', expectedId: 'parippu-vada' },
  { text: 'dal wada', expectedType: 'ADD_ITEM', expectedId: 'parippu-vada' },
  { text: 'dal fritter', expectedType: 'ADD_ITEM', expectedId: 'parippu-vada' },
  { text: 'പരിപ്പ് വട', expectedType: 'ADD_ITEM', expectedId: 'parippu-vada' },

  // --- 4. MEDHU VADA ALIASES & VARIATIONS ---
  { text: 'medhu vada', expectedType: 'ADD_ITEM', expectedId: 'medhu-vada' },
  { text: 'medu vada', expectedType: 'ADD_ITEM', expectedId: 'medhu-vada' },
  { text: 'uzhunnu vada', expectedType: 'ADD_ITEM', expectedId: 'medhu-vada' },
  { text: 'medhu wada', expectedType: 'ADD_ITEM', expectedId: 'medhu-vada' },
  { text: 'medu wada', expectedType: 'ADD_ITEM', expectedId: 'medhu-vada' },
  { text: 'uzunnu vada', expectedType: 'ADD_ITEM', expectedId: 'medhu-vada' },
  { text: 'ഉഴുന്ന് വട', expectedType: 'ADD_ITEM', expectedId: 'medhu-vada' },

  // --- 5. MULAKU BAJJI ALIASES & VARIATIONS ---
  { text: 'mulaku bajji', expectedType: 'ADD_ITEM', expectedId: 'mulaku-bajji' },
  { text: 'mulaku bhaji', expectedType: 'ADD_ITEM', expectedId: 'mulaku-bajji' },
  { text: 'chili bajji', expectedType: 'ADD_ITEM', expectedId: 'mulaku-bajji' },
  { text: 'chilli bajji', expectedType: 'ADD_ITEM', expectedId: 'mulaku-bajji' },
  { text: 'chili fritter', expectedType: 'ADD_ITEM', expectedId: 'mulaku-bajji' },
  { text: 'chilli fritters', expectedType: 'ADD_ITEM', expectedId: 'mulaku-bajji' },
  { text: 'മുളക് ബജ്ജി', expectedType: 'ADD_ITEM', expectedId: 'mulaku-bajji' },

  // --- 6. EGG BAJJI ALIASES & VARIATIONS ---
  { text: 'egg bajji', expectedType: 'ADD_ITEM', expectedId: 'egg-bajji' },
  { text: 'egg bhaji', expectedType: 'ADD_ITEM', expectedId: 'egg-bajji' },
  { text: 'egg fritter', expectedType: 'ADD_ITEM', expectedId: 'egg-bajji' },
  { text: 'mutta bajji', expectedType: 'ADD_ITEM', expectedId: 'egg-bajji' },
  { text: 'egg pakora', expectedType: 'ADD_ITEM', expectedId: 'egg-bajji' },
  { text: 'മുട്ട ബജ്ജി', expectedType: 'ADD_ITEM', expectedId: 'egg-bajji' },

  // --- 7. CHICKEN CUTLET ALIASES & VARIATIONS ---
  { text: 'chicken cutlet', expectedType: 'ADD_ITEM', expectedId: 'chicken-cutlet' },
  { text: 'chicken cutlets', expectedType: 'ADD_ITEM', expectedId: 'chicken-cutlet' },
  { text: 'chikan cutlet', expectedType: 'ADD_ITEM', expectedId: 'chicken-cutlet' },
  { text: 'chicken piece', expectedType: 'ADD_ITEM', expectedId: 'chicken-cutlet' },
  { text: 'ചിക്കൻ കട്ട്ലറ്റ്', expectedType: 'ADD_ITEM', expectedId: 'chicken-cutlet' },

  // --- 8. TEA ALIASES & VARIATIONS ---
  { text: 'tea', expectedType: 'ADD_ITEM', expectedId: 'tea' },
  { text: 'chai', expectedType: 'ADD_ITEM', expectedId: 'tea' },
  { text: 'chaya', expectedType: 'ADD_ITEM', expectedId: 'tea' },
  { text: 'chaaya', expectedType: 'ADD_ITEM', expectedId: 'tea' },
  { text: 'meter tea', expectedType: 'ADD_ITEM', expectedId: 'tea' },
  { text: 'ഒരു ചായ', expectedType: 'ADD_ITEM', expectedId: 'tea', expectedQty: 1 },
  { text: 'ചായ', expectedType: 'ADD_ITEM', expectedId: 'tea' },

  // --- 9. COFFEE ALIASES & VARIATIONS ---
  { text: 'coffee', expectedType: 'ADD_ITEM', expectedId: 'coffee' },
  { text: 'kaapi', expectedType: 'ADD_ITEM', expectedId: 'coffee' },
  { text: 'kapi', expectedType: 'ADD_ITEM', expectedId: 'coffee' },
  { text: 'filter coffee', expectedType: 'ADD_ITEM', expectedId: 'coffee' },
  { text: 'കാപ്പി', expectedType: 'ADD_ITEM', expectedId: 'coffee' },

  // --- 10. PAAL KAPPA & FISH CURRY ALIASES & VARIATIONS ---
  { text: 'paal kappa', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'kappa fish curry', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'kappa and fish curry', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'tapioca fish curry', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'kappa curry', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'paal kappa fish curry', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'tapioca and fish curry', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'കപ്പ മീൻ കറി', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'കപ്പ', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },
  { text: 'മീൻ കറി', expectedType: 'ADD_ITEM', expectedId: 'paal-kappa' },

  // --- INTENT: REMOVE_ITEM ---
  { text: 'Can you remove the tea?', expectedType: 'REMOVE_ITEM', expectedId: 'tea' },
  { text: 'Delete two coffees', expectedType: 'REMOVE_ITEM', expectedId: 'coffee', expectedQty: 2 },
  { text: 'Cancel the pazham pori', expectedType: 'REMOVE_ITEM', expectedId: 'pazham-pori' },

  // --- INTENT: CHANGE_QUANTITY ---
  { text: 'Change tea to three', expectedType: 'CHANGE_QUANTITY', expectedId: 'tea', expectedQty: 3 },
  { text: 'Make that four ulli vada', expectedType: 'CHANGE_QUANTITY', expectedId: 'ulli-vada', expectedQty: 4 },
  { text: 'Set coffee quantity to two', expectedType: 'CHANGE_QUANTITY', expectedId: 'coffee', expectedQty: 2 },

  // --- INTENT: SHOW_CATEGORY ---
  { text: 'Show drinks', expectedType: 'SHOW_CATEGORY', expectedCat: 'drinks' },
  { text: 'Show snacks.', expectedType: 'SHOW_CATEGORY', expectedCat: 'snacks' },
  { text: 'Show meals.', expectedType: 'SHOW_CATEGORY', expectedCat: 'meals' },
  { text: 'Go to drinks', expectedType: 'SHOW_CATEGORY', expectedCat: 'drinks' },

  // --- INTENT: SHOW_CART ---
  { text: "What's in my cart?", expectedType: 'SHOW_CART' },
  { text: 'Show my cart', expectedType: 'SHOW_CART' },
  { text: 'What did I order?', expectedType: 'SHOW_CART' },

  // --- INTENT: CHECK_TOTAL ---
  { text: 'How much is my order?', expectedType: 'CHECK_TOTAL' },
  { text: 'How much is the total?', expectedType: 'CHECK_TOTAL' },
  { text: 'What is my bill?', expectedType: 'CHECK_TOTAL' },

  // --- INTENT: CHECKOUT ---
  { text: "That's everything.", expectedType: 'CHECKOUT' },
  { text: "I'm done.", expectedType: 'CHECKOUT' },
  { text: 'Checkout.', expectedType: 'CHECKOUT' },

  // --- INTENT: CONFIRM_ORDER & CANCEL_ORDER ---
  { text: 'Confirm', screen: 'review', expectedType: 'CONFIRM_ORDER' },
  { text: 'Yes', screen: 'review', expectedType: 'CONFIRM_ORDER' },
  { text: 'Cancel the order', expectedType: 'CANCEL_ORDER' },
  { text: 'Clear my cart', expectedType: 'CANCEL_ORDER' },

  // --- INTENT: START_NEW_ORDER ---
  { text: 'Start a new order', expectedType: 'START_NEW_ORDER' },
  { text: 'Start over', expectedType: 'START_NEW_ORDER' },
  { text: 'Order again', expectedType: 'START_NEW_ORDER' },

  // --- RELATIVE QUANTITIES ---
  { text: 'one more tea', expectedType: 'ADD_ITEM', expectedId: 'tea', expectedQty: 1, expectedRel: true },
  { text: 'another one pazham pori', expectedType: 'ADD_ITEM', expectedId: 'pazham-pori', expectedQty: 1, expectedRel: true },
  { text: 'two more coffee', expectedType: 'ADD_ITEM', expectedId: 'coffee', expectedQty: 2, expectedRel: true },

  // --- CLARIFICATION / DISAMBIGUATION ---
  { text: 'Give me one vada', expectedType: 'CLARIFICATION_NEEDED' },
  { text: 'Give me a bajji', expectedType: 'CLARIFICATION_NEEDED' },

  // --- OUT-OF-SCOPE QUESTIONS & UNRELATED SPEECH ---
  { text: 'laptop computer', expectedType: 'OUT_OF_SCOPE' },
  { text: 'what is the weather today', expectedType: 'OUT_OF_SCOPE' },
  { text: 'where is the bathroom', expectedType: 'OUT_OF_SCOPE' },
  { text: 'What is the capital of India?', expectedType: 'OUT_OF_SCOPE' },
  { text: 'Tell me a joke.', expectedType: 'OUT_OF_SCOPE' },
  { text: "What's the weather today?", expectedType: 'OUT_OF_SCOPE' },
  { text: 'Who is Elon Musk?', expectedType: 'OUT_OF_SCOPE' },
  { text: 'Help me with my homework.', expectedType: 'OUT_OF_SCOPE' },

  // --- FOOD-RELATED QUESTIONS ---
  { text: 'What items do you have?', expectedType: 'MENU_INQUIRY' },
  { text: 'How much is tea?', expectedType: 'PRICE_INQUIRY', expectedId: 'tea' },
  { text: 'How many snacks are in my order?', expectedType: 'QUANTITY_INQUIRY', expectedCat: 'snacks' },
  { text: 'Can I remove the coffee?', expectedType: 'REMOVE_ITEM', expectedId: 'coffee' },
  { text: 'Show me the drinks.', expectedType: 'SHOW_CATEGORY', expectedCat: 'drinks' },

  // --- MENU CATEGORY NAVIGATION (DRINKS & SNACKS) ---
  { text: 'Show drinks', expectedType: 'SHOW_CATEGORY', expectedCat: 'drinks' },
  { text: 'Show me drinks', expectedType: 'SHOW_CATEGORY', expectedCat: 'drinks' },
  { text: 'I want drinks', expectedType: 'SHOW_CATEGORY', expectedCat: 'drinks' },
  { text: 'Open drinks', expectedType: 'SHOW_CATEGORY', expectedCat: 'drinks' },
  { text: 'Show snacks', expectedType: 'SHOW_CATEGORY', expectedCat: 'snacks' },
  { text: 'Show me snacks', expectedType: 'SHOW_CATEGORY', expectedCat: 'snacks' },
  { text: 'I want snacks', expectedType: 'SHOW_CATEGORY', expectedCat: 'snacks' },
  { text: 'Open snacks', expectedType: 'SHOW_CATEGORY', expectedCat: 'snacks' },

  // --- SECTION 9 SPECIFIED 16 MANDATORY TEST PHRASES ---
  {
    text: 'I want two pazham pori and one tea',
    expectedType: 'ADD_ITEM',
    expectedMulti: [
      { id: 'pazham-pori', qty: 2 },
      { id: 'tea', qty: 1 }
    ]
  },
  {
    text: 'Give me three ulli vada',
    expectedType: 'ADD_ITEM',
    expectedId: 'ulli-vada',
    expectedQty: 3
  },
  {
    text: 'Enikku randu pazham pori venam',
    expectedType: 'ADD_ITEM',
    expectedId: 'pazham-pori',
    expectedQty: 2
  },
  {
    text: 'Randu chaya',
    expectedType: 'ADD_ITEM',
    expectedId: 'tea',
    expectedQty: 2
  },
  {
    text: 'Onnu coffee',
    expectedType: 'ADD_ITEM',
    expectedId: 'coffee',
    expectedQty: 1
  },
  {
    text: 'Give me one mutta bajji',
    expectedType: 'ADD_ITEM',
    expectedId: 'egg-bajji',
    expectedQty: 1
  },
  {
    text: 'How much is tea?',
    expectedType: 'PRICE_INQUIRY',
    expectedId: 'tea'
  },
  {
    text: 'What snacks do you have?',
    expectedType: 'MENU_INQUIRY',
    expectedCat: 'snacks'
  },
  {
    text: 'What do you recommend?',
    expectedType: 'RESTAURANT_INQUIRY',
    expectedTopic: 'recommendation'
  },
  {
    text: "That's all",
    expectedType: 'CHECKOUT'
  },
  {
    text: 'Remove the coffee',
    expectedType: 'REMOVE_ITEM',
    expectedId: 'coffee'
  },
  {
    text: 'Change the tea to two',
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'tea',
    expectedQty: 2
  },
  {
    text: 'Sorry, make that three',
    lastInteractedItem: { id: 'tea', shortName: 'Tea' },
    expectedType: 'CHANGE_QUANTITY',
    expectedId: 'tea',
    expectedQty: 3
  },
  {
    text: 'Show me drinks',
    expectedType: 'SHOW_CATEGORY',
    expectedCat: 'drinks'
  },
  {
    text: 'Go to snacks',
    expectedType: 'SHOW_CATEGORY',
    expectedCat: 'snacks'
  },
  {
    text: 'Review my order',
    expectedType: 'CHECKOUT'
  },
  {
    text: 'Chetta randu chaya',
    expectedType: 'ADD_ITEM',
    expectedId: 'tea',
    expectedQty: 2
  },
  {
    text: 'Chetta oru pazham pori',
    expectedType: 'ADD_ITEM',
    expectedId: 'pazham-pori',
    expectedQty: 1
  },
  {
    text: 'kappayum meenum',
    expectedType: 'ADD_ITEM',
    expectedId: 'paal-kappa',
    expectedQty: 1
  },
  {
    text: 'Give me a pair of coffees',
    expectedType: 'ADD_ITEM',
    expectedId: 'coffee',
    expectedQty: 2
  }
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const res = parseVoiceCommand(tc.text, {
    screen: tc.screen || 'menu',
    cart: tc.cart || [],
    lastInteractedItem: tc.lastInteractedItem,
    lastPromptContext: tc.lastPromptContext
  });
  let ok = res && (
    res.type === tc.expectedType ||
    (tc.expectedType === 'UNKNOWN' && res.type === 'OUT_OF_SCOPE') ||
    ((tc.expectedType === 'REMOVE_ITEM' || tc.expectedType === 'REMOVE_FROM_CART') &&
     (res.type === 'REMOVE_ITEM' || res.type === 'REMOVE_FROM_CART'))
  );

  if (tc.expectedId && (!res.item || res.item.id !== tc.expectedId)) ok = false;
  if (tc.expectedQty && res.quantity !== tc.expectedQty) ok = false;
  if (tc.expectedRel && !res.isRelative) ok = false;
  if (tc.expectedCat && res.category !== tc.expectedCat) ok = false;
  if (tc.expectedTopic && res.topic !== tc.expectedTopic) ok = false;

  if (tc.expectedMulti) {
    if (!res.items || res.items.length !== tc.expectedMulti.length) {
      ok = false;
    } else {
      for (const expectedItem of tc.expectedMulti) {
        const found = res.items.find(i => i.item.id === expectedItem.id && i.quantity === expectedItem.qty);
        if (!found) {
          ok = false;
          break;
        }
      }
    }
  }

  if (ok) {
    passed++;
    let details = '';
    if (res.items && res.items.length > 1) {
      details = res.items.map(i => `${i.item.shortName} x ${i.quantity}`).join(', ');
    } else if (res.item) {
      details = `${res.item.name} (Qty: ${res.quantity || 1})`;
    } else if (res.category) {
      details = `Category: ${res.category}`;
    }
    console.log(`✓ PASSED: "${tc.text}" -> ${res.type} ${details}`);
  } else {
    failed++;
    console.error(`✗ FAILED: "${tc.text}"`);
    console.error('  Expected:', tc);
    console.error('  Got:', res);
  }
}

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
