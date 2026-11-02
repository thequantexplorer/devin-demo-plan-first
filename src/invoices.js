import { readFileSync } from 'node:fs';

const DATA_FILE = new URL('./data/invoices.json', import.meta.url);

export const STATUSES = ['draft', 'sent', 'paid', 'overdue', 'void'];

export function loadInvoices(file = DATA_FILE) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

// All money is integer cents. Tax is rounded once, on the subtotal.
export function withTotals(invoice) {
  const subtotalCents = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0,
  );
  const taxCents = Math.round((subtotalCents * invoice.taxRateBps) / 10000);
  return { ...invoice, subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

// filters come from parseFilters() in filters.js.
export function listInvoices(invoices, filters = {}) {
  const customer = filters.customer?.toLowerCase();
  return invoices
    .filter((inv) => !filters.status || inv.status === filters.status)
    .filter((inv) => !customer || inv.customer.toLowerCase().includes(customer))
    .filter((inv) => !filters.from || inv.issueDate >= filters.from)
    .filter((inv) => !filters.to || inv.issueDate <= filters.to)
    .sort((a, b) => a.issueDate.localeCompare(b.issueDate) || a.number.localeCompare(b.number))
    .map(withTotals);
}

export function getInvoice(invoices, id) {
  const invoice = invoices.find((inv) => inv.id === id);
  return invoice ? withTotals(invoice) : null;
}

export function summarize(list) {
  const byCurrency = {};
  for (const inv of list) {
    byCurrency[inv.currency] = (byCurrency[inv.currency] ?? 0) + inv.totalCents;
  }
  return { count: list.length, totalCentsByCurrency: byCurrency };
}
