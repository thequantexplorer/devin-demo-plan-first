# Feature request: export invoices as CSV

**From:** Finance team
**Status:** Not started

## Why

At month end, finance copies the invoices table into a spreadsheet by hand.
They want a file they can open in Excel or Google Sheets instead.

## What we want

1. A new endpoint: `GET /api/invoices/export.csv`.
   - It takes the same filters as `GET /api/invoices`: `status`, `customer`, `from`, `to`.
   - It returns the same invoices, in the same order.
   - A bad filter gets the same `400` JSON error as `GET /api/invoices`.
2. The response is a download:
   - `Content-Type: text/csv; charset=utf-8`
   - `Content-Disposition: attachment; filename="invoices.csv"`
3. The file has one header row, then one row per invoice, with these columns in this order:

   | Column | Example |
   | --- | --- |
   | `number` | `INV-1001` |
   | `customer` | `Acme Corp` |
   | `issue_date` | `2026-07-01` |
   | `due_date` | `2026-07-31` |
   | `status` | `paid` |
   | `currency` | `USD` |
   | `subtotal` | `5100.00` |
   | `tax` | `420.75` |
   | `total` | `5520.75` |

   - Amounts are plain numbers with two decimals: no currency symbol, no thousands separator.
   - If no invoices match, the file still has the header row.
4. The file must open correctly in a spreadsheet:
   - Follow RFC 4180. A value that contains a comma, a double quote or a line break is wrapped in double quotes, and any double quote inside it is doubled.
   - Lines end with `\r\n`.
   - Some customer names come from a public signup form. A value that starts with `=`, `+`, `-` or `@` must be prefixed with a single quote (`'`) so the spreadsheet does not run it as a formula.
5. On the invoices page, an **Export CSV** button next to **Apply** downloads the file for the filters currently in the form.
6. Tests for the new endpoint and the CSV rules, and the endpoint is listed in the README.

## Today

The endpoint does not exist. With the app running:

```console
$ curl -i http://localhost:3000/api/invoices/export.csv
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"error":"Invoice not found: export.csv"}
```
