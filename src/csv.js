import { formatAmount } from './money.js';

const FORMULA_START = /^[=+\-@]/;
const NEEDS_QUOTES = /[",\r\n]/;

const COLUMNS = [
  ['number', (inv) => inv.number],
  ['customer', (inv) => inv.customer],
  ['issue_date', (inv) => inv.issueDate],
  ['due_date', (inv) => inv.dueDate],
  ['status', (inv) => inv.status],
  ['currency', (inv) => inv.currency],
  ['subtotal', (inv) => formatAmount(inv.subtotalCents), { numeric: true }],
  ['tax', (inv) => formatAmount(inv.taxCents), { numeric: true }],
  ['total', (inv) => formatAmount(inv.totalCents), { numeric: true }],
];

// RFC 4180 quoting. Text values that a spreadsheet would run as a formula get a
// leading single quote. Numeric columns skip that guard so negatives stay numbers.
export function csvField(value, { numeric = false } = {}) {
  let text = String(value ?? '');
  if (!numeric && FORMULA_START.test(text)) text = `'${text}`;
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function invoicesToCsv(list) {
  const lines = [COLUMNS.map(([name]) => csvField(name))];
  for (const inv of list) {
    lines.push(COLUMNS.map(([, get, options]) => csvField(get(inv), options)));
  }
  return lines.map((fields) => `${fields.join(',')}\r\n`).join('');
}
