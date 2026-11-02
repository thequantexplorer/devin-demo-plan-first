import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney } from '../src/money.js';

test('formats dollars with a thousands separator', () => {
  assert.equal(formatMoney(123450, 'USD'), '$1,234.50');
});

test('formats euros and small amounts', () => {
  assert.equal(formatMoney(5, 'EUR'), '€0.05');
});

test('formats negative amounts', () => {
  assert.equal(formatMoney(-2500, 'USD'), '-$25.00');
});

test('falls back to the currency code', () => {
  assert.equal(formatMoney(100, 'GBP'), 'GBP 1.00');
});

test('rejects non-integer cents', () => {
  assert.throws(() => formatMoney(10.5, 'USD'), TypeError);
});
