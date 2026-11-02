import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFilters, FilterError } from '../src/filters.js';

const parse = (query) => parseFilters(new URLSearchParams(query));

test('empty query means no filters', () => {
  assert.deepEqual(parse(''), {});
});

test('keeps valid filters and trims the customer', () => {
  assert.deepEqual(parse('status=paid&customer=%20acme%20&from=2026-07-01&to=2026-07-31'), {
    status: 'paid',
    customer: 'acme',
    from: '2026-07-01',
    to: '2026-07-31',
  });
});

test('rejects an unknown status', () => {
  assert.throws(() => parse('status=late'), FilterError);
});

test('rejects a badly formatted date', () => {
  assert.throws(() => parse('from=07/01/2026'), FilterError);
});

test('rejects from after to', () => {
  assert.throws(() => parse('from=2026-08-01&to=2026-07-01'), FilterError);
});
