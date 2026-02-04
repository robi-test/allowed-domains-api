const fetch = require('node-fetch');
const cheerio = require('cheerio');

const LIST_URL = 'https://digital.nhs.uk/services/care-identity-service/applications-and-services/apply-for-care-id/care-identity-email-domain-allow-list';

async function fetchPage() {
  const res = await fetch(LIST_URL, { headers: { 'User-Agent': 'allowed-domain-api/0.1' } });
  if (!res.ok) throw new Error('Failed to fetch list: ' + res.status);
  return res.text();
}

function parseDomains(html) {
  const $ = cheerio.load(html);
  // The page lists domains as bullet list items starting with a bullet char (•) inside sections.
  // We'll collect all text nodes that look like @domain or patterns like "all addresses ending with ..."
  const domains = new Set();

  $('body').find('li, p, div').each((i, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    // split by line breaks and bullets
    text.split(/\r?\n|•|\u2022/).forEach(part => {
      const t = part.trim();
      if (!t) return;
      // match patterns like @domain, all addresses ending with domain, or domain alone
      const mAt = t.match(/@?([A-Za-z0-9._\-]+\.[A-Za-z0-9._\-]+)/);
      const mAll = t.match(/all addresses ending with\s+(?:with\s+)?([A-Za-z0-9._\-]+)/i);
      if (mAt) domains.add(normalizeDomain(mAt[1]));
      else if (mAll) domains.add(normalizeDomain(mAll[1]));
    });
  });

  return Array.from(domains).sort();
}

function normalizeDomain(d) {
  // strip leading @ and surrounding chars, lower-case
  return d.replace(/^@/, '').toLowerCase();
}

async function getAllowedDomains() {
  const html = await fetchPage();
  return parseDomains(html);
}

module.exports = { getAllowedDomains, parseDomains, fetchPage };
