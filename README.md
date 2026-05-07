# openemr-client

React + TypeScript + Vite frontend with a small **Express BFF** for OpenEMR OAuth2 and FHIR. **Client secrets never ship to the browser**; the BFF sets an httpOnly cookie after the OAuth callback.

## Prerequisites

- [Bun](https://bun.com) v1.x

## Setup

```bash
bun install
cp .env.example .env
```

Edit `.env` with your OpenEMR base URL and OAuth client credentials.

### Redirect URI (important)

Development uses the **Vite dev server** on port **5173** so cookies and `/api` calls stay same-origin through the proxy.

- Set `REDIRECT_URI` and register the same value in OpenEMR, e.g. `http://localhost:5173/callback`.
- Set `APP_ORIGIN=http://localhost:5173`.

If you previously registered `http://localhost:3000/callback`, update the OpenEMR client registration to the **5173** URL or the OAuth round-trip will fail.

### Security: rotate credentials

If this repository (or any copy) ever contained real `client_id` / `client_secret` values in source control, treat them as **compromised**. Revoke or rotate the client secret in OpenEMR and use only `.env` locally (never commit `.env`).

## Run (development)

Runs the BFF on port **3000** (watch) and Vite on **5173**:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173), click **Login with OpenEMR**, complete OAuth; you should land on **Patients** with FHIR data.

If the patient list works but dashboard clinical cards show sign-in errors, verify the OpenEMR OAuth client registration and user permissions include every dashboard read/search FHIR scope listed in `.env.example`.

### Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `bun run dev`     | BFF + Vite together                  |
| `bun run dev:client` | Vite only                         |
| `bun run dev:server` | BFF only (watch)                  |
| `bun run build`   | Typecheck + production client build  |
| `bun run preview` | Preview production build (client only) |
| `bun run lint`    | ESLint                               |
| `bun run format`  | Prettier (write)                     |
| `bun run typecheck` | `tsc --noEmit` (app + server + node) |
| `bun test`        | Bun test runner                      |

## Project layout

- `src/` — React app (routes, features, shadcn UI under `components/ui`)
- `server/` — OAuth token exchange, FHIR proxy, session cookie
- `public/` — static assets

## OAuth2 dynamic client registration (reference)

```typescript
await fetch("https://your-openemr.example.com/oauth2/default/registration", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    application_type: "private",
    client_name: "OpenEMR Client (local)",
    redirect_uris: ["http://localhost:5173/callback"],
    grant_types: ["authorization_code"],
    token_endpoint_auth_method: "client_secret_post",
    scope:
      "openid api:fhir api:oemr user/Patient.rs user/AllergyIntolerance.rs user/Condition.rs user/MedicationRequest.rs user/CareTeam.rs user/Encounter.rs",
  }),
})
  .then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log("client_id:", data.client_id);
    console.log("client_secret:", data.client_secret);
  })
  .catch((err) => console.error(err.message));
```

## Production notes

- Serve the Vite `dist/` output behind your static host or CDN.
- Run the BFF separately with `NODE_ENV=production`, HTTPS, and `secure: true` cookies.
- Set `APP_ORIGIN` and `REDIRECT_URI` to your real public URLs.
