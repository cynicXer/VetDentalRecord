'use strict';

/**
 * DaySmart Vet (Vetter Software) API proxy.
 *
 * The clinic credentials NEVER reach the browser — they live only in these
 * server-side env vars. This module performs the OAuth2 client_credentials
 * handshake, caches the bearer token, and forwards client lookups.
 *
 * Required env vars (see server/.env.example):
 *   DAYSMART_BASE_URL       stage root, e.g. https://<host>/sandbox  (or /api for prod)
 *   DAYSMART_CLIENT_ID      OAuth client id
 *   DAYSMART_CLIENT_SECRET  OAuth client secret — also sent as the  x-api-key  header
 *   DAYSMART_API_KEY        the {apiKey} path segment for your clinic
 *
 * Flow:
 *   POST {BASE}/oauth/access_token           -> { access_token, expires_in }
 *   GET  {BASE}/api/1.0.0/{apiKey}/clients   with Authorization: Bearer + x-api-key
 */

const express = require('express');

const router = express.Router();

const CONFIG = {
  baseUrl: (process.env.DAYSMART_BASE_URL || '').replace(/\/+$/, ''),
  clientId: process.env.DAYSMART_CLIENT_ID || '',
  clientSecret: process.env.DAYSMART_CLIENT_SECRET || '',
  apiKey: process.env.DAYSMART_API_KEY || '',
};

function isConfigured() {
  return Boolean(CONFIG.baseUrl && CONFIG.clientId && CONFIG.clientSecret && CONFIG.apiKey);
}

// ── Bearer token cache ──────────────────────────────────────────────
let tokenCache = { value: '', expiresAt: 0 };

async function getToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && tokenCache.value && now < tokenCache.expiresAt) {
    return tokenCache.value;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CONFIG.clientId,
    client_secret: CONFIG.clientSecret,
    scope: 'APIService',
  });

  const res = await fetch(`${CONFIG.baseUrl}/oauth/access_token`, {
    method: 'POST',
    headers: {
      'x-api-key': CONFIG.clientSecret,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`OAuth token request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = JSON.parse(text);
  const expiresInMs = (Number(json.expires_in) || 3600) * 1000;
  tokenCache = {
    value: json.access_token,
    // Refresh 60s early to avoid using a token that expires mid-request.
    expiresAt: now + expiresInMs - 60_000,
  };
  return tokenCache.value;
}

// ── Response shaping ────────────────────────────────────────────────
// Trim the fat DaySmart client/patient objects to only what the chart form needs.
function shapeClient(client) {
  const patients = Array.isArray(client.patients) ? client.patients : [];
  return {
    id: client.id,
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    email: client.email || '',
    patients: patients
      .filter(p => !p.isDeleted)
      .map(p => ({
        id: p.id,
        name: p.name || '',
        speciesLabel: p.species && p.species.label ? p.species.label : '',
        breed: Array.isArray(p.breeds) && p.breeds.length
          ? p.breeds.map(b => b.label).filter(Boolean).join(' / ')
          : '',
        birthdate: p.birthdate || '',
        sexLabel: p.sex && p.sex.label ? p.sex.label : '',
      })),
  };
}

// Perform an authenticated GET, refreshing the token once on a 401.
async function authedGet(url) {
  let token = await getToken();
  let res = await fetch(url, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'x-api-key': CONFIG.clientSecret },
  });
  if (res.status === 401) {
    token = await getToken(true);
    res = await fetch(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'x-api-key': CONFIG.clientSecret },
    });
  }
  return res;
}

/**
 * GET /api/daysmart/clients?q=<lastName fragment>
 * Returns { clients: [...] } shaped for the chart form.
 */
router.get('/clients', async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({
      error: 'DaySmart API is not configured. Set DAYSMART_BASE_URL, DAYSMART_CLIENT_ID, DAYSMART_CLIENT_SECRET and DAYSMART_API_KEY.',
    });
  }

  const q = String(req.query.q || '').trim();
  if (q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters.' });
  }

  const url = new URL(`${CONFIG.baseUrl}/api/1.0.0/${CONFIG.apiKey}/clients`);
  url.searchParams.set('where', `lastName,like,%${q}%`);
  url.searchParams.set('orderBy', 'lastName,asc');
  url.searchParams.set('perPage', '25');

  try {
    const upstream = await authedGet(url);
    const text = await upstream.text();

    if (!upstream.ok) {
      console.error(`DaySmart upstream ${upstream.status}: ${text.slice(0, 500)}`);
      return res.status(502).json({ error: `DaySmart API error (${upstream.status}).` });
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'DaySmart API returned a non-JSON response.' });
    }

    // Real shape: { response: { resources: [...], meta: {...} } }.
    const list = (body.response && body.response.resources)
      || body.resources || body.data || (Array.isArray(body) ? body : []);
    return res.json({ clients: list.map(shapeClient) });
  } catch (err) {
    console.error('DaySmart proxy request failed:', err);
    return res.status(502).json({ error: 'Could not reach the DaySmart API.' });
  }
});

module.exports = router;
