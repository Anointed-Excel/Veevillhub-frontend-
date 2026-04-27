import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CurrencyState {
  code: string;       // e.g. "USD"
  symbol: string;     // e.g. "$"
  rate: number;       // how many units of `code` per 1 NGN
  loading: boolean;
}

interface CurrencyContextValue extends CurrencyState {
  setCurrency: (code: string) => void;
  convert: (ngnAmount: number) => number;
  fmt: (ngnAmount: number) => string;
}

const CACHE_KEY    = 'vvh_currency_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const KNOWN_SYMBOLS: Record<string, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€',
  GHS: 'GH₵', KES: 'KSh', ZAR: 'R', CAD: 'CA$',
  AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹',
};

const DEFAULT: CurrencyState = { code: 'NGN', symbol: '₦', rate: 1, loading: true };

const CurrencyContext = createContext<CurrencyContextValue>({
  ...DEFAULT,
  setCurrency: () => {},
  convert: (n) => n,
  fmt: (n) => `₦${n.toLocaleString()}`,
});

function readCache(): { code: string; rates: Record<string, number>; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(code: string, rates: Record<string, number>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ code, rates, ts: Date.now() }));
  } catch {}
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrencyState>(DEFAULT);
  const [rates, setRates] = useState<Record<string, number>>({ NGN: 1 });

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      applyRates(cached.code, cached.rates);
      return;
    }

    // Detect location → currency, then fetch rates
    (async () => {
      let detectedCode = 'NGN';

      try {
        const geoRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        const geo = await geoRes.json();
        if (geo?.currency) detectedCode = geo.currency;
      } catch {
        // Geo failed — fall back to NGN
      }

      try {
        const ratesRes = await fetch(
          `https://open.er-api.com/v6/latest/NGN`,
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
    setState({
      code,
      symbol: KNOWN_SYMBOLS[code] || code,
      rate: fetchedRates[code] ?? 1,
      loading: false,
    });
  }

  function setCurrency(code: string) {
    const cached = readCache();
    const currentRates = cached?.rates ?? rates;
    writeCache(code, currentRates);
    applyRates(code, currentRates);
  }

  function convert(ngnAmount: number): number {
    return ngnAmount * (rates[state.code] ?? 1);
  }

  function fmt(ngnAmount: number): string {
    const converted = convert(ngnAmount);
    const symbol = state.symbol;

    // For currencies that typically show no decimals (JPY, NGN, KES whole units)
    const noDecimals = ['NGN', 'JPY', 'KES', 'GHS'].includes(state.code);

    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    })}`;
  }

  return (
    <CurrencyContext.Provider value={{ ...state, setCurrency, convert, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

// Supported currencies for the manual picker
export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', label: 'Nigerian Naira',    symbol: '₦'   },
  { code: 'USD', label: 'US Dollar',         symbol: '$'   },
  { code: 'GBP', label: 'British Pound',     symbol: '£'   },
  { code: 'EUR', label: 'Euro',              symbol: '€'   },
  { code: 'GHS', label: 'Ghanaian Cedi',     symbol: 'GH₵' },
  { code: 'KES', label: 'Kenyan Shilling',   symbol: 'KSh' },
  { code: 'ZAR', label: 'South African Rand',symbol: 'R'   },
  { code: 'CAD', label: 'Canadian Dollar',   symbol: 'CA$' },
];
