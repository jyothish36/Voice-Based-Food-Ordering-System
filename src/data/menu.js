export const CATEGORIES = [
  { id: 'snacks', name: 'Snacks', icon: 'Sparkles', count: 7 },
  { id: 'drinks', name: 'Drinks', icon: 'Coffee', count: 2 },
  { id: 'meals', name: 'Meals', icon: 'Utensils', count: 1 }
];

export const MENU_ITEMS = [
  // SNACKS
  {
    id: 'pazham-pori',
    name: 'Pazham Pori (Banana Fritters)',
    shortName: 'Pazham Pori',
    price: 10,
    unit: 'per piece',
    category: 'snacks',
    image: '/images/pazham_pori.jpg',
    description: 'Crisp golden sweet ripe banana fritters sliced and fried in light batter',
    synonyms: [
      'pazham pori', 'pazham puri', 'pazhampori', 'pazhampuri', 'pazham pori banana',
      'banana pori', 'banana puri', 'banana fritter', 'banana fritters', 'banana fry',
      'ethakka appam', 'ethakkappam', 'ethakka fry', 'ripe banana fritter', 'pazham', 'pori',
      'പഴം പൊരി', 'പഴംപൊരി', 'പഴം', 'പൊരി', 'ഏത്തയ്ക്ക അപ്പം', 'ഏത്തക്ക അപ്പം'
    ]
  },
  {
    id: 'ulli-vada',
    name: 'Ulli Vada',
    shortName: 'Ulli Vada',
    price: 10,
    unit: 'per piece',
    category: 'snacks',
    image: '/images/ulli_vada.jpg',
    description: 'Crispy Kerala spiced onion fritters tempered with green chili and curry leaves',
    synonyms: [
      'ulli vada', 'ulli wada', 'ulli bada', 'ullivada', 'ulliwada', 'ullibada',
      'onion vada', 'onion wada', 'onion bada', 'onion fritter', 'onion fritters',
      'onion pakora', 'ulli',
      'ഉള്ളി വട', 'ഉള്ളിവട', 'ഉള്ളി'
    ]
  },
  {
    id: 'parippu-vada',
    name: 'Parippu Vada (Fritters)',
    shortName: 'Parippu Vada',
    price: 10,
    unit: 'per piece',
    category: 'snacks',
    image: '/images/parippu_vada.jpg',
    description: 'Crunchy crushed chana dal fritters with ginger, shallots, and curry leaves',
    synonyms: [
      'parippu vada', 'parippu wada', 'paripp vada', 'paripp wada', 'parippu bada',
      'parippuvada', 'parippuwada', 'paripu vada', 'paripu wada', 'paripuvada',
      'dal vada', 'dal wada', 'dal bada', 'daal vada', 'daal wada', 'dhal vada',
      'dal fritter', 'dal fritters', 'lentil vada', 'parippu', 'paripu', 'paripp',
      'പരിപ്പ് വട', 'പരിപ്പുവട', 'പരിപ്പ്'
    ]
  },
  {
    id: 'medhu-vada',
    name: 'Medhu Vada (Uzhunnu Vada)',
    shortName: 'Medhu Vada',
    price: 10,
    unit: 'per piece',
    category: 'snacks',
    image: '/images/medhu_vada.jpg',
    description: 'Savory fluffy black gram doughnut fritter with crisp golden brown crust',
    synonyms: [
      'medhu vada', 'medu vada', 'medhu wada', 'medu wada', 'medhu bada', 'medu bada',
      'uzhunnu vada', 'uzunnu vada', 'uzhunnu wada', 'uzunnu wada', 'uzhunnu bada', 'uzunnu bada',
      'urad vada', 'urad wada', 'urad dal vada', 'urad fritter',
      'meduvada', 'medhuvada', 'uzhunnuvada', 'uzunnuvada', 'ulundu vadai',
      'vada', 'vadas', 'wada', 'wadas', 'uzhunnu', 'uzunnu', 'medu',
      'ഉഴുന്ന് വട', 'ഉഴുന്നുവട', 'ഉഴുന്ന്', 'മേദു വട'
    ]
  },
  {
    id: 'mulaku-bajji',
    name: 'Mulaku Bajji (Chili Fritter)',
    shortName: 'Mulaku Bajji',
    price: 10,
    unit: 'per piece',
    category: 'snacks',
    image: '/images/mulaku_bajji.jpg',
    description: 'Plump green banana peppers dipped in spiced gram flour batter and fried crispy',
    synonyms: [
      'mulaku bajji', 'mulaku bhaji', 'mulaku baji', 'mulaku bhajji',
      'mulakubajji', 'mulakubhaji', 'chilli bajji', 'chili bajji', 'chilli bhaji', 'chili bhaji',
      'chilli fritter', 'chili fritter', 'chilli pakora', 'chili pakora',
      'mirchi bajji', 'molagu bajji', 'mulaku', 'chili', 'chilli', 'bajji', 'bhaji', 'baji', 'bajjis',
      'മുളക് ബജ്ജി', 'മുളകുബജ്ജി', 'മുളക്'
    ]
  },
  {
    id: 'egg-bajji',
    name: 'Egg Bajji',
    shortName: 'Egg Bajji',
    price: 15,
    unit: 'per piece',
    category: 'snacks',
    image: '/images/egg_bajji.jpg',
    description: 'Hard-boiled egg coated in spiced aromatic batter, fried golden',
    synonyms: [
      'egg bajji', 'egg bhaji', 'egg baji', 'egg bhajji', 'egg baaji', 'eggbajji', 'eggbhaji',
      'motta bajji', 'motta bhaji', 'motta baji', 'motta bhajji', 'motta baaji', 'mottabajji', 'mottabhaji',
      'mutta bajji', 'muttabajji', 'mutta bhaji', 'mutta baji', 'mutta bhajji', 'muttabhaji',
      'egg bhuh-jee', 'egg bhuh jee', 'egg bhuhjee', 'egg bhu-jee', 'egg buh-jee',
      'egg fritter', 'egg fritters', 'egg pakora', 'mutta pakora', 'egg bonda', 'mutta bonda',
      'boiled egg bajji', 'mutta', 'egg',
      'മുട്ട ബജ്ജി', 'മുട്ടബജ്ജി', 'മുട്ട ബോണ്ട', 'മുട്ട'
    ]
  },
  {
    id: 'chicken-cutlet',
    name: 'Chicken Cutlet',
    shortName: 'Chicken Cutlet',
    price: 25,
    unit: 'per piece',
    category: 'snacks',
    image: '/images/chicken_cutlet.jpg',
    description: 'Spiced minced chicken and mashed potato patty crumbed and fried crisp',
    synonyms: [
      'chicken cutlet', 'chicken cutlet piece', 'one chicken cutlet', 'chicken piece',
      'chickencutlet', 'cutlet', 'cutlets', 'chicken patty', 'chikan cutlet', 'chikin cutlet',
      'chicken katlet',
      'ചിക്കൻ കട്ട്ലറ്റ്', 'ചിക്കൻ കട്‌ലറ്റ്', 'ചിക്കൻ', 'കട്ട്ലറ്റ്'
    ]
  },

  // DRINKS
  {
    id: 'tea',
    name: 'Tea',
    shortName: 'Tea',
    price: 10,
    unit: 'per cup',
    category: 'drinks',
    image: '/images/tea.jpg',
    description: 'Freshly poured piping hot Kerala meter tea with frothy milk froth',
    synonyms: [
      'tea', 'teas', 'cup of tea', 'chai', 'chaya', 'chaaya', 'meter tea', 'meter chaya',
      'hot tea', 'kerala tea', 'black tea', 'oru chaya',
      'ചായ', 'ഒരു ചായ', 'ചായ വേണം', 'ഒരു ചായ തരൂ', 'ചായാ', 'ചായ്'
    ]
  },
  {
    id: 'coffee',
    name: 'Coffee',
    shortName: 'Coffee',
    price: 10,
    unit: 'per cup',
    category: 'drinks',
    image: '/images/coffee.jpg',
    description: 'Freshly brewed aromatic South Indian filter coffee with velvet foam',
    synonyms: [
      'coffee', 'coffees', 'cup of coffee', 'kaapi', 'kapi', 'filter coffee', 'coffi', 'coffe',
      'hot coffee', 'south indian coffee', 'oru kaapi',
      'കാപ്പി', 'ഒരു കാപ്പി', 'കാപ്പീ', 'കാപ്പി വേണം'
    ]
  },

  // MEALS
  {
    id: 'paal-kappa',
    name: 'Paal Kappa & Fish Curry',
    shortName: 'Paal Kappa & Fish Curry',
    price: 100,
    unit: 'per plate',
    category: 'meals',
    image: '/images/paal_kappa.jpg',
    description: 'Rich creamy mashed coconut milk tapioca paired with spicy Kerala clay-pot fish curry',
    synonyms: [
      'paal kappa fish curry', 'paal kappa and fish curry', 'paal kappa & fish curry', 'paal kappa with fish curry',
      'kappa fish curry', 'kappa and fish curry', 'kappa & fish curry', 'kappa with fish curry',
      'tapioca fish curry', 'tapioca and fish curry', 'tapioca with fish curry', 'tapioca curry', 'kappa curry',
      'paal kappa', 'pal kappa', 'paalkappa', 'kappa', 'tapioca', 'fish curry',
      'fish curry and kappa', 'fish curry and paal kappa', 'plate of paal kappa',
      'kappa meen curry', 'kappa meen chatti', 'meen curry', 'meencurry',
      'kappayum meenum', 'kappayum meen curriyum', 'kappem meenum',
      'കപ്പ മീൻ കറി', 'കപ്പമീൻകറി', 'കപ്പയും മീൻ കറിയും', 'കപ്പ', 'മീൻ കറി', 'മീൻകറി', 'പാൽ കപ്പ', 'പാൽക്കപ്പ'
    ]
  }
];
