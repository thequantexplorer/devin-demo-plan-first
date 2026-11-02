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

test('serves the web page', async () => {
  const res = await fetch(`${app.url}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.match(await res.text(), /<h1>Invoices<\/h1>/);
});

test('rejects other methods', async () => {
  const res = await fetch(`${app.url}/api/invoices`, { method: 'POST' });
  assert.equal(res.status, 405);
});
