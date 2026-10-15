// Client Configuration & Environment Settings
const isDevPreview = typeof window !== 'undefined' && window.location.port === '3000';

export const CONFIG = {
  USE_MOCK_API: false,
  // When testing with standalone preview server on port 3000, call backend on port 5000.
  // On Vercel or when served directly from Express on port 5000, use relative '/api'.
  API_BASE_URL: isDevPreview ? "http://localhost:5000/api" : "/api",
  FREE_SHIPPING_THRESHOLD: 100.00,
  STANDARD_SHIPPING_FEE: 5.00,
  EXPRESS_SHIPPING_FEE: 15.00,
  CURRENCY_SYMBOL: "$",
  TAX_RATE: 0.0825, // 8.25% estimated sales tax
  STORE_NAME: "ANISA STUDIO",
  STORE_TAGLINE: "Architectural Essentials & Contemporary Tailoring"
};
