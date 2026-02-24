export const VENDOR_CATEGORY_MAP: Record<string, string> = {
  // Food & Dining
  swiggy: "Food & Dining",
  zomato: "Food & Dining",
  ubereats: "Food & Dining",
  dominos: "Food & Dining",
  "pizza hut": "Food & Dining",
  mcdonalds: "Food & Dining",
  "burger king": "Food & Dining",
  kfc: "Food & Dining",
  subway: "Food & Dining",
  starbucks: "Food & Dining",
  dunkin: "Food & Dining",
  "cafe coffee day": "Food & Dining",
  blinkit: "Groceries",
  grofers: "Groceries",
  bigbasket: "Groceries",
  dmart: "Groceries",
  reliance: "Groceries",
  // Transport
  uber: "Transport",
  ola: "Transport",
  rapido: "Transport",
  "indian railways": "Transport",
  irctc: "Transport",
  "air india": "Transport",
  indigo: "Transport",
  spicejet: "Transport",
  makemytrip: "Travel",
  goibibo: "Travel",
  yatra: "Travel",
  // Shopping
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  meesho: "Shopping",
  ajio: "Shopping",
  nykaa: "Shopping",
  // Entertainment
  netflix: "Entertainment",
  hotstar: "Entertainment",
  "disney+": "Entertainment",
  "amazon prime": "Entertainment",
  spotify: "Entertainment",
  youtube: "Entertainment",
  bookmyshow: "Entertainment",
  pvr: "Entertainment",
  inox: "Entertainment",
  // Utilities
  airtel: "Utilities",
  jio: "Utilities",
  vodafone: "Utilities",
  "bsnl": "Utilities",
  tata: "Utilities",
  "bescom": "Utilities",
  "mahadiscom": "Utilities",
  // Health
  apollo: "Health",
  medplus: "Health",
  img: "Health",
  pharmeasy: "Health",
  "netmeds": "Health",
  // Finance
  "hdfc bank": "Finance",
  "icici bank": "Finance",
  "sbi": "Finance",
  "axis bank": "Finance",
  paytm: "Finance",
  phonepe: "Finance",
  googlepay: "Finance",
};

export function getCategoryForVendor(vendorName: string): string {
  const normalized = vendorName.toLowerCase().trim();
  for (const [keyword, category] of Object.entries(VENDOR_CATEGORY_MAP)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }
  return "Other";
}
