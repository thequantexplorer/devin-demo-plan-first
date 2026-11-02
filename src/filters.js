import { STATUSES } from './invoices.js';

export class FilterError extends Error {}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Turns URLSearchParams from /api/invoices?status=&customer=&from=&to= into a
// filters object. Throws FilterError for bad input (the API answers 400).
export function parseFilters(params) {
  const filters = {};

  const status = params.get('status');
  if (status) {
    if (!STATUSES.includes(status)) {
      throw new FilterError(`status must be one of ${STATUSES.join(', ')}`);
    }
    filters.status = status;
  }

  const customer = params.get('customer')?.trim();
  if (customer) filters.customer = customer;

  for (const key of ['from', 'to']) {
    const value = params.get(key);
    if (!value) continue;
    if (!DATE.test(value) || Number.isNaN(Date.parse(value))) {
      throw new FilterError(`${key} must be a date like 2026-10-01`);
    }
    filters[key] = value;
  }

  if (filters.from && filters.to && filters.from > filters.to) {
    throw new FilterError('from must be on or before to');
  }

  return filters;
}
