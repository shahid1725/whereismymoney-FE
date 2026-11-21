# Where Is My Money?

A production-oriented React Progressive Web App for the existing Django REST Framework expense-tracker API. It provides authenticated account, category, transaction and budget management plus client-calculated financial dashboards.

## Requirements

- Node.js 22 or newer
- The Django API running at `http://127.0.0.1:8000` for local development

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

`VITE_API_URL` is the only API origin setting. Leave it empty locally to use Vite's `/api` and `/media` proxies. Set it to the deployed API origin for production builds, for example `https://whereismymoney-xsg2.vercel.app`. Vite injects this value at build time, so redeploy the frontend after changing it in Vercel.

## Commands

```bash
npm run dev          # local development server
npm run typecheck    # strict TypeScript validation
npm test             # Vitest and React Testing Library
npm run e2e          # Playwright critical flow (requires API/test data support)
npm run build        # typecheck and production PWA build
npm run preview      # preview the production build
```

## Authentication and offline behavior

- Access and refresh tokens are held by one token service and never placed in URLs or logs.
- The Axios client attaches access tokens, performs one shared refresh for simultaneous 401 responses, retries the original requests, and clears the local session when refresh fails.
- The service worker caches only the application shell and public static assets. `/api` responses are explicitly excluded from navigation fallback and are not runtime-cached.
- The shell remains available offline. Mutations are blocked with a clear message and resume automatically when connectivity returns.

## Backend limitations

- The supplied API has no analytics endpoints. Dashboard totals and charts are pure client-side calculations over the account, category, transaction and budget lists. Large datasets or paginated list responses may require backend summary endpoints later.
- Account balances are derived from transactions because the documented account response has no balance field.
- Category and overall budget progress is calculated from transactions for the selected month.
- The API contract includes client-side logout only; there is no server token-revocation endpoint in the supplied backend contract.
- List endpoints may return either plain arrays or DRF `{ "results": [] }` pagination shapes. Only the current returned page can be calculated if server pagination is enabled without a way to request all pages.
- Registration response tokens were not specified. Registration therefore redirects to login instead of assuming undocumented token fields.
- `/api/auth/me/` is currently read-only and the backend user model has no profile image field. Profile photo, display name and contact email personalization is therefore stored per user in the current browser and is clearly labeled as device-local; it does not change the server login identity.
- CSV and JSON reports are generated entirely in the browser from the list endpoints. The exported scope has the same pagination limitation as dashboard calculations.
