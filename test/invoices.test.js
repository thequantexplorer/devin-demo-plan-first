import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadInvoices, listInvoices, getInvoice, summarize, withTotals } from '../src/invoices.js';

const invoices = loadInvoices();

test('the seed data has 12 invoices', () => {
  assert.equal(invoices.length, 12);
});

test('totals are computed in cents with tax rounded once', () => {
  const inv = withTotals(invoices.find((i) => i.number === 'INV-1003'));
  assert.equal(inv.subtotalCents, 49999);
  assert.equal(inv.taxCents, 10000);
  assert.equal(inv.totalCents, 59999);
});

test('lists every invoice sorted by issue date when there are no filters', () => {
  const list = listInvoices(invoices);
  assert.equal(list.length, 12);
  assert.equal(list[0].number, 'INV-1001');
  assert.equal(list.at(-1).number, 'INV-1012');
});

test('filters by status', () => {
  const list = listInvoices(invoices, { status: 'overdue' });
  assert.deepEqual(list.map((i) => i.number), ['INV-1003', 'INV-1006']);
});

test('filters by customer, ignoring case', () => {
  const list = listInvoices(invoices, { customer: 'acme' });
  assert.deepEqual(list.map((i) => i.number), ['INV-1001', 'INV-1006', 'INV-1010']);
});

test('filters by an inclusive issue-date range', () => {
  const list = listInvoices(invoices, { from: '2026-10-01', to: '2026-10-14' });
  assert.deepEqual(list.map((i) => i.number), ['INV-1009', 'INV-1010', 'INV-1011']);
});

test('getInvoice returns null for an unknown id', () => {
  assert.equal(getInvoice(invoices, 'nope'), null);
});

test('summarize totals each currency separately', () => {
  const list = listInvoices(invoices, { status: 'paid' });
  assert.deepEqual(summarize(list), {
    count: 4,
    totalCentsByCurrency: { USD: 1377763, EUR: 128520 },
  });
});
