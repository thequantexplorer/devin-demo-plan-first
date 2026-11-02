const SYMBOLS = { USD: '$', EUR: '€' };

// formatMoney(123450, 'USD') -> "$1,234.50". Used by the web page.
export function formatMoney(cents, currency) {
  if (!Number.isInteger(cents)) {
    throw new TypeError(`cents must be an integer, got ${cents}`);
  }
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100).toLocaleString('en-US');
  const fraction = String(abs % 100).padStart(2, '0');
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  return `${sign}${symbol}${whole}.${fraction}`;
}

// formatAmount(123450) -> "1234.50". Plain number for CSV: no symbol, no separators.
export function formatAmount(cents) {
  if (!Number.isInteger(cents)) {
    throw new TypeError(`cents must be an integer, got ${cents}`);
  }
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
