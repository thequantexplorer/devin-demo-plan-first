const form = document.getElementById('filters');
const rows = document.getElementById('rows');
const summary = document.getElementById('summary');
const error = document.getElementById('error');

const SYMBOLS = { USD: '$', EUR: '€' };

function money(cents, currency) {
  const value = (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${SYMBOLS[currency] ?? `${currency} `}${value}`;
}

function currentQuery() {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

function cell(text, className) {
  const td = document.createElement('td');
  if (className) td.className = className;
  td.textContent = text;
  return td;
}

async function load() {
  const query = currentQuery();
  const res = await fetch(`/api/invoices${query ? `?${query}` : ''}`);
  const body = await res.json();

  error.hidden = res.ok;
  if (!res.ok) {
    error.textContent = body.error;
    return;
  }

  rows.replaceChildren(
    ...body.invoices.map((inv) => {
      const tr = document.createElement('tr');
      const status = cell('');
      const badge = document.createElement('span');
      badge.className = `status ${inv.status}`;
      badge.textContent = inv.status;
      status.append(badge);
      tr.append(
        cell(inv.number),
        cell(inv.customer),
        cell(inv.issueDate),
        cell(inv.dueDate),
        status,
        cell(money(inv.totalCents, inv.currency), 'num'),
      );
      return tr;
    }),
  );

  const totals = Object.entries(body.summary.totalCentsByCurrency)
    .map(([currency, cents]) => money(cents, currency))
    .join(' + ');
  summary.textContent = `${body.summary.count} invoices${totals ? ` · ${totals}` : ''}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  load();
});
form.addEventListener('reset', () => setTimeout(load));

load();
