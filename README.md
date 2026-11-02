# Ledgerly invoices

A small invoices app: a JSON API and one web page where you can list and filter invoices.
It has no dependencies. It needs Node.js 20 or newer.

```sh
npm test    # runs the tests with node --test
npm start   # http://localhost:3000
```

## API

| Endpoint | What it returns |
| --- | --- |
| `GET /api/health` | `{ "ok": true }` |
| `GET /api/invoices` | `{ invoices, summary }`. Optional filters: `status`, `customer`, `from`, `to` (dates like `2026-10-01`) |
| `GET /api/invoices/:id` | One invoice with `subtotalCents`, `taxCents` and `totalCents` |

A bad filter returns `400` with `{ "error": "..." }`.

## Code

| Path | What it does |
| --- | --- |
| `src/server.js` | Starts the server |
| `src/app.js` | Routes and static files |
| `src/invoices.js` | Loads, filters and totals invoices |
| `src/filters.js` | Checks the query string filters |
| `src/money.js` | Formats cents for display |
| `src/data/invoices.json` | Seed data |
| `public/` | The web page |
| `test/` | Tests |
| `docs/` | Feature requests |

All money is stored as integer cents.

---

This repo is a starter for a Devin workshop lab. See [DEVIN_DEMO.md](DEVIN_DEMO.md) for the steps and the prompt.
