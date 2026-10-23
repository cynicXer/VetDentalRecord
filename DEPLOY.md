# Deployment

The app is hosted on **Firebase Hosting** (project: `dentalchart-bc935`).
Firebase serves the built React client from `server/public/` as a static SPA.

## Redeploy (standard)

```bash
# 1. Build the React client
npm run build

# 2. Push to Firebase Hosting
firebase deploy --only hosting
```

## DaySmart lookup (Cloud Function)

Hosting is static, so `/api/daysmart/**` is rewritten to the `daysmart` Cloud
Function (`functions/index.js`, region `us-central1`). It reuses
`server/daysmart.js`, which the functions predeploy step copies into
`functions/`. Requires the project to be on the **Blaze** plan.

One-time: store the credentials in Cloud Secret Manager (same values as `server/.env`):

```bash
firebase functions:secrets:set DAYSMART_CLIENT_ID
firebase functions:secrets:set DAYSMART_CLIENT_SECRET
firebase functions:secrets:set DAYSMART_API_KEY
```

Deploy the function (only needed when `server/daysmart.js` or `functions/` change):

```bash
firebase deploy --only functions,hosting
```

The base URL defaults to the production stage (`.../api`) in `functions/index.js`.

## Prerequisites (first-time / new machine)

```bash
npm install -g firebase-tools
firebase login
firebase use dentalChart
```

## Local development

```bash
npm run install:all   # install client + server deps (first time only)
npm run dev           # Vite dev server at http://localhost:5173
```
