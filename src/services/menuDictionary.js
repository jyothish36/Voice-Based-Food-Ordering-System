import { MENU_ITEMS } from '../data/menu.js';

/**
 * Structured Menu Dictionary (Single Source of Truth for Voice Recognition)
 * Contains canonical metadata, speech variants, Malayalam script forms, and transliterations.
 */
export const MENU_DICTIONARY = [
  {
    id: 'pazham-pori',
    canonicalName: 'Pazham Pori (Banana Fritters)',
    shortName: 'Pazham Pori',
    category: 'snacks',
    price: 10,
    unit: 'per piece',
    malayalamName: 'പഴംപൊരി',
    description: 'Crisp golden sweet ripe banana fritters sliced and fried in light batter',
    aliases: [
      'pazham pori', 'pazham puri', 'pazhampori', 'pazhampuri', 'pazham pori banana',
      'banana fritter', 'banana fritters', 'banana fry', 'banana pori', 'banana puri',
      'ethakka appam', 'ethakkappam', 'ethakka fry', 'ripe banana fritter', 'pazham'
    ],
    commonSpeechVariants: [
      'pazham pori', 'pazham puri', 'pazham poori', 'banana fritter', 'banana fritters',
      'banana fry', 'ethakka appam', 'ethakkappam', 'ethakka', 'pasan podi', 'pazham podi'
    ],
    transliterations: [
      'pazham pori', 'pazham puri', 'pazham poori', 'ethakka appam', 'ethakkappam', 'ethakka'
    ],
    malayalamVariants: [
      'പഴം പൊരി', 'പഴംപൊരി', 'പഴം', 'പൊരി', 'ഏത്തയ്ക്ക അപ്പം', 'ഏത്തക്ക അപ്പം', 'പഴംപൊരിയുടെ', 'പഴംപൊരികൾ'
    ]
  },
  {
    id: 'ulli-vada',
    canonicalName: 'Ulli Vada',
    shortName: 'Ulli Vada',
    category: 'snacks',
    price: 10,
    unit: 'per piece',
    malayalamName: 'ഉള്ളിവട',
    description: 'Crispy Kerala spiced onion fritters tempered with green chili and curry leaves',
    aliases: [
      'ulli vada', 'ulli wada', 'ulli bada', 'ullivada', 'ulliwada', 'ullibada',
      'onion vada', 'onion wada', 'onion bada', 'onion fritter', 'onion fritters',
      'onion pakora', 'ulli'
    ],
    commonSpeechVariants: [
      'ulli vada', 'ulli wada', 'onion vada', 'onion wada', 'onion fritter', 'onion fritters',
      'onion pakora', 'ullivada', 'ulliwada', 'uli vada', 'oli vada'
    ],
    transliterations: [
      'ulli vada', 'ulli wada', 'ullivada', 'ulliwada'
    ],
    malayalamVariants: [
      'ഉള്ളി വട', 'ഉള്ളിവട', 'ഉള്ളി'
    ]
  },
  {
    id: 'parippu-vada',
    canonicalName: 'Parippu Vada (Fritters)',
    shortName: 'Parippu Vada',
    category: 'snacks',
    price: 10,
    unit: 'per piece',
    malayalamName: 'പരിപ്പുവട',
    description: 'Crunchy crushed chana dal fritters with ginger, shallots, and curry leaves',
    aliases: [
      'parippu vada', 'parippu wada', 'paripp vada', 'paripp wada', 'parippu bada',
      'parippuvada', 'parippuwada', 'paripu vada', 'paripu wada', 'paripuvada',
      'dal vada', 'dal wada', 'dal bada', 'daal vada', 'daal wada', 'dhal vada',
      'dal fritter', 'dal fritters', 'lentil vada', 'parippu', 'paripu', 'paripp'
    ],
    commonSpeechVariants: [
      'parippu vada', 'parippu wada', 'dal vada', 'dal wada', 'daal vada', 'dhal vada',
      'dal fritter', 'dal fritters', 'paripp vada', 'lentil vada', 'paripu vada'
    ],
    transliterations: [
      'parippu vada', 'parippu wada', 'parippuvada', 'paripu vada', 'paripuvada'
    ],
    malayalamVariants: [
      'പരിപ്പ് വട', 'പരിപ്പുവട', 'പരിപ്പ്'
    ]
  },
  {
    id: 'medhu-vada',
    canonicalName: 'Medhu Vada (Uzhunnu Vada)',
    shortName: 'Medhu Vada',
    category: 'snacks',
    price: 10,
    unit: 'per piece',
    malayalamName: 'ഉഴുന്നുവട',
    description: 'Savory fluffy black gram doughnut fritter with crisp golden brown crust',
    aliases: [
      'medhu vada', 'medu vada', 'medhu wada', 'medu wada', 'medhu bada', 'medu bada',
      'uzhunnu vada', 'uzunnu vada', 'uzhunnu wada', 'uzunnu wada', 'uzhunnu bada', 'uzunnu bada',
      'urad vada', 'urad wada', 'urad dal vada', 'urad fritter',
      'meduvada', 'medhuvada', 'uzhunnuvada', 'uzunnuvada', 'ulundu vadai',
      'uzhunnu', 'uzunnu', 'medu'
    ],
    commonSpeechVariants: [
      'medhu vada', 'medu vada', 'medhu wada', 'medu wada', 'uzhunnu vada', 'uzunnu vada',
      'urad vada', 'urad wada', 'urad dal vada',
      'uzhunnu wada', 'uzunnu wada', 'ulundu vadai', 'meduvada', 'uzhunnuvada'
    ],
    transliterations: [
      'uzhunnu vada', 'uzunnu vada', 'medhu vada', 'medu vada', 'urad vada', 'uzhunnuvada'
    ],
    malayalamVariants: [
      'ഉഴുന്ന് വട', 'ഉഴുന്നുവട', 'ഉഴുന്ന്', 'മേദു വട'
    ]
  },
  {
    id: 'mulaku-bajji',
    canonicalName: 'Mulaku Bajji (Chili Fritter)',
    shortName: 'Mulaku Bajji',
    category: 'snacks',
    price: 10,
    unit: 'per piece',
    malayalamName: 'മുളകുബജ്ജി',
    description: 'Plump green banana peppers dipped in spiced gram flour batter and fried crispy',
    aliases: [
      'mulaku bajji', 'mulaku bhaji', 'mulaku baji', 'mulaku bhajji',
      'mulakubajji', 'mulakubhaji', 'chilli bajji', 'chili bajji', 'chilli bhaji', 'chili bhaji',
      'chilli fritter', 'chili fritter', 'chilli fritters', 'chili fritters', 'chilli pakora', 'chili pakora',
      'mirchi bajji', 'molagu bajji', 'mulaku', 'chili', 'chilli'
    ],
    commonSpeechVariants: [
      'mulaku bajji', 'mulaku bhaji', 'chili bajji', 'chilli bajji', 'chili bhaji', 'chilli bhaji',
      'chili fritter', 'chilli fritter', 'chili fritters', 'chilli fritters', 'mirchi bajji', 'mulakubajji'
    ],
    transliterations: [
      'mulaku bajji', 'mulaku bhaji', 'mulakubajji'
    ],
    malayalamVariants: [
      'മുളക് ബജ്ജി', 'മുളകുബജ്ജി', 'മുളക്'
    ]
  },
  {
    id: 'egg-bajji',
    canonicalName: 'Egg Bajji',
    shortName: 'Egg Bajji',
    category: 'snacks',
    price: 15,
    unit: 'per piece',
    malayalamName: 'മുട്ടബജ്ജി',
    description: 'Hard-boiled eggs enveloped in spiced chickpea batter and deep-fried golden',
    aliases: [
      'egg bajji', 'egg bhaji', 'egg baji', 'egg bhajji', 'egg baaji',
      'motta bajji', 'motta bhaji', 'motta baji', 'motta bhajji', 'motta baaji',
      'mutta bajji', 'mutta bhaji', 'mutta baji', 'mutta bhajji', 'mutta baaji',
      'eggbajji', 'eggbhaji', 'mottabajji', 'mottabhaji', 'muttabajji', 'muttabhaji',
      'egg bhuh-jee', 'egg bhuh jee', 'egg bhuhjee', 'egg bhu-jee', 'egg buh-jee',
      'egg fritter', 'egg fritters', 'egg pakora', 'egg pakoda'
    ],
    commonSpeechVariants: [
      'egg bajji', 'egg bhajji', 'egg bhaji', 'motta bajji', 'mutta bajji', 'mutta bhaji', 'egg pakora', 'egg bhuh-jee', 'egg bhuh jee', 'egg bhuhjee', 'egg fritter', 'egg fritters', 'eggbajji', 'muttabajji'
    ],
    transliterations: [
      'mutta bajji', 'motta bajji', 'egg bajji', 'muttabajji'
    ],
    malayalamVariants: [
      'മുട്ട ബജ്ജി', 'മുട്ടബജ്ജി', 'മുട്ട'
    ]
  },
  {
    id: 'chicken-cutlet',
    canonicalName: 'Chicken Cutlet',
    shortName: 'Chicken Cutlet',
    category: 'snacks',
    price: 25,
    unit: 'per piece',
    malayalamName: 'ചിക്കൻ കട്ട്ലറ്റ്',
    description: 'Hearty minced chicken patty spiced with ginger and black pepper, breadcrumb crusted',
    aliases: [
      'chicken cutlet', 'chicken cutlets', 'chicken katlet', 'chickencutlet',
      'chicken piece', 'chicken pieces', 'chicken cutlet piece', 'piece of chicken cutlet',
      'cutlet', 'cutlets', 'katlet', 'katlets', 'chicken patty'
    ],
    commonSpeechVariants: [
      'chicken cutlet', 'chicken cutlets', 'chicken piece', 'chicken katlet', 'chickencutlet', 'cutlet', 'cutlets'
    ],
    transliterations: [
      'chicken cutlet', 'chicken katlet', 'chickencutlet'
    ],
    malayalamVariants: [
      'ചിക്കൻ കട്ട്ലറ്റ്', 'ചിക്കൻ കട്ട്ലറ്റ് വേണം', 'ചിക്കൻ കട്ട്ലെറ്റ്', 'ചിക്കൻ'
    ]
  },
  {
    id: 'tea',
    canonicalName: 'Tea (Chaya)',
    shortName: 'Tea',
    category: 'drinks',
    price: 10,
    unit: 'per cup',
    malayalamName: 'ചായ',
    description: 'Freshly poured piping hot Kerala meter tea with frothy milk froth',
    aliases: [
      'tea', 'teas', 'cup of tea', 'chai', 'chaya', 'chaaya', 'chay', 'chaai',
      'meter tea', 'meter chaya', 'hot tea', 'kerala tea', 'black tea', 'oru chaya',
      'chaya venam', 'tea please', 'kerala chai'
    ],
    commonSpeechVariants: [
      'tea', 'chaya', 'chaaya', 'chai', 'cup of tea', 'meter tea', 'kerala tea'
    ],
    transliterations: [
      'chaya', 'chaaya', 'chai', 'oru chaya'
    ],
    malayalamVariants: [
      'ചായ', 'ഒരു ചായ', 'ചായ വേണം', 'ഒരു ചായ തരൂ', 'ചായാ', 'ചായ്', 'ചായയുടെ', 'ചായകൾ'
    ]
  },
  {
    id: 'coffee',
    canonicalName: 'Coffee (Kaapi)',
    shortName: 'Coffee',
    category: 'drinks',
    price: 10,
    unit: 'per cup',
    malayalamName: 'കാപ്പി',
    description: 'Strong, aromatic chicory-blended filter coffee frothed to perfection',
    aliases: [
      'coffee', 'coffees', 'cup of coffee', 'kaapi', 'kapi', 'filter coffee', 'coffi', 'coffe',
      'hot coffee', 'south indian coffee', 'oru kaapi', 'coffee please', 'oru coffee', 'onnu coffee',
      'kofi', 'kōphi'
    ],
    commonSpeechVariants: [
      'coffee', 'kaapi', 'kapi', 'filter coffee', 'hot coffee', 'onnu coffee', 'kofi'
    ],
    transliterations: [
      'kaapi', 'kapi', 'oru kaapi', 'onnu coffee', 'coffee', 'kofi'
    ],
    malayalamVariants: [
      'കാപ്പി', 'ഒരു കാപ്പി', 'കാപ്പീ', 'കാപ്പി വേണം', 'കോഫി', 'ഒരു കോഫി', 'കോഫീ', 'കോഫി വേണം', 'കോഫിയുടെ', 'കാപ്പിയുടെ'
    ]
  },
  {
    id: 'paal-kappa',
    canonicalName: 'Paal Kappa & Fish Curry',
    shortName: 'Paal Kappa & Fish Curry',
    category: 'meals',
    price: 100,
    unit: 'per plate',
    malayalamName: 'പാൽ കപ്പ & മീൻ കറി',
    description: 'Rich creamy mashed coconut milk tapioca paired with spicy Kerala clay-pot fish curry',
    aliases: [
      'paal kappa fish curry', 'paal kappa and fish curry', 'paal kappa & fish curry', 'paal kappa with fish curry',
      'kappa fish curry', 'kappa and fish curry', 'kappa & fish curry', 'kappa with fish curry',
      'tapioca fish curry', 'tapioca and fish curry', 'tapioca with fish curry', 'tapioca curry', 'kappa curry',
      'paal kappa', 'pal kappa', 'paalkappa', 'kappa', 'tapioca', 'fish curry',
      'fish curry and kappa', 'fish curry and paal kappa', 'plate of paal kappa',
      'kappa meen curry', 'kappa meen chatti', 'meen curry', 'meencurry',
      'kappayum meenum', 'kappayum meen curriyum', 'kappem meenum'
    ],
    commonSpeechVariants: [
      'paal kappa', 'kappa fish curry', 'kappa and fish curry', 'tapioca fish curry',
      'paal kappa and fish curry', 'paal kappa fish curry', 'kappa curry', 'kappa meen', 'tapioca',
      'kappayum meenum', 'kappem meenum'
    ],
    transliterations: [
      'paal kappa', 'pal kappa', 'kappa meen curry', 'kappa curry', 'meen curry'
    ],
    malayalamVariants: [
      'കപ്പ മീൻ കറി', 'കപ്പമീൻകറി', 'കപ്പയും മീൻ കറിയും', 'കപ്പ', 'മീൻ കറി', 'മീൻകറി', 'പാൽ കപ്പ', 'പാൽക്കപ്പ'
    ]
  }
];

/**
 * Get MenuItem object by ID (matching MENU_ITEMS from menu.js)
 */
export function getMenuItemById(id) {
  return MENU_ITEMS.find(item => item.id === id) || null;
}
