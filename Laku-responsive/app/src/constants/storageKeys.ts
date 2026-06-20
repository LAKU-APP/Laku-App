// Kunci localStorage — dikumpulkan di satu tempat agar tidak ada typo string.
export const STORAGE_KEYS = {
  user: 'user',
  token: 'token',
  dailyTarget: 'dailyTarget',
  onboarding: 'hasSeenOnboarding',
  onboardedEmails: 'onboardedEmails',
  storeSettings: 'storeSettings',
  categories: 'categories',
  products: 'products',
  transactions: 'transactions',
  receipts: 'receipts',
  cart: 'cart',
} as const;
