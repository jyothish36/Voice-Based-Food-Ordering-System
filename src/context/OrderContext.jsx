import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MENU_ITEMS, CATEGORIES } from '../data/menu';
import { parseVoiceCommand, matchMenuItem, extractQuantity, normalizeText, extractMultipleItems } from '../services/voiceParser';
import { speechRecognizer } from '../services/speechRecognizer';
import { voiceSynthesizer, getMalayalamItemName, getMalayalamNumber, formatMalayalamItemsSpeech } from '../services/voiceSynthesizer';

// Direct High-Accuracy Recognition Patterns for All 10 Menu Items
const DIRECT_MENU_PATTERNS = [
  {
    id: 'pazham-pori',
    enPattern: /\b(pazham\s*poris?|pazham\s*puris?|pazham\s*poori|pazhamporis?|pazhampuris?|pasan\s*podi|pazham\s*podi|ethakka\s*appams?|ethakkappams?|banana\s*fritters?|banana\s*pori|banana\s*puri|banana\s*fries?|banana\s*fry|ethakka\s*fry|ethakka|ripe\s*banana\s*fritters?)\b/i,
    malPattern: /(?:^|[\s\p{P}])(പഴം\s*പൊരി|പഴംപൊരി|ഏത്തയ്ക്ക\s*അപ്പം|ഏത്തക്ക\s*അപ്പം)(?:$|[\s\p{P}])/u
  },
  {
    id: 'egg-bajji',
    enPattern: /\b(egg\s*bajjis?|egg\s*bhajis?|egg\s*bajis?|egg\s*baajis?|egg\s*bhajjis?|egg\s*bujjis?|egg\s*bujis?|egg\s*badjis?|egg\s*budjis?|egg\s*baggis?|egg\s*buggis?|egg\s*badges?|egg\s*pajis?|egg\s*pajjis?|egg\s*bachis?|egg\s*bajiyas?|egg\s*bhajiyas?|egg\s*fritters?|egg\s*pakoras?|egg\s*pakodas?|egg\s*bondas?|egg\s*bhu?h?[\s-]*jees?|egg\s*bhu\s*jees?|egg\s*buh\s*jees?|egg\s*bhujees?|egg\s*bhujjis?|egg\s*bhujis?|eggbajjis?|eggbhajis?|eggbajis?|eggbaji|eggbuji|eggbujji|motta\s*bajjis?|motta\s*bhajis?|motta\s*bajis?|motta\s*baajis?|motta\s*bhajjis?|mutta\s*bajjis?|mutta\s*bhajis?|mutta\s*bajis?|mutta\s*baajis?|mutta\s*bhajjis?|mottabajjis?|mottabhajis?|muttabajjis?|muttabhajis?|anda\s*bajjis?|anda\s*bhajis?|anda\s*pakoras?|ek\s*bajjis?|ek\s*bhajis?|ek\s*bajis?|1\s*bajjis?|boiled\s*egg\s*bajjis?|boiled\s*egg|egg|eggs)\b/i,
    malPattern: /(?:^|[\s\p{P}])(മുട്ട\s*ബജ്ജി|മുട്ടബജ്ജി|മുട്ട\s*ബോണ്ട|മുട്ടബോണ്ട|മുട്ട)(?:$|[\s\p{P}])/u
  },
  {
    id: 'medhu-vada',
    enPattern: /\b(medhu\s*vadas?|medu\s*vadas?|medhu\s*wadas?|medu\s*wadas?|medhu\s*badas?|medu\s*badas?|uzhunnu\s*vadas?|uzunnu\s*vadas?|uzhunnu\s*wadas?|uzunnu\s*wadas?|uzhunnu\s*badas?|uzunnu\s*badas?|urad\s*vadas?|urad\s*wadas?|urad\s*dal\s*vadas?|urad\s*fritters?|meduvadas?|medhuvadas?|uzhunnuvadas?|uzunnuvadas?|ulundu\s*vadais?|ulunthu\s*vadais?|ulundu\s*vadas?|ulunthuvadas?|uzhunnu|uzunnu|medu)\b/i,
    malPattern: /(?:^|[\s\p{P}])(ഉഴുന്ന്\s*വട|ഉഴുന്നുവട|ഉഴുന്ന്|മേദു\s*വട)(?:$|[\s\p{P}])/u
  },
  {
    id: 'ulli-vada',
    enPattern: /\b(ulli\s*vadas?|ulli\s*wadas?|ulli\s*badas?|ullivadas?|ulliwadas?|ullibadas?|onion\s*vadas?|onion\s*wadas?|onion\s*badas?|onion\s*fritters?|onion\s*pakoras?|onion\s*pakodas?|onion\s*bhajjis?|onion\s*bajjis?|oli\s*vadas?|uli\s*vadas?|only\s*vadas?|holy\s*vadas?|oily\s*vadas?|ulli)\b/i,
    malPattern: /(?:^|[\s\p{P}])(ഉള്ളി\s*വട|ഉള്ളിവട|ഉള്ളി)(?:$|[\s\p{P}])/u
  },
  {
    id: 'parippu-vada',
    enPattern: /\b(parippu\s*vadas?|parippu\s*wadas?|paripp\s*vadas?|paripp\s*wadas?|parippu\s*badas?|parippuvadas?|parippuwadas?|paripu\s*vadas?|paripu\s*wadas?|paripuvadas?|parip\s*vadas?|dal\s*vadas?|dal\s*wadas?|dal\s*badas?|daal\s*vadas?|daal\s*wadas?|dhal\s*vadas?|dal\s*fritters?|daal\s*fritters?|lentil\s*vadas?|lentil\s*fritters?|chana\s*dal\s*vadas?|parippuvadai|dal\s*vadai|parippu|paripu|paripp)\b/i,
    malPattern: /(?:^|[\s\p{P}])(പരിപ്പ്\s*വട|പരിപ്പുവട|പരിപ്പ്)(?:$|[\s\p{P}])/u
  },
  {
    id: 'mulaku-bajji',
    enPattern: /\b(mulaku\s*bajjis?|mulaku\s*bhajis?|mulaku\s*bajis?|mulaku\s*bhajjis?|mulakubajjis?|mulakubhajis?|chilli\s*bajjis?|chili\s*bajjis?|chilli\s*bhajis?|chili\s*bhajis?|chilli\s*bhajjis?|chili\s*bhajjis?|chilli\s*fritters?|chili\s*fritters?|chilli\s*pakoras?|chili\s*pakoras?|chili\s*pakodas?|chilli\s*pakodas?|mirchi\s*bajjis?|mirchi\s*bhajis?|mirchi\s*pakoras?|molagu\s*bajjis?|milaku\s*bajjis?|mulak\s*bajjis?|mulaku|chilli|chili|mirchi)\b/i,
    malPattern: /(?:^|[\s\p{P}])(മുളക്\s*ബജ്ജി|മുളകുബജ്ജി|മുളക്)(?:$|[\s\p{P}])/u
  },
  {
    id: 'chicken-cutlet',
    enPattern: /\b(chicken\s*cutlets?|chicken\s*katlets?|chicken\s*cotlets?|chickencutlets?|chickenkatlets?|chikan\s*cutlets?|chikin\s*cutlets?|chikken\s*cutlets?|chick\s*cutlets?|chicken\s*patties?|chicken\s*patty|chicken\s*pieces?|chicken\s*piece|cutlets?|katlets?|cotlets?)\b/i,
    malPattern: /(?:^|[\s\p{P}])(ചിക്കൻ\s*കട്ട്ലറ്റ്|ചിക്കൻ\s*കട്‌ലറ്റ്|ചിക്കൻ\s*കട്ട്ലെറ്റ്|കട്ട്ലറ്റ്|കട്‌ലറ്റ്)(?:$|[\s\p{P}])/u
  },
  {
    id: 'tea',
    enPattern: /\b(teas?|cups?\s+of\s+tea|chayas?|chaayas?|chais?|chays?|chaais?|meter\s*tea|meter\s*chaya|hot\s*tea|kerala\s*tea|kerala\s*chai|black\s*tea|milk\s*tea|strong\s*tea|oru\s*chaya|tea\s*cups?|chaya\s*cups?)\b/i,
    malPattern: /(?:^|[\s\p{P}])(ചായ|ഒരു\s*ചായ|രണ്ട്\s*ചായ|ചായ\s*വേണം|ചായാ|ചായ്)(?:$|[\s\p{P}])/u
  },
  {
    id: 'coffee',
    enPattern: /\b(coffees?|cups?\s+of\s+coffee|kaapis?|kapis?|kaapees?|kappees?|coffi|coffe|cofy|copy|kopi|cappee|filter\s*coffee|south\s*indian\s*coffee|filter\s*kaapi|hot\s*coffee|black\s*coffee|strong\s*coffee|oru\s*kaapi|coffee\s*cups?|kaapi\s*cups?)\b/i,
    malPattern: /(?:^|[\s\p{P}])(കാപ്പി|ഒരു\s*കാപ്പി|രണ്ട്\s*കാപ്പി|കാപ്പീ|കാപ്പി\s*വേണം|കോഫി|ഒരു\s*കോഫി|രണ്ട്\s*കോഫി|കോഫീ|കോഫി\s*വേണം)(?:$|[\s\p{P}])/u
  },
  {
    id: 'paal-kappa',
    enPattern: /\b(paal\s*kappa|pal\s*kappa|paalkappa|palkappa|paul\s*kappa|kappa\s*fish\s*curry|kappa\s*(?:and|&|with)\s*fish\s*curry|paal\s*kappa\s*fish\s*curry|paal\s*kappa\s*(?:and|&|with)\s*fish\s*curry|tapioca\s*fish\s*curry|tapioca\s*(?:and|&|with)\s*fish\s*curry|kappa\s*curry|kappa\s*meen\s*curry|kappa\s*meen\s*chatti|kappa\s*meen|meen\s*curry|meencurry|kappayum\s*meenum|kappem\s*meenum|kappayum\s*meen\s*curriyum|plate\s+of\s+paal\s*kappa|plate\s+of\s+kappa|tapioca|kappa)\b/i,
    malPattern: /(?:^|[\s\p{P}])(കപ്പ\s*മീൻ\s*കറി|കപ്പമീൻകറി|കപ്പയും\s*മീൻ\s*കറിയും|കപ്പ|മീൻ\s*കറി|മീൻകറി|പാൽ\s*കപ്പ|പാൽക്കപ്പ)(?:$|[\s\p{P}])/u
  }
];

const OrderContext = createContext();

export function OrderProvider({ children }) {
  // Screen states: 'menu' | 'review' | 'checkout' | 'confirmation'
  const [screen, setScreen] = useState('menu');
  const [activeCategory, setActiveCategory] = useState('snacks');
  const [cart, setCart] = useState([]); // array of { item, quantity }
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(1048);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [isKioskStarted, setIsKioskStarted] = useState(false);

  // Voice state: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'WAITING_FOR_CONFIRMATION' | 'CHECKOUT' | 'COMPLETED'
  const [voiceState, setVoiceState] = useState('IDLE');
  const [recentVoiceHint, setRecentVoiceHint] = useState('');
  const [pendingClarification, setPendingClarification] = useState(null);

  const pendingClarificationRef = useRef(pendingClarification);
  pendingClarificationRef.current = pendingClarification;

  const cartRef = useRef(cart);
  cartRef.current = cart;

  const screenRef = useRef(screen);
  screenRef.current = screen;

  const voiceStateRef = useRef(voiceState);
  voiceStateRef.current = voiceState;

  // Calculate totals
  const totalAmount = cart.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  const totalItemCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const lastPromptContextRef = useRef(null);
  const lastInteractedItemRef = useRef(null);
  const lastAiPromptRef = useRef('');

  // Helper to speak with automatic recognition pause/resume
  const speak = useCallback((text, onComplete) => {
    lastAiPromptRef.current = text;
    speechRecognizer.pause();
    setVoiceState('SPEAKING');

    voiceSynthesizer.speak(text, {
      onEnd: () => {
        // Return to appropriate listening state
        if (screenRef.current === 'review') {
          setVoiceState('WAITING_FOR_CONFIRMATION');
        } else if (screenRef.current === 'checkout') {
          setVoiceState('CHECKOUT');
        } else if (screenRef.current === 'confirmation') {
          setVoiceState('COMPLETED');
        } else {
          setVoiceState('LISTENING');
        }
        
        // Wait 400ms debounce delay before turning mic back on to prevent AI self-hearing
        setTimeout(() => {
          speechRecognizer.resume();
        }, 400);

        if (onComplete) onComplete();
      },
      onError: () => {
        setVoiceState('LISTENING');
        setTimeout(() => {
          speechRecognizer.resume();
        }, 400);
        if (onComplete) onComplete();
      }
    });
  }, []);

  // Start Kiosk with natural Malayalam welcome
  const startKiosk = useCallback(() => {
    setIsKioskStarted(true);
    speechRecognizer.start();
    speak("നമസ്കാരം! എന്താണ് കഴിക്കാൻ വേണ്ടത്?");
  }, [speak]);

  // Cart operations
  const addToCart = useCallback((item, quantity = 1, isRelative = false) => {
    const validQty = (typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0) ? quantity : 1;
    setHighlightedItemId(item.id);
    setTimeout(() => setHighlightedItemId(null), 2500);

    setCart(prevCart => {
      const existing = prevCart.find(e => e.item.id === item.id);
      if (existing) {
        // By user requirement: any new ADD request should add to the existing quantity
        // unless they explicitly use a SET/change intent (handled by setItemQuantity).
        const newQty = existing.quantity + validQty;
        return prevCart.map(e => e.item.id === item.id ? { ...e, quantity: newQty } : e);
      } else {
        return [...prevCart, { item, quantity: validQty }];
      }
    });
  }, []);

  const removeFromCart = useCallback((item, quantity = null) => {
    setCart(prevCart => {
      const existing = prevCart.find(e => e.item.id === item.id);
      if (!existing) return prevCart;

      if (quantity === null || existing.quantity <= quantity) {
        return prevCart.filter(e => e.item.id !== item.id);
      } else {
        return prevCart.map(e => e.item.id === item.id ? { ...e, quantity: e.quantity - quantity } : e);
      }
    });
  }, []);

  const setItemQuantity = useCallback((item, quantity) => {
    if (quantity <= 0) {
      removeFromCart(item);
      return;
    }
    setCart(prevCart => {
      const existing = prevCart.find(e => e.item.id === item.id);
      if (existing) {
        return prevCart.map(e => e.item.id === item.id ? { ...e, quantity } : e);
      } else {
        return [...prevCart, { item, quantity }];
      }
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Complete Payment Action (Spoken in natural Malayalam)
  const processPayment = useCallback((method) => {
    const selectedMethod = method || selectedPayment;
    setSelectedPayment(selectedMethod);
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setScreen('confirmation');
      setVoiceState('COMPLETED');
      speak(`പേയ്‌മെന്റ് വിജയകരമായി പൂർത്തിയായി. ഓർഡർ കൺഫേം ചെയ്തിട്ടുണ്ട്. നിങ്ങളുടെ ഓർഡർ നമ്പർ ${orderNumber}. നന്ദി ഉണ്ടേ!`);
    }, 2000);
  }, [selectedPayment, orderNumber, speak]);

  // Start new order (Spoken in natural Malayalam)
  const resetOrder = useCallback(() => {
    setCart([]);
    setOrderNumber(prev => prev + 1);
    setScreen('menu');
    setActiveCategory('snacks');
    setIsProcessingPayment(false);
    speak("ശരി! എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?");
  }, [speak]);

  // Execute Gemini response action
  const applyGeminiAction = useCallback((geminiResult, originalTranscript) => {
    const rawIntent = geminiResult.intent || '';
    const intent = rawIntent.toUpperCase();
    const items = geminiResult.items;
    const { category, malayalamResponse } = geminiResult;

    let correctedItems = items;
    if (originalTranscript && items && items.length > 0 && ['ADD_ITEM', 'REMOVE_ITEM', 'REMOVE_FROM_CART', 'CHANGE_QUANTITY', 'SET_QUANTITY'].includes(intent)) {
      try {
        const localItems = extractMultipleItems(originalTranscript, {});
        const sentenceQty = extractQuantity(originalTranscript);
        const hasRel = /(?:കൂടി|കൂടെ|koodi|koode|more)/ui.test(originalTranscript) || sentenceQty.isRelative;

        correctedItems = items.map(geminiItem => {
          const rawId = geminiItem.id || '';
          const normalizedId = rawId.replace(/_/g, '-');
          const localMatch = localItems.find(li => li.item && (li.item.id === rawId || li.item.id === normalizedId));

          let finalQty = geminiItem.quantity;
          let finalIsRelative = Boolean(geminiItem.isRelative || hasRel || (localMatch && localMatch.isRelative) || sentenceQty.isRelative);

          if (localMatch && localMatch.hasExplicitQty && localMatch.quantity > 0) {
            console.log(`[Quantity Safety Net] Zone match: Gemini qty=${geminiItem.quantity} for ${rawId} → using local qty=${localMatch.quantity}, isRelative=${finalIsRelative}`);
            finalQty = localMatch.quantity;
            if (localMatch.isRelative) finalIsRelative = true;
          } else if (!sentenceQty.isDefault && sentenceQty.quantity > 0 && items.length === 1) {
            console.log(`[Quantity Safety Net] Sentence qty: Gemini qty=${geminiItem.quantity} for ${rawId} → using sentence qty=${sentenceQty.quantity}, isRelative=${finalIsRelative}`);
            finalQty = sentenceQty.quantity;
            if (sentenceQty.isRelative) finalIsRelative = true;
          }

          // If intent is REMOVE, undefined/null means "full remove".
          // Don't default to 1 if no quantity was explicitly stated.
          const isRemove = intent === 'REMOVE_ITEM' || intent === 'REMOVE_FROM_CART';
          const resolvedQuantity = isRemove
            ? (typeof finalQty === 'number' && finalQty > 0 ? finalQty : undefined)
            : ((typeof finalQty === 'number' && finalQty > 0) ? finalQty : 1);

          return {
            ...geminiItem,
            id: normalizedId,
            quantity: resolvedQuantity,
            isRelative: finalIsRelative
          };
        });
      } catch (e) {}
    }

    if (intent === 'ADD_ITEM' && correctedItems && correctedItems.length > 0) {
      setPendingClarification(null);

      let primaryCategory = null;
      correctedItems.forEach(it => {
        const normalizedId = (it.id || '').replace(/_/g, '-');
        const menuItem = MENU_ITEMS.find(m => m.id === normalizedId || m.id === it.id);
        if (menuItem) {
          const itemQty = (typeof it.quantity === 'number' && it.quantity > 0) ? it.quantity : 1;
          addToCart(menuItem, itemQty, it.isRelative || false);
          if (!primaryCategory) primaryCategory = menuItem.category;
        }
      });
      if (primaryCategory && primaryCategory !== activeCategory) {
        setActiveCategory(primaryCategory);
      }
      if (screenRef.current !== 'menu') setScreen('menu');
      speak(malayalamResponse);
      return true;
    }

    if ((intent === 'REMOVE_ITEM' || intent === 'REMOVE_FROM_CART') && correctedItems && correctedItems.length > 0) {
      correctedItems.forEach(it => {
        const menuItem = MENU_ITEMS.find(m => m.id === it.id);
        if (menuItem) {
          removeFromCart(menuItem, it.quantity || null);
        }
      });
      speak(malayalamResponse);
      return true;
    }

    if ((intent === 'CHANGE_QUANTITY' || intent === 'SET_QUANTITY') && correctedItems && correctedItems.length > 0) {
      const it = correctedItems[0];
      const menuItem = MENU_ITEMS.find(m => m.id === it.id);
      if (menuItem) {
        setItemQuantity(menuItem, (typeof it.quantity === 'number' && it.quantity > 0) ? it.quantity : 1);
      }
      speak(malayalamResponse);
      return true;
    }

    if (intent === 'SHOW_CART') {
      speak(malayalamResponse);
      return true;
    }

    if (intent === 'CHECK_TOTAL') {
      speak(malayalamResponse);
      return true;
    }

    if (intent === 'CHECKOUT') {
      if (cartRef.current.length === 0) {
        speak("നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്. ദയവായി വിഭവങ്ങൾ ചേർത്ത ശേഷം ഓർഡർ ചെയ്യുക.");
        return true;
      }
      setScreen('review');
      setVoiceState('WAITING_FOR_CONFIRMATION');
      const cartDesc = formatMalayalamItemsSpeech(cartRef.current);
      const total = cartRef.current.reduce((s, e) => s + e.item.price * e.quantity, 0);
      const promptText = malayalamResponse || `നിങ്ങളുടെ ഓർഡറിൽ ${cartDesc} ഉണ്ട്. ആകെ തുക ${total} രൂപ ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?`;
      lastPromptContextRef.current = {
        type: 'ORDER_CONFIRMATION',
        text: promptText,
        total: total
      };
      speak(promptText);
      return true;
    }

    const isConfirmationExpected =
      screenRef.current === 'review' ||
      screenRef.current === 'waiting_confirmation' ||
      voiceStateRef.current === 'WAITING_FOR_CONFIRMATION' ||
      lastPromptContextRef.current?.type === 'ORDER_CONFIRMATION' ||
      Boolean(lastAiPromptRef.current && /(?:സ്ഥിരീകരിക്കട്ടേ|സ്ഥിരീകരിക്കട്ടെ|കൺഫേം ചെയ്യട്ടെ|കൺഫേം ചെയ്യട്ടേ|ഉറപ്പാക്കട്ടേ|ഉറപ്പാക്കട്ടെ|confirm)/iu.test(lastAiPromptRef.current));

    if (intent === 'CONFIRM_ORDER') {
      if (isConfirmationExpected) {
        lastPromptContextRef.current = null;
        setScreen('checkout');
        setVoiceState('CHECKOUT');
        speak(malayalamResponse || "ദയവായി പേയ്‌മെന്റ് പൂർത്തിയാക്കൂ.");
        return true;
      } else if (cartRef.current.length > 0) {
        setScreen('review');
        setVoiceState('WAITING_FOR_CONFIRMATION');
        const cartDesc = formatMalayalamItemsSpeech(cartRef.current);
        const total = cartRef.current.reduce((s, e) => s + e.item.price * e.quantity, 0);
        const promptText = `നിങ്ങളുടെ ഓർഡറിൽ ${cartDesc} ഉണ്ട്. ആകെ തുക ${total} രൂപ ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?`;
        lastPromptContextRef.current = {
          type: 'ORDER_CONFIRMATION',
          text: promptText,
          total: total
        };
        speak(promptText);
        return true;
      }
    }

    if (intent === 'CANCEL_ORDER') {
      if (isConfirmationExpected) {
        lastPromptContextRef.current = null;
        setScreen('menu');
        setVoiceState('LISTENING');
        speak(malayalamResponse || "ശരി, എന്താണ് മാറ്റം വരുത്തേണ്ടത്?");
        return true;
      }
      clearCart();
      speak(malayalamResponse || "നിങ്ങളുടെ കാർട്ട് ഒഴിവാക്കിയിട്ടുണ്ട്. എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?");
      return true;
    }

    if (intent === 'SHOW_CATEGORY' || intent === 'MENU_INQUIRY') {
      if (category) {
        setActiveCategory(category);
      }
      if (screenRef.current !== 'menu') setScreen('menu');
      speak(malayalamResponse);
      return true;
    }

    if (intent === 'START_NEW_ORDER') {
      resetOrder();
      return true;
    }

    if (intent === 'OUT_OF_SCOPE') {
      speak(malayalamResponse || "ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?");
      return true;
    }

    if (malayalamResponse) {
      speak(malayalamResponse);
      return true;
    }

    return false;
  }, [activeCategory, addToCart, clearCart, removeFromCart, resetOrder, setItemQuantity, speak]);


  // Local rule-based processing fallback
  const processWithLocalRules = useCallback((transcript, alternatives = [], confidence = 1.0) => {
    // 0a. Handle Active Quantity Follow-up Question
    if (lastPromptContextRef.current?.type === 'ASK_QUANTITY' && lastPromptContextRef.current.item) {
      const targetItem = lastPromptContextRef.current.item;
      lastPromptContextRef.current = null;
      const qtyInfo = extractQuantity(transcript);
      const qty = qtyInfo.quantity || 1;
      addToCart(targetItem, qty, qtyInfo.isRelative);
      if (targetItem.category !== activeCategory) {
        setActiveCategory(targetItem.category);
      }
      if (screenRef.current !== 'menu') {
        setScreen('menu');
      }
      const addResponse = voiceSynthesizer.getAddResponse([{ item: targetItem, quantity: qty }]);
      speak(addResponse);
      return;
    }

    // 0b. Handle Active Pending Clarification / Disambiguation
    if (pendingClarificationRef.current) {
      const pending = pendingClarificationRef.current;
      const cleanRaw = transcript.trim().toLowerCase();

      const isPositive = /\b(yes|yeah|confirm|correct|sure|yep|ok|okay|right|athe)\b/i.test(cleanRaw) ||
                         /(?:^|[\s\p{P}])(അതെ|ശരി|തീർച്ചയായും|ഉറപ്പാണ്)(?:$|[\s\p{P}])/u.test(transcript);
      const isNegative = /\b(no|nope|not that|neither|wrong|cancel|nevermind|alla)\b/i.test(cleanRaw) ||
                         /(?:^|[\s\p{P}])(അല്ല|വേണ്ട)(?:$|[\s\p{P}])/u.test(transcript);

      if (pending.candidates && pending.candidates.length > 0) {
        const match = matchMenuItem(cleanRaw);
        if (match && match.item && pending.candidates.some(c => c.id === match.item.id)) {
          setPendingClarification(null);
          addToCart(match.item, pending.quantity || 1, pending.isRelative);
          if (match.item.category !== activeCategory) {
            setActiveCategory(match.item.category);
          }
          if (screenRef.current !== 'menu') {
            setScreen('menu');
          }
          const addResponse = voiceSynthesizer.getAddResponse([{ item: match.item, quantity: pending.quantity || 1 }]);
          speak(addResponse);
          return;
        } else if (isNegative) {
          setPendingClarification(null);
          speak("ശരി, എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?");
          return;
        }
      } else if (pending.item) {
        if (isPositive) {
          const { item, quantity, isRelative } = pending;
          setPendingClarification(null);
          addToCart(item, quantity, isRelative);

          if (item.category !== activeCategory) {
            setActiveCategory(item.category);
          }
          if (screenRef.current !== 'menu') {
            setScreen('menu');
          }

          const addResponse = voiceSynthesizer.getAddResponse([{ item, quantity }]);
          speak(addResponse);
          return;
        } else if (isNegative) {
          setPendingClarification(null);
          speak("ശരി, എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?");
          return;
        }
      }

      setPendingClarification(null);
    }

    const activePromptContext = lastPromptContextRef.current;
    const isConfirmationExpected =
      screenRef.current === 'review' ||
      screenRef.current === 'waiting_confirmation' ||
      voiceStateRef.current === 'WAITING_FOR_CONFIRMATION' ||
      activePromptContext?.type === 'ORDER_CONFIRMATION' ||
      Boolean(lastAiPromptRef.current && /(?:സ്ഥിരീകരിക്കട്ടേ|സ്ഥിരീകരിക്കട്ടെ|കൺഫേം ചെയ്യട്ടെ|കൺഫേം ചെയ്യട്ടേ|ഉറപ്പാക്കട്ടേ|ഉറപ്പാക്കട്ടെ|confirm)/iu.test(lastAiPromptRef.current));

    // Call primary parser with full context (including previous AI question and confirmation state)
    const parsed = parseVoiceCommand(transcript, {
      screen: screenRef.current,
      voiceState: voiceStateRef.current,
      cart: cartRef.current,
      lastAiPrompt: lastAiPromptRef.current,
      lastPromptContext: activePromptContext,
      lastInteractedItem: lastInteractedItemRef.current,
      alternatives
    });
    if (!parsed) return;

    lastPromptContextRef.current = null;

    // Handle Clarification / Disambiguation Request
    if (parsed.type === 'CLARIFICATION_NEEDED') {
      if (parsed.unclearRemoveQuantity && parsed.item) {
        lastInteractedItemRef.current = parsed.item;
        lastPromptContextRef.current = {
          type: 'ASK_REMOVE_QUANTITY',
          item: parsed.item
        };
        speak("എത്ര എണ്ണം ഒഴിവാക്കണമെന്ന് ഒന്ന് കൂടി പറയാമോ?");
        return;
      }

      if (parsed.unclearQuantity && parsed.item) {
        lastInteractedItemRef.current = parsed.item;
        lastPromptContextRef.current = {
          type: 'ASK_QUANTITY',
          item: parsed.item
        };
        speak("എത്ര എണ്ണം വേണമെന്ന് ഒന്ന് കൂടി പറയാമോ?");
        return;
      }

      lastInteractedItemRef.current = parsed.item;
      setPendingClarification({
        item: parsed.item,
        candidates: parsed.candidates,
        quantity: parsed.quantity,
        isRelative: parsed.isRelative
      });
      lastPromptContextRef.current = {
        type: 'CLARIFICATION',
        candidates: parsed.candidates,
        item: parsed.item,
        quantity: parsed.quantity
      };
      const prompt = voiceSynthesizer.getClarificationPrompt(parsed.candidates || parsed.item);
      speak(prompt);
      return;
    }

    // Handle Confirmation Request for Medium Confidence
    if (parsed.type === 'CONFIRMATION_NEEDED') {
      lastInteractedItemRef.current = parsed.item;
      lastPromptContextRef.current = {
        type: 'CONFIRM_ITEM',
        item: parsed.item,
        quantity: parsed.quantity,
        isRelative: parsed.isRelative
      };
      const prompt = voiceSynthesizer.getConfirmationPrompt(parsed.item, parsed.quantity);
      speak(prompt);
      return;
    }

    // 1. RESTART / NEW ORDER
    if (parsed.type === 'START_NEW_ORDER' || parsed.type === 'NEW_ORDER') {
      resetOrder();
      return;
    }

    // 2. CONFIRM ORDER
    if (parsed.type === 'CONFIRM_ORDER') {
      if (isConfirmationExpected) {
        lastPromptContextRef.current = null;
        setScreen('checkout');
        setVoiceState('CHECKOUT');
        speak("ദയവായി പേയ്‌മെന്റ് പൂർത്തിയാക്കൂ.");
        return;
      } else if (cartRef.current.length > 0) {
        setScreen('review');
        setVoiceState('WAITING_FOR_CONFIRMATION');
        const cartDesc = formatMalayalamItemsSpeech(cartRef.current);
        const total = cartRef.current.reduce((s, e) => s + e.item.price * e.quantity, 0);
        const promptText = `നിങ്ങളുടെ ഓർഡറിൽ ${cartDesc} ഉണ്ട്. ആകെ തുക ${total} രൂപ ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?`;
        lastPromptContextRef.current = {
          type: 'ORDER_CONFIRMATION',
          text: promptText,
          total: total
        };
        speak(promptText);
        return;
      }
    }

    // 3. CANCEL ORDER / CONFIRMATION
    if (parsed.type === 'CANCEL_ORDER' || parsed.type === 'CANCEL_CONFIRMATION') {
      if (isConfirmationExpected) {
        lastPromptContextRef.current = null;
        setScreen('menu');
        setVoiceState('LISTENING');
        speak("ശരി, എന്താണ് മാറ്റം വരുത്തേണ്ടത്?");
        return;
      }
      clearCart();
      speak("നിങ്ങളുടെ കാർട്ട് ഒഴിവാക്കിയിട്ടുണ്ട്. എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?");
      return;
    }

    // 4. CHECKOUT SCREEN COMMANDS
    if (screenRef.current === 'checkout') {
      if (parsed.type === 'SELECT_PAYMENT') {
        setSelectedPayment(parsed.method);
        const methodMal = parsed.method === 'Cash' ? 'ക്യാഷ്' : parsed.method;
        speak(`${methodMal} പേയ്‌മെന്റ് തിരഞ്ഞെടുത്തിട്ടുണ്ട്. പേയ്‌മെന്റ് പ്രോസസ്സ് ചെയ്യുന്നു.`, () => {
          processPayment(parsed.method);
        });
        return;
      }
      if (parsed.type === 'COMPLETE_PAYMENT') {
        processPayment();
        return;
      }
    }

    // 5. CHECKOUT / PROCEED TO REVIEW
    if (parsed.type === 'CHECKOUT' || parsed.type === 'PROCEED_TO_REVIEW') {
      if (cartRef.current.length === 0) {
        speak("നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്. ദയവായി വിഭവങ്ങൾ ചേർത്ത ശേഷം ഓർഡർ ചെയ്യുക.");
        return;
      }
      setScreen('review');
      setVoiceState('WAITING_FOR_CONFIRMATION');
      const cartDesc = formatMalayalamItemsSpeech(cartRef.current);
      const total = cartRef.current.reduce((s, e) => s + e.item.price * e.quantity, 0);
      const promptText = `നിങ്ങളുടെ ഓർഡറിൽ ${cartDesc} ഉണ്ട്. ആകെ തുക ${total} രൂപ ആണ്. ഓർഡർ സ്ഥിരീകരിക്കട്ടേ?`;
      lastPromptContextRef.current = {
        type: 'ORDER_CONFIRMATION',
        text: promptText,
        total: total
      };
      speak(promptText);
      return;
    }

    // 6. CHECK TOTAL
    if (parsed.type === 'CHECK_TOTAL') {
      const total = cartRef.current.reduce((s, e) => s + e.item.price * e.quantity, 0);
      if (cartRef.current.length === 0) {
        speak("നിങ്ങളുടെ കാർട്ട് ഇപ്പോൾ ശൂന്യമാണ്. തുക പൂജ്യം രൂപ ആണ്.");
      } else {
        const totalSpeech = voiceSynthesizer.getTotalResponse(total);
        speak(totalSpeech);
      }
      return;
    }

    // 7. SHOW CART / CART INQUIRY
    if (parsed.type === 'SHOW_CART' || parsed.type === 'CART_INQUIRY') {
      if (cartRef.current.length === 0) {
        speak("നിങ്ങളുടെ കാർട്ട് ഇപ്പോൾ ശൂന്യമാണ്. എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?");
      } else {
        const cartDesc = formatMalayalamItemsSpeech(cartRef.current);
        const total = cartRef.current.reduce((s, e) => s + e.item.price * e.quantity, 0);
        speak(`നിങ്ങളുടെ ഓർഡറിൽ ${cartDesc} ഉണ്ട്. ആകെ തുക ${total} രൂപ ആണ്.`);
      }
      return;
    }

    // 8. SHOW CATEGORY NAVIGATION
    if (parsed.type === 'SHOW_CATEGORY' || parsed.type === 'NAVIGATE_CATEGORY' || parsed.type === 'SHOW_DRINKS' || parsed.type === 'SHOW_SNACKS') {
      const targetCategory = parsed.category || (parsed.type === 'SHOW_DRINKS' ? 'drinks' : parsed.type === 'SHOW_SNACKS' ? 'snacks' : 'drinks');
      setActiveCategory(targetCategory);
      if (screenRef.current !== 'menu') {
        screenRef.current = 'menu';
        setScreen('menu');
        setVoiceState('LISTENING');
      }
      const catSpeech = voiceSynthesizer.getCategoryResponse(targetCategory);
      speak(catSpeech);
      return;
    }

    // 9. REMOVE ITEM / REMOVE_FROM_CART
    if (parsed.type === 'REMOVE_ITEM' || parsed.type === 'REMOVE_FROM_CART') {
      const itemsToRemove = parsed.items && parsed.items.length > 0
        ? parsed.items
        : [{ item: parsed.item, quantity: parsed.quantity || null }];

      const successfullyRemoved = [];
      const notInCart = [];

      itemsToRemove.forEach(({ item, quantity }) => {
        if (!item) return;
        lastInteractedItemRef.current = item;
        const existing = cartRef.current.find(e => e.item.id === item.id);
        if (!existing) {
          notInCart.push(item);
        } else {
          removeFromCart(item, quantity);
          successfullyRemoved.push({ item, quantity });
        }
      });

      if (successfullyRemoved.length === 0 && notInCart.length > 0) {
        if (notInCart.length === 1) {
          const malName = getMalayalamItemName(notInCart[0].id);
          speak(`നിങ്ങളുടെ കാർട്ടിൽ ${malName} ഇല്ല.`);
        } else {
          speak('നിങ്ങളുടെ കാർട്ടിൽ ഈ സാധനങ്ങൾ ഇല്ല.');
        }
        return;
      }

      const removeSpeech = voiceSynthesizer.getRemoveResponse(successfullyRemoved);
      speak(removeSpeech);
      return;
    }

    // 10. CHANGE QUANTITY (replaces existing quantity)
    if (parsed.type === 'CHANGE_QUANTITY' || parsed.type === 'SET_QUANTITY') {
      const { item, quantity } = parsed;
      lastInteractedItemRef.current = item;
      setItemQuantity(item, quantity);
      const qtySpeech = voiceSynthesizer.getQuantityChangeResponse(item, quantity);
      speak(qtySpeech);
      return;
    }

    // 11. ADD ITEM (Single or Multiple items)
    if (parsed.type === 'ADD_ITEM') {
      const itemsToAdd = parsed.items && parsed.items.length > 0
        ? parsed.items
        : [{ item: parsed.item, quantity: (typeof parsed.quantity === 'number' && parsed.quantity > 0) ? parsed.quantity : 1, isRelative: parsed.isRelative }];

      itemsToAdd.forEach(({ item, quantity, isRelative }) => {
        const itemQty = (typeof quantity === 'number' && quantity > 0) ? quantity : 1;
        addToCart(item, itemQty, isRelative);
      });

      lastInteractedItemRef.current = itemsToAdd[itemsToAdd.length - 1].item;

      const primaryItem = itemsToAdd[0].item;
      if (primaryItem.category !== activeCategory) {
        setActiveCategory(primaryItem.category);
      }
      if (screenRef.current !== 'menu') {
        setScreen('menu');
      }

      const addResponse = voiceSynthesizer.getAddResponse(itemsToAdd);
      speak(addResponse);
      return;
    }

    // 12. PRICE INQUIRY
    if (parsed.type === 'PRICE_INQUIRY') {
      if (parsed.item) {
        lastInteractedItemRef.current = parsed.item;
        lastPromptContextRef.current = {
          type: 'ASK_QUANTITY',
          item: parsed.item
        };
      }
      const priceSpeech = voiceSynthesizer.getPriceResponse(parsed.item);
      speak(priceSpeech);
      return;
    }

    // 13. MENU INQUIRY
    if (parsed.type === 'MENU_INQUIRY') {
      if (parsed.category) {
        setActiveCategory(parsed.category);
      }
      if (screenRef.current !== 'menu') {
        setScreen('menu');
      }
      const menuSpeech = voiceSynthesizer.getMenuResponse(parsed.category);
      speak(menuSpeech);
      return;
    }

    // 14. QUANTITY INQUIRY
    if (parsed.type === 'QUANTITY_INQUIRY') {
      if (parsed.item) {
        const entry = cartRef.current.find(e => e.item.id === parsed.item.id);
        const qty = entry ? entry.quantity : 0;
        const malName = getMalayalamItemName(parsed.item.id);
        if (qty === 0) {
          speak(`നിങ്ങളുടെ ഓർഡറിൽ ${malName} ഇല്ല.`);
        } else {
          const qtyText = getMalayalamNumber(qty);
          speak(`നിങ്ങളുടെ ഓർഡറിൽ ${qtyText} ${malName} ഉണ്ട്.`);
        }
        return;
      }
      if (parsed.category && parsed.category !== 'all') {
        const catCount = cartRef.current
          .filter(e => e.item.category === parsed.category)
          .reduce((sum, e) => sum + e.quantity, 0);
        const catLabel = parsed.category === 'drinks' ? 'ഡ്രിങ്ക്സ്' : parsed.category === 'meals' ? 'മീൽസ്' : 'സ്നാക്ക്സ്';
        if (catCount === 0) {
          speak(`നിങ്ങളുടെ ഓർഡറിൽ ${catLabel} ഇല്ല.`);
        } else {
          speak(`നിങ്ങളുടെ ഓർഡറിൽ ${catCount} ${catLabel} ഉണ്ട്.`);
        }
        return;
      }
      const totalCount = cartRef.current.reduce((sum, e) => sum + e.quantity, 0);
      if (totalCount === 0) {
        speak("നിങ്ങളുടെ കാർട്ട് ഇപ്പോൾ ശൂന്യമാണ്.");
      } else {
        speak(`നിങ്ങളുടെ ഓർഡറിൽ ആകെ ${totalCount} എണ്ണം ഉണ്ട്.`);
      }
      return;
    }

    // 15. PAYMENT GUIDANCE
    if (parsed.type === 'PAYMENT_GUIDANCE') {
      speak("യു.പി.ഐ, കാർഡ്, കൗണ്ടറിൽ ക്യാഷ് എന്നിവ വഴി പേയ്മെന്റ് ചെയ്യാം. ഓർഡർ പൂർത്തിയാക്കാൻ ചെക്ക്ഔട്ട് എന്ന് പറയൂ.");
      return;
    }

    // 16a. ITEM EXPLANATION
    if (parsed.type === 'ITEM_EXPLANATION') {
      if (parsed.item) {
        lastInteractedItemRef.current = parsed.item;
        const explSpeech = voiceSynthesizer.getItemExplanationResponse(parsed.item);
        speak(explSpeech);
      } else {
        speak("ഞങ്ങളുടെ എല്ലാ വിഭവങ്ങളും ചൂടോടെ തയ്യാറാക്കുന്ന നാടൻ വിഭവങ്ങളാണ്. ഏതിനെക്കുറിച്ചാണ് അറിയേണ്ടത്?");
      }
      return;
    }

    // 16b. PRICE COMPARISON
    if (parsed.type === 'PRICE_COMPARISON') {
      speak("സ്നാക്ക്സിനും ചായയ്ക്കും 10 രൂപ മുതൽ 25 രൂപ വരെയും, പാൽക്കപ്പ മീൻ കറിക്ക് 100 രൂപയും ആണ്. ചായ, കാപ്പി, പഴംപൊരി, വടകൾ എന്നിവയ്ക്ക് 10 രൂപ വീതമാണ്.");
      return;
    }

    // 16c. AVAILABILITY INQUIRY
    if (parsed.type === 'AVAILABILITY_INQUIRY') {
      if (parsed.item) {
        lastInteractedItemRef.current = parsed.item;
        const malName = getMalayalamItemName(parsed.item.id);
        speak(`അതെ, ചൂടുള്ള ${malName} ലഭ്യമാണ്. വില ${parsed.item.price} രൂപ. എത്ര എണ്ണം വേണം?`);
      } else {
        speak("അതെ, ഞങ്ങളുടെ എല്ലാ വിഭവങ്ങളും ലഭ്യമാണ്!");
      }
      return;
    }

    // 16. RESTAURANT-RELATED QUESTIONS
    if (parsed.type === 'RESTAURANT_INQUIRY') {
      if (parsed.topic === 'recommendation') {
        const recSpeech = voiceSynthesizer.getRecommendationResponse();
        speak(recSpeech);
      } else if (parsed.topic === 'dietary') {
        speak("ചിക്കൻ കട്ട്ലറ്റും മീൻ കറിയും ഒഴികെ ബാക്കിയെല്ലാ വിഭവങ്ങളും പൂർണ്ണമായും വെജിറ്റേറിയൻ ആണ്. എന്താണ് വേണ്ടത്?");
      } else if (parsed.topic === 'freshness') {
        speak("എല്ലാ വിഭവങ്ങളും ചൂടോടെ തയ്യാറാക്കി നൽകുന്നവയാണ്. എന്താണ് ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?");
      } else if (parsed.topic === 'spicy') {
        if (parsed.item && parsed.item.id === 'mulaku-bajji') {
          speak("മുളക് ബജ്ജി നല്ല എരിവുള്ളതാണ്! ഓർഡർ ചെയ്യട്ടെ?");
        } else if (parsed.item && parsed.item.id === 'paal-kappa') {
          speak("മീൻ കറി നല്ല എരിവുള്ള നാടൻ കറിയാണ്! ഓർഡർ ചെയ്യട്ടെ?");
        } else if (parsed.item) {
          const malName = voiceSynthesizer.getMalayalamItemName(parsed.item.id || parsed.item.shortName);
          speak(`${malName} പാകത്തിനുള്ള എരിവേ ഉള്ളൂ, എല്ലാവർക്കും കഴിക്കാം. ഓർഡർ ചെയ്യട്ടെ?`);
        } else {
          speak("മുളക് ബജ്ജിയും മീൻ കറിയും നല്ല എരിവുള്ളതാണ്, ബാക്കി വിഭവങ്ങൾക്ക് പാകത്തിനുള്ള എരിവേ ഉള്ളൂ.");
        }
      } else {
        speak("ഞങ്ങളുടെ കേരള ഫുഡ് കിയോസ്കിലേക്ക് സ്വാഗതം! എന്താണ് കഴിക്കാൻ വേണ്ടത്?");
      }
      return;
    }

    // 17. OUT-OF-SCOPE & UNKNOWN COMMANDS
    if (parsed.type === 'OUT_OF_SCOPE' || parsed.type === 'UNKNOWN') {
      if (/\b(biryani|dosa|idli|parotta|porotta|burger|pizza|sandwich|noodles|fried rice|pasta|shawarma|chapati|chappathi|thali|poori masala)\b/i.test(parsed.raw)) {
        speak("ക്ഷമിക്കണം, ആ വിഭവം ഞങ്ങളുടെ മെനുവിൽ ലഭ്യമല്ല. ലഭ്യമായ വിഭവങ്ങൾ കാണിക്കണോ?");
      } else if (parsed.type === 'OUT_OF_SCOPE') {
        speak("ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?");
      } else if (parsed.type === 'UNKNOWN' || parsed.confidenceTier === 'LOW') {
        speak("ക്ഷമിക്കണം, എനിക്ക് വ്യക്തമായി മനസ്സിലായില്ല. ഒന്നുകൂടി പറയാമോ?");
      } else {
        speak("ക്ഷമിക്കണം, ഭക്ഷണം, മെനു, ഓർഡർ എന്നിവയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങളിൽ മാത്രമേ എനിക്ക് സഹായിക്കാൻ കഴിയൂ. എന്താണ് നിങ്ങൾക്ക് ഓർഡർ ചെയ്യേണ്ടത്?");
      }
      return;
    }
  }, [
    activeCategory,
    addToCart,
    clearCart,
    processPayment,
    removeFromCart,
    resetOrder,
    setItemQuantity,
    speak
  ]);

  // Main Voice Command Handler (Fast-path local for clear orders + Gemini for complex turns)
  const handleVoiceCommand = useCallback((transcript, alternatives = [], confidence = 1.0) => {
    if (!transcript || !transcript.trim()) return;

    // Fast-path: Check if local rules have a high-confidence match for clear order operations
    const localParsed = parseVoiceCommand(transcript, {
      screen: screenRef.current,
      voiceState: voiceStateRef.current,
      cart: cartRef.current,
      lastAiPrompt: lastAiPromptRef.current,
      lastPromptContext: lastPromptContextRef.current,
      lastInteractedItem: lastInteractedItemRef.current,
      alternatives
    });

    const isHighConfidenceAction = localParsed && localParsed.confidenceTier === 'HIGH' &&
      ['ADD_ITEM', 'REMOVE_ITEM', 'REMOVE_FROM_CART', 'CHANGE_QUANTITY', 'SET_QUANTITY', 'CHECKOUT', 'CONFIRM_ORDER', 'CANCEL_ORDER', 'START_NEW_ORDER', 'PRICE_INQUIRY', 'MENU_INQUIRY', 'SHOW_CATEGORY', 'CHECK_TOTAL', 'SHOW_CART'].includes(localParsed.type);

    if (isHighConfidenceAction) {
      // Execute instantly via local rules (~100ms response time instead of ~5000ms cloud roundtrip)
      processWithLocalRules(transcript, alternatives, confidence);
      return;
    }

    // For conversational queries, ambiguous requests, or low confidence: route to Gemini with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        transcript: transcript.trim(),
        alternatives: alternatives || [],
        currentState: {
          screen: screenRef.current,
          voiceState: voiceStateRef.current,
          lastAiPrompt: lastAiPromptRef.current,
          lastPromptContext: lastPromptContextRef.current,
          cart: (cartRef.current || []).map(e => ({ item: { id: e.item.id, shortName: e.item.shortName }, quantity: e.quantity }))
        }
      })
    })
      .then(res => res.ok ? res.json() : null)
      .then(geminiResult => {
        clearTimeout(timeoutId);
        if (geminiResult && geminiResult.success && geminiResult.intent && geminiResult.intent !== 'UNKNOWN') {
          const applied = applyGeminiAction(geminiResult, transcript);
          if (applied) return;
        }
        processWithLocalRules(transcript, alternatives, confidence);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        processWithLocalRules(transcript, alternatives, confidence);
      });
  }, [applyGeminiAction, processWithLocalRules]);

  const handleVoiceCommandRef = useRef(handleVoiceCommand);
  handleVoiceCommandRef.current = handleVoiceCommand;

  // Hook up SpeechRecognizer callbacks once on mount
  useEffect(() => {
    // Preload common Malayalam voice responses in the background for zero-latency TTS
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          voiceSynthesizer.preloadCommonResponses();
        }, { timeout: 2000 });
      } else {
        setTimeout(() => {
          voiceSynthesizer.preloadCommonResponses();
        }, 1200);
      }
    }

    speechRecognizer.setCallbacks({
      onResult: (transcript, alternatives, confidence) => {
        setRecentVoiceHint(`"${transcript}"`);
        if (handleVoiceCommandRef.current) {
          handleVoiceCommandRef.current(transcript, alternatives, confidence);
        }
      },
      onInterim: (interim) => {
        if (interim && interim.trim()) {
          setRecentVoiceHint(`... ${interim.trim()}`);
        }
      },
      onStateChange: (state) => {
        if (!voiceSynthesizer.isSpeaking) {
          setVoiceState(state);
        }
      },
      onError: (err) => {
        if (err === 'MICROPHONE_DENIED') {
          setMicPermissionDenied(true);
        }
      }
    });

    return () => {
      speechRecognizer.stop();
      voiceSynthesizer.stop();
    };
  }, []);

  return (
    <OrderContext.Provider
      value={{
        screen,
        setScreen,
        activeCategory,
        setActiveCategory,
        cart,
        addToCart,
        removeFromCart,
        setItemQuantity,
        clearCart,
        totalAmount,
        totalItemCount,
        highlightedItemId,
        orderNumber,
        selectedPayment,
        setSelectedPayment,
        isProcessingPayment,
        processPayment,
        resetOrder,
        voiceState,
        setVoiceState,
        recentVoiceHint,
        micPermissionDenied,
        setMicPermissionDenied,
        isKioskStarted,
        startKiosk,
        speak,
        handleVoiceCommand,
        pendingClarification,
        setPendingClarification
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    return {
      screen: 'menu',
      cart: [],
      totalAmount: 0,
      totalItemCount: 0,
      activeCategory: 'snacks',
      voiceState: 'IDLE'
    };
  }
  return context;
}

