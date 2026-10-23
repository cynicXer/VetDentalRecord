'use strict';

/**
 * Firebase Cloud Function hosting the DaySmart Vet proxy in production.
 *
 * Firebase Hosting is static-only, so Hosting rewrites /api/daysmart/** here
 * (see firebase.json). The router itself is server/daysmart.js, copied into
 * this directory by the functions predeploy step so the Express server and
 * the function share one implementation.
 *
 * Credentials are Cloud Secret Manager secrets, exposed as env vars at runtime:
 *   firebase functions:secrets:set DAYSMART_CLIENT_ID
 *   firebase functions:secrets:set DAYSMART_CLIENT_SECRET
 *   firebase functions:secrets:set DAYSMART_API_KEY
 */

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const express = require('express');

// Not a secret — default to the production stage unless overridden.
process.env.DAYSMART_BASE_URL ||= 'https://ulimfxq67h.execute-api.us-west-2.amazonaws.com/api';

const daysmartRouter = require('./daysmart');

const secrets = [
  defineSecret('DAYSMART_CLIENT_ID'),
  defineSecret('DAYSMART_CLIENT_SECRET'),
  defineSecret('DAYSMART_API_KEY'),
];

const app = express();
// Patient/client lookups must never be cached by the Hosting CDN.
app.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});
app.use('/api/daysmart', daysmartRouter);

exports.daysmart = onRequest(
  {
    region: 'us-central1',
    secrets,
    maxInstances: 2,
    memory: '256MiB',
  },
  app
);
