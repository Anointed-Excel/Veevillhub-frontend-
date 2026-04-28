import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ── Rate margin ────────────────────────────────────────────────────────────────
// We add a small buffer to every exchange rate to:
//  1. Cover exchange rate movement between display and actual payment time
//  2. Small revenue on currency conversion (industry standard: 2-4%)
// This is how Shopify, Stripe, PayPal all do it.
const RATE_MARGIN = 0.025; // 2.5 %

// ── Cache ──────────────────────────────────────────────────────────────────────
const CACHE_KEY    = 'vvh_currency_cache';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours (not 24 — rates change daily)

// ── Types ──────────────────────────────────────────────────────────────────────
interface CurrencyState {
  code: string;
  symbol: string;
  rate: number;      // rate WITH margin: how many units of `code` per 1 NGN
  rawRate: number;   // rate WITHOUT margin (send to backend for payment calculations)
  loading: boolean;
}

interface CurrencyContextValue extends CurrencyState {
  setCurrency: (code: string) => void;
  convert: (ngnAmount: number) => number;   // converted with margin (for display)
  fmt: (ngnAmount: number) => string;       // formatted display string
  fmtRaw: (ngnAmount: number) => string;    // formatted without margin (for total lines)
}

const KNOWN_SYMBOLS: Record<string, string> = {
  NGN: '₦',  USD: '$',   GBP: '£',   EUR: '€',
  GHS: 'GH₵', KES: 'KSh', ZAR: 'R',  CAD: 'CA$',
  AUD: 'A$',  JPY: '¥',   CNY: '¥',  INR: '₹',
  AED: 'AED', SGD: 'S$',  SAR: '﷼',  CHF: 'Fr',
};

// No-decimal currencies
const NO_DECIMALS = new Set(['NGN', 'JPY', 'KES', 'GHS']);

// ── Psychological rounding ─────────────────────────────────────────────────────
// Like Apple, Spotify, Netflix — converted prices end in .99, .49, or are
// rounded to clean numbers. This makes the platform feel professional.
function psychRound(amount: number, currency: string): number {
  if (NO_DECIMALS.has(currency)) {
    // Round to nearest 50 or 100 for whole-unit currencies
    if (amount >= 1000) return Math.round(amount / 100) * 100;
    if (amount >= 100)  return Math.round(amount / 50)  * 50;
    return Math.round(amount);
  }

  // For decimal currencies: use .99 endings like Apple
  if (amount <= 0) return 0;
  if (amount < 1)  return Math.round(amount * 100) / 100;

  // Get the "floor" value and apply .99 ending
  const floor = Math.floor(amount);
  const frac  = amount - floor;

  // If already very close to a clean number, round normally
  if (frac < 0.05) return floor;
  if (frac > 0.95) return floor + 1;

  // Apply .99 ending (e.g. $10.47 → $9.99, $10.83 → $10.99)
  if (frac < 0.5) return floor - 0.01;   // e.g. $10.20 → $9.99
  return floor + 0.99;                    // e.g. $10.60 → $10.99
}

const DEFAULT: CurrencyState = { code: 'NGN', symbol: '₦', rate: 1, rawRate: 1, loading: true };

const CurrencyContext = createContext<CurrencyContextValue>({
  ...DEFAULT,
  setCurrency: () => {},
  convert:  (n) => n,
  fmt:      (n) => `₦${n.toLocaleString()}`,
  fmtRaw:   (n) => `₦${n.toLocaleString()}`,
});

// ── Cache helpers ─────────────────────────────────────────────────────────────
function readCache(): { code: string; rates: Record<string, number>; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(code: string, rates: Record<string, number>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ code, rates, ts: Date.now() }));
  } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrencyState>(DEFAULT);
  const [rates, setRates] = useState<Record<string, number>>({ NGN: 1 });

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      applyRates(cached.code, cached.rates);
      return;
    }

    (async () => {
      let detectedCode = 'NGN';
      try {
        const geoRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        const geo = await geoRes.json();
        if (geo?.currency) detectedCode = geo.currency;
      } catch { /* geo failed — default NGN */ }

      try {
        const ratesRes = await fetch(
          'https://open.er-api.com/v6/latest/NGN',
          { signal: AbortSignal.timeout(5000) }
        );
        const ratesData = await ratesRes.json();
        if (ratesData?.rates) {
          const fetchedRates: Record<string, number> = ratesData.rates;
          fetchedRates['NGN'] = 1;
          writeCache(detectedCode, fetchedRates);
          applyRates(detectedCode, fetchedRates);
        } else {
          applyRates(detectedCode, { NGN: 1 });
        }
      } catch {
        applyRates(detectedCode, { NGN: 1 });
      }
    })();
  }, []);

  function applyRates(code: string, fetchedRates: Record<string, number>) {
    setRates(fetchedRates);
    const rawRate = fetchedRates[code] ?? 1;
    // Apply margin to all non-NGN rates
    const rateWithMargin = code === 'NGN' ? 1 : rawRate * (1 + RATE_MARGIN);
    setState({
      code,
      symbol: KNOWN_SYMBOLS[code] || code,
      rate: rateWithMargin,
      rawRate,
      loading: false,
    });
  }

  function setCurrency(code: string) {
    const cached = readCache();
    const currentRates = cached?.rates ?? rates;
    writeCache(code, currentRates);
    applyRates(code, currentRates);
  }

  // convert: with margin (for display prices — slightly higher to cover conversion risk)
  function convert(ngnAmount: number): number {
    if (state.code === 'NGN') return ngnAmount;
    const raw = ngnAmount * state.rate;
    return psychRound(raw, state.code);
  }

  // convertRaw: without margin (for total/payment amounts sent to backend)
  function convertRaw(ngnAmount: number): number {
    if (state.code === 'NGN') return ngnAmount;
    return ngnAmount * state.rawRate;
  }

  function formatNumber(amount: number, code: string): string {
    const symbol = KNOWN_SYMBOLS[code] || code;
    const noDecimals = NO_DECIMALS.has(code);
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    })}`;
  }

  function fmt(ngnAmount: number): string {
    return formatNumber(convert(ngnAmount), state.code);
  }

  function fmtRaw(ngnAmount: number): string {
    return formatNumber(
      NO_DECIMALS.has(state.code) ? Math.round(convertRaw(ngnAmount)) : Math.round(convertRaw(ngnAmount) * 100) / 100,
      state.code
    );
  }

  return (
    <CurrencyContext.Provider value={{ ...state, setCurrency, convert, fmt, fmtRaw }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

// ── Supported currencies for the manual picker ────────────────────────────────
// Ordered by: African markets first (our core), then global majors
export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', label: 'Nigerian Naira',       symbol: '₦',   flag: '🇳🇬' },
  { code: 'GHS', label: 'Ghanaian Cedi',        symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'KES', label: 'Kenyan Shilling',      symbol: 'KSh', flag: '🇰🇪' },
  { code: 'ZAR', label: 'South African Rand',   symbol: 'R',   flag: '🇿🇦' },
  { code: 'USD', label: 'US Dollar',            symbol: '$',   flag: '🇺🇸' },
  { code: 'GBP', label: 'British Pound',        symbol: '£',   flag: '🇬🇧' },
  { code: 'EUR', label: 'Euro',                 symbol: '€',   flag: '🇪🇺' },
  { code: 'CAD', label: 'Canadian Dollar',      symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', label: 'Australian Dollar',    symbol: 'A$',  flag: '🇦🇺' },
  { code: 'AED', label: 'UAE Dirham',           symbol: 'AED', flag: '🇦🇪' },
  { code: 'INR', label: 'Indian Rupee',         symbol: '₹',   flag: '🇮🇳' },
];
