# GreenCommute

A working full-stack commute comparison and personal impact tracker built with Next.js 16, React 19, Express 5, and MongoDB.

## Run locally

Requires Node.js **20.19+** (Node 22 recommended), npm, and internet access for dependency installation. From the repository root:

```sh
npm ci
npm run setup
npm run dev
```

Open **http://localhost:3000**. Create an account, open **Plan a trip**, compare a journey, and log the mode you actually completed. **My impact** shows your totals, milestones, and trip history.

The development launcher creates `backend/.env` and `frontend/.env` from their examples only when missing. It starts both servers. By default, `DEMO_MODE=true` explicitly starts temporary MongoDB; first run downloads a MongoDB binary (about 123 MB). The app displays a demo banner. **Accounts and trips disappear when the backend stops.** No seeded accounts or passwords exist.

For persistent storage, set `MONGODB_URI` in `backend/.env` to a local MongoDB instance or Atlas connection string. Localhost URIs are respected. Set `DEMO_MODE=false`. If neither a URI nor explicit demo mode is provided, the API refuses to start.

To run servers separately:

```sh
# Terminal 1
cd backend
cp .env.example .env
npm run dev

# Terminal 2, from repo root
cd frontend
cp .env.example .env
npm run dev
```

## What works

- Registration, login, logout, HttpOnly cookie sessions, protected planning and history.
- Server-side location lookup and road-distance retrieval using Nominatim and OSRM.
- A known-distance option for offline-provider comparisons; no synthetic distances generated from place names.
- Four travel-mode comparisons, sorting by carbon or time, and clearly labeled assumptions.
- Signed, user-bound comparisons valid for two hours. The API ignores client-provided carbon totals.
- Completed trip logging, unique comparison IDs to prevent duplicate submissions, account-isolated history, and deletion with confirmation.
- Impact totals calculated from recorded trips; active days counted in UTC. Eco points and four achievement milestones.
- Responsive desktop/mobile layouts, keyboard focus states, form labels, visible errors, and loading/empty states.
- Integration tests and GitHub Actions for lint, tests, and production build.

## What the numbers mean

This is a **planning and self-reporting MVP**, not a live navigation service or verified carbon-offset product.

OSRM supplies a **driving road distance** and estimated driving duration. Other modes use that distance for comparison; walking, cycling and transit may have different routes. We do not claim that a transit service exists or that a driving route is safe for pedestrians/cyclists. Confirm a route in a navigation app before traveling. Full resolved location names appear above results so you can check the matched places.

Manual mode uses the distance entered by the user. Provider failures are shown as errors; the app never quietly invents a route.

Illustrative assumptions, deliberately disclosed in the planner:

| Mode             | kg CO₂ / passenger-km |                         Estimated speed |
| ---------------- | --------------------: | --------------------------------------: |
| Driving alone    |                 0.171 | OSRM duration or 30 km/h in manual mode |
| Public transport |                 0.060 |             20 km/h plus 10-minute wait |
| Cycling          |  0 tailpipe emissions |                                 15 km/h |
| Walking          |  0 tailpipe emissions |                                  5 km/h |

These are configurable planning assumptions in `backend/services/routing.js`, not audited emission factors. Vehicle type, occupancy, electricity mix, route, terrain and lifecycle emissions are not modeled. Saved CO₂ is relative to driving alone. Eco points equal estimated saved kg × 100, rounded per trip; they have no monetary value. Trips are self-reported. Repeating a newly calculated journey is allowed; there is no GPS verification.

## Location services

Location queries leave the application and are sent to configured providers. The public Nominatim service is used only on explicit search submission, cached for 24 hours (up to 500 locations), and serialized to at most one request every 1.1 seconds per API process. Attribution is visible in the footer.

Read the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/) and [OSRM documentation](https://project-osrm.org/docs/). Public services have no availability guarantee. For a deployed or multi-instance service, use an appropriate hosted/self-hosted geocoder and routing provider; centralize caching and rate limiting. Set `GEOCODER_URL`, `ROUTER_URL`, and `GEOCODER_USER_AGENT` as appropriate.

## Configuration

| Variable       | Location | Purpose                                                                                        |
| -------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `MONGODB_URI`  | backend  | Persistent database connection                                                                 |
| `DEMO_MODE`    | backend  | Explicit temporary local database; prohibited in production without a URI                      |
| `JWT_SECRET`   | backend  | At least 32 random characters required in production; development generates a temporary secret |
| `FRONTEND_URL` | backend  | Allowed browser origin; defaults to `http://localhost:3000`                                    |
| `PORT`         | backend  | API port, default `5000`                                                                       |
| `API_URL`      | frontend | Internal API origin, default `http://127.0.0.1:5000`; used by Next.js rewrites                 |

Generate a secret using `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Never commit `.env` files.

## Production

1. Provision persistent MongoDB and an API host. Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and the exact HTTPS `FRONTEND_URL`.
2. Set frontend `API_URL` to the reachable backend origin **before building**. Browser requests use same-origin `/api`; no localhost URLs are shipped to the browser.
3. Run `npm run build` in `frontend`, then `npm start`. Start the backend with `npm start` in `backend`.
4. Use HTTPS because production session cookies are Secure. Keep the API behind the application proxy/private networking where possible.
5. Configure production-capacity location providers and a shared abuse-control store before scaling to multiple processes. Current rate limiting is deliberately single-process and uses the direct peer address (no untrusted proxy headers).

Deploy both services; this frontend cannot be exported as a static-only site because it proxies API requests. OAuth, password reset/email delivery, real-time traffic, live transit timetables, and GPS trip verification are not implemented or advertised as working.

## Validation

```sh
npm run lint
npm test
npm run build
# or all three:
npm run check
```

Tests start isolated temporary MongoDB and HTTP servers. They cover registration validation, login, protected routes, forged comparisons, arbitrary carbon values, duplicate and concurrent submissions, account isolation, history deletion, totals, and cross-origin rejection. They do not depend on live location provider availability. The first test run requires a MongoDB binary download.

## Layout

```text
backend/
  app.js                 Express middleware and API registration
  server.js              Database-first startup and shutdown
  config/                Database lifecycle and signing secret
  controllers/           Authentication, comparisons, trip history
  middleware/auth.js     Cookie/Bearer session verification
  models/                User and Trip schemas
  services/              Routing providers, assumptions, impact aggregation
  test/                  API integration and provider tests
frontend/
  src/app/               Home, authentication, planner, impact/history
  src/components/        Shared auth form, navigation, session, guard
  src/lib/api.ts         Typed API client and error handling
scripts/dev.mjs          Local two-server launcher
.github/workflows/ci.yml CI checks
```

MIT licensed. See [LICENSE](LICENSE).
