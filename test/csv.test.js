import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvField, invoicesToCsv } from '../src/csv.js';
import { loadInvoices, listInvoices } from '../src/invoices.js';

const HEADER = 'number,customer,issue_date,due_date,status,currency,subtotal,tax,total';

test('leaves plain values alone', () => {
  assert.equal(csvField('Acme Corp'), 'Acme Corp');
  assert.equal(csvField('2026-07-01'), '2026-07-01');
});

test('wraps a value with a comma in double quotes', () => {
  assert.equal(csvField('Smith, Jones & Co'), '"Smith, Jones & Co"');
});

test('wraps a value with a double quote and doubles it', () => {
  assert.equal(csvField('The "Blue Door" Café'), '"The ""Blue Door"" Café"');
});

test('wraps a value with a line break', () => {
  assert.equal(csvField('line one\nline two'), '"line one\nline two"');
  assert.equal(csvField('line one\r\nline two'), '"line one\r\nline two"');
});

test('prefixes formula-like text with a single quote', () => {
  for (const start of ['=', '+', '-', '@']) {
    assert.equal(csvField(`${start}SUM(A1)`), `'${start}SUM(A1)`);
  }
});

test('guards and quotes a formula that also has commas and quotes', () => {
  assert.equal(
    csvField('=HYPERLINK("http://example.com","Click me")'),
    '"\'=HYPERLINK(""http://example.com"",""Click me"")"',
  );
});

test('does not guard numeric columns', () => {
  assert.equal(csvField('-25.00', { numeric: true }), '-25.00');
});

test('an empty list still has the header row', () => {
  assert.equal(invoicesToCsv([]), `${HEADER}\r\n`);
});

test('writes the columns in order and ends every line with CRLF', () => {
  const csv = invoicesToCsv(listInvoices(loadInvoices()));
  assert.ok(csv.endsWith('\r\n'));
  const lines = csv.split('\r\n');
  assert.equal(lines.pop(), '');
  assert.equal(lines.length, 13);
  assert.equal(lines[0], HEADER);
  assert.equal(lines[1], 'INV-1001,Acme Corp,2026-07-01,2026-07-31,paid,USD,5100.00,420.75,5520.75');
  assert.ok(!csv.replaceAll('\r\n', '').includes('\n'));
});
