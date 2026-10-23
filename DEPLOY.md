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
