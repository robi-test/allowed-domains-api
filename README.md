# Allowed Domain API

Small Node.js API that scrapes the NHS Care Identity email domain allow list and exposes it as JSON.

Usage

1. Install dependencies:

```powershell
npm install
```

2. Run:

```powershell
npm start
```

3. Endpoints:

- `GET /domains` — returns full list as JSON
- `GET /domains?search=example.com` — searches for a domain, exact or partial match

Notes

- The service caches results for 5 minutes.
- This scraper is basic and may need updates if the NHS page structure changes.
