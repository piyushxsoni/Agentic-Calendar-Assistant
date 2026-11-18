# Agentic Calendar Assistant

Next.js (3000) + Express/Mastra backend (4000) + PostgreSQL (5442). Auth and Google Calendar access go through Descope (Outbound App); Gemini is the default model.

## Setup (Windows PowerShell)
```powershell
Copy-Item backend\.env.example backend\.env      # then fill in values locally
Copy-Item frontend\.env.example frontend\.env
npm install; npm --prefix backend install; npm --prefix frontend install
docker compose up -d                              # postgres:16-alpine, container agentic-calendar-app
npm run migrate
npm --prefix backend run diagnose                 # PASS/FAIL for env, DB, Descope outbound app ID
npm run dev                                       # backend :4000, frontend :3000
```
Health: `Invoke-RestMethod http://localhost:4000/health`

## Descope Console
1. Authentication > Flows: a flow with id `sign-up-or-in` must exist.
2. Outbound Apps > create/choose **Google Calendar**; paste your Google OAuth client ID/secret. The app's **ID** must equal `DESCOPE_CALENDAR_CONNECTION_ID`.
3. Add scopes `calendar.events` and `calendar.freebusy` to the app.
4. Company > Management Keys: create a key for `DESCOPE_MANAGEMENT_KEY`.

## Google Cloud Console
1. Enable **Google Calendar API**. 2. OAuth consent screen: add the scopes above and your Google account as a test user. 3. Credentials > OAuth client ID (Web). Add the redirect URI shown in the Descope Outbound App settings.

## Variables
See `backend/.env.example` and `frontend/.env.example`. Only `NEXT_PUBLIC_*` values reach the browser; the management key and Google client secret never do.
