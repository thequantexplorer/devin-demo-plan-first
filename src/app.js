import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { loadInvoices, listInvoices, getInvoice, summarize } from './invoices.js';
import { parseFilters, FilterError } from './filters.js';

const PUBLIC_DIR = new URL('../public/', import.meta.url);
const STATIC_FILES = { '/': 'index.html', '/app.js': 'app.js', '/styles.css': 'styles.css' };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

export function createApp({ invoices = loadInvoices() } = {}) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const { pathname } = url;

    try {
      if (req.method !== 'GET') {
        return sendJson(res, 405, { error: 'Method not allowed' });
      }

      if (pathname === '/api/health') {
        return sendJson(res, 200, { ok: true });
      }

      if (pathname === '/api/invoices') {
        const list = listInvoices(invoices, parseFilters(url.searchParams));
        return sendJson(res, 200, { invoices: list, summary: summarize(list) });
      }

      const match = pathname.match(/^\/api\/invoices\/([^/]+)$/);
      if (match) {
        const invoice = getInvoice(invoices, decodeURIComponent(match[1]));
        if (!invoice) return sendJson(res, 404, { error: `Invoice not found: ${match[1]}` });
        return sendJson(res, 200, invoice);
      }

      const file = STATIC_FILES[pathname];
      if (file) {
        const body = await readFile(new URL(file, PUBLIC_DIR));
        res.writeHead(200, { 'Content-Type': MIME[extname(file)] });
        return res.end(body);
      }

      return sendJson(res, 404, { error: 'Not found' });
    } catch (err) {
      if (err instanceof FilterError) return sendJson(res, 400, { error: err.message });
      console.error(err);
      return sendJson(res, 500, { error: 'Internal error' });
    }
  });
}
