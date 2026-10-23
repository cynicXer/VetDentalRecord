'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const daysmartRouter = require('./daysmart');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Security headers — CSP disabled so html2canvas inline styles/blobs work
app.use(helmet({ contentSecurityPolicy: false }));

// Gzip compression for all responses
app.use(compression());

// DaySmart Vet API proxy (keeps the clinic secret server-side)
app.use('/api/daysmart', daysmartRouter);

// Static file serving with aggressive cache headers for hashed assets
app.use(
  '/assets',
  express.static(path.join(PUBLIC_DIR, 'assets'), {
    maxAge: '1y',
    immutable: true,
  })
);

// Remaining static files (index.html, favicon, etc.) — short cache
app.use(express.static(PUBLIC_DIR, { maxAge: '5m' }));

// SPA fallback — serve index.html for all non-asset routes
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`VetDental server running on port ${PORT}`);
});
