import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

let app;
before(async () => { app = await startApp(); });
after(() => app.close());

test('GET /api/health', async () => {
  const res = await fetch(`${app.url}/api/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('GET /api/invoices returns invoices and a summary', async () => {
  const res = await fetch(`${app.url}/api/invoices`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.invoices.length, 12);
  assert.equal(body.summary.count, 12);
});

test('GET /api/invoices applies filters', async () => {
  const res = await fetch(`${app.url}/api/invoices?status=sent&customer=globex`);
  const body = await res.json();
  assert.deepEqual(body.invoices.map((i) => i.number), ['INV-1009']);
});

test('GET /api/invoices answers 400 for a bad filter', async () => {
  const res = await fetch(`${app.url}/api/invoices?status=late`);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /status must be one of/);
});

test('GET /api/invoices/:id returns one invoice with totals', async () => {
  const res = await fetch(`${app.url}/api/invoices/inv_1011`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.number, 'INV-1011');
  assert.equal(body.totalCents, 868028);
});

test('GET /api/invoices/:id answers 404 for an unknown id', async () => {
  const res = await fetch(`${app.url}/api/invoices/inv_9999`);
  assert.equal(res.status, 404);
});

const CSV_HEADER = 'number,customer,issue_date,due_date,status,currency,subtotal,tax,total';
const csvLines = (text) => text.split('\r\n').slice(0, -1);

test('GET /api/invoices/export.csv downloads a CSV file', async () => {
  const res = await fetch(`${app.url}/api/invoices/export.csv`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');
  assert.equal(res.headers.get('content-disposition'), 'attachment; filename="invoices.csv"');
});

test('GET /api/invoices/export.csv has the same invoices in the same order', async () => {
  const lines = csvLines(await (await fetch(`${app.url}/api/invoices/export.csv`)).text());
  const { invoices } = await (await fetch(`${app.url}/api/invoices`)).json();
  assert.equal(lines[0], CSV_HEADER);
  assert.equal(lines.length, 13);
  assert.deepEqual(lines.slice(1).map((line) => line.split(',')[0]), invoices.map((i) => i.number));
  assert.equal(lines[1], 'INV-1001,Acme Corp,2026-07-01,2026-07-31,paid,USD,5100.00,420.75,5520.75');
});

test('GET /api/invoices/export.csv escapes a formula customer', async () => {
  const text = await (await fetch(`${app.url}/api/invoices/export.csv?status=draft`)).text();
  assert.ok(csvLines(text).includes(
    'INV-1007,"\'=HYPERLINK(""http://example.com"",""Click me"")",2026-09-10,2026-10-10,draft,USD,10.00,0.00,10.00',
  ));
});

test('GET /api/invoices/export.csv applies filters', async () => {
  const text = await (await fetch(`${app.url}/api/invoices/export.csv?status=sent&customer=globex`)).text();
  assert.deepEqual(csvLines(text).slice(1).map((line) => line.split(',')[0]), ['INV-1009']);
});

test('GET /api/invoices/export.csv has only the header when nothing matches', async () => {
  const res = await fetch(`${app.url}/api/invoices/export.csv?customer=nobody`);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), `${CSV_HEADER}\r\n`);
});

test('GET /api/invoices/export.csv answers 400 for a bad filter', async () => {
  const res = await fetch(`${app.url}/api/invoices/export.csv?status=late`);
  assert.equal(res.status, 400);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.match((await res.json()).error, /status must be one of/);
});

test('serves the web page', async () => {
  const res = await fetch(`${app.url}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  const html = await res.text();
  assert.match(html, /<h1>Invoices<\/h1>/);
  assert.match(html, /<button type="button" id="export"[^>]*>Export CSV<\/button>/);
});

test('rejects other methods', async () => {
  const res = await fetch(`${app.url}/api/invoices`, { method: 'POST' });
  assert.equal(res.status, 405);
});
