const express = require('express');
const { getAllowedDomains } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache for a short time to avoid hammering the NHS site
let cache = { ts: 0, domains: [] };
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

app.get('/domains', async (req, res) => {
  try {
    const q = (req.query.search || '').toLowerCase().trim();

    const now = Date.now();
    if (!cache.domains.length || now - cache.ts > CACHE_TTL) {
      cache.domains = await getAllowedDomains();
      cache.ts = now;
    }

    if (q) {
      const found = cache.domains.filter(d => d === q || d.endsWith(q) || q.endsWith(d) || d.includes(q));
      return res.json({ count: found.length, results: found });
    }

    res.json({ count: cache.domains.length, results: cache.domains });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ ok: true, info: 'Use /domains?search=domain.com' }));

app.listen(PORT, () => console.log(`AllowedDomainAPI listening on ${PORT}`));
