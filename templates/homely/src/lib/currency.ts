// Currency configuration and formatting utilities

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

// Default currency configuration - Change this to switch currencies globally
export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "GHS",
  symbol: "₵",
  name: "Ghana Cedi",
  locale: "en-GH",
};

// Alternative currency configurations for easy switching
export const CURRENCY_OPTIONS: Record<string, CurrencyConfig> = {
  GHS: {
    code: "GHS",
    symbol: "₵",
    name: "Ghana Cedi",
    locale: "en-GH",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "en-EU",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
  },
  NGN: {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    locale: "en-NG",
  },
};

/**
 * Format currency amount using the default currency configuration
 * @param amount - The amount to format
 * @param currency - Optional currency config (defaults to DEFAULT_CURRENCY)
 * @param options - Additional formatting options
 */
export const formatCurrency = (
  amount: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY,
  options: Intl.NumberFormatOptions = {}
): string => {
  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    ...options,
  };

  try {
    return new Intl.NumberFormat(currency.locale, formatOptions).format(amount);
  } catch (error) {
    // Fallback formatting if locale is not supported
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
};

/**
 * Format currency with custom symbol (useful for legacy support)
 * @param amount - The amount to format
 * @param currencyCode - The currency code to use for formatting
 */
export const formatCurrencyLegacy = (
  amount: number,
  currencyCode?: string
): string => {
  const currency = currencyCode
    ? CURRENCY_OPTIONS[currencyCode] || DEFAULT_CURRENCY
    : DEFAULT_CURRENCY;
  return formatCurrency(amount, currency);
};

/**
 * Get currency symbol
 * @param currencyCode - Optional currency code (defaults to default currency)
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  const currency = currencyCode
    ? CURRENCY_OPTIONS[currencyCode] || DEFAULT_CURRENCY
    : DEFAULT_CURRENCY;
  return currency.symbol;
};

/**
 * Convert price to default currency (placeholder for future currency conversion)
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency code
 * @param toCurrency - The target currency code (defaults to default currency)
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string = DEFAULT_CURRENCY.code
): number => {
  // TODO: Implement actual currency conversion using exchange rates
  // For now, return the original amount
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Placeholder conversion rates (replace with real API)
  const conversionRates: Record<string, Record<string, number>> = {
    USD: {
      GHS: 12.0,
      NGN: 800,
      EUR: 0.85,
      GBP: 0.75,
    },
    GHS: {
      USD: 0.083,
      NGN: 66.67,
      EUR: 0.071,
      GBP: 0.063,
    },
  };

  const rate = conversionRates[fromCurrency]?.[toCurrency] || 1;
  return Math.round(amount * rate);
};

/**
 * Format price with automatic currency conversion
 * @param amount - The original amount
 * @param originalCurrency - The original currency code
 * @param targetCurrency - The target currency (defaults to default currency)
 */
export const formatConvertedCurrency = (
  amount: number,
  originalCurrency?: string,
  targetCurrency?: string
): string => {
  if (!originalCurrency || originalCurrency === DEFAULT_CURRENCY.code) {
    return formatCurrency(amount);
  }

  const convertedAmount = convertCurrency(
    amount,
    originalCurrency,
    targetCurrency
  );
  return formatCurrency(convertedAmount);
};
