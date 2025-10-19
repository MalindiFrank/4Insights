## 4Insights

4Insights is a **privacy-first, lightweight web analytics platform** designed to
help small websites track pageviews and basic user interactions without storing
personal data. It allows website owners to understand traffic patterns, top
pages, and engagement metrics in a clear, simple dashboard.

Unlike traditional analytics tools, 4Insights does **not use cookies, does not
track users individually, and avoids storing personal information**. This
ensures compliance with privacy standards and keeps your data collection ethical
and lightweight.

---

### Project Overview

4Insights provides website owners with a simple way to collect and visualize
**aggregate analytics data**. The system focuses on **minimalism, privacy, and
scalability**, making it suitable for small blogs, portfolios, and business
websites.

Core goals:

- Collect basic events like pageviews and clicks.
- Keep all data anonymous and privacy-compliant.
- Provide a lightweight, clear dashboard.
- Ensure the system is modular and expandable for future features.

---

### Features

**Implemented Features:**

- ✅ Track pageviews on any website with a TypeScript/JavaScript snippet.
- ✅ SPA (Single Page Application) support with history API tracking.
- ✅ Dashboard showing total events, pageviews, and top paths.
- ✅ File-based event storage using NDJSON format.
- ✅ CORS-enabled Collector API with validation.
- ✅ Site management via admin endpoints.
- ✅ Demo authentication system with API keys and sessions.
- ✅ Privacy-first: no cookies, no personal data collection.
- ✅ Comprehensive metadata collection (user agent, screen size, timezone,
  etc.).

**Future Features:**

- Event batching for performance optimization.
- Click and custom event tracking.
- CSV export of analytics data.
- Funnel tracking and conversion analytics.
- Role-based site management and team collaboration.
- Webhooks for event notifications.
- Database integration (currently using file storage).
- Production-ready authentication system.

---

### Architecture

4Insights consists of four main components:

1. **Tracker Script**

   - A small TypeScript/JavaScript snippet embedded into websites.
   - Sends pageview events to the Collector API with comprehensive metadata.
   - Uses `sendBeacon` for reliable delivery and supports Single Page
     Applications (SPAs).
   - Auto-initializes when loaded via script tag with `data-key` attribute.

2. **Collector API**

   - A backend service built with Deno 2 using native APIs.
   - Receives event payloads, validates them, and stores them in NDJSON files.
   - Provides endpoints for event collection, metrics aggregation, and site
     management.
   - Includes CORS support and file-based storage for development.

3. **Dashboard**

   - A SvelteKit application for viewing analytics data.
   - Communicates only with the Dashboard Backend (BFF).
   - Shows total events, pageviews, and top paths with real-time refresh
     capability.

4. **Authentication System (Demo)**

   - A lightweight authentication system built with Deno's standard library.
   - Provides API key generation, session management, and token-based
     authentication.
   - Includes in-memory storage with automatic cleanup and CORS support.
   - Ready for integration with the main analytics system.

The system follows a BFF architecture:

```
Tracker → Collector (stores with API key) → Dashboard Backend (validates token, forwards x-api-key) → Dashboard Client
```

---

### Getting Started

#### Prerequisites

- Deno 2
- Node.js (for building SvelteKit dashboard)
- No database required (uses file-based storage for development)

#### Installation

1. Clone the repository:

```bash
git clone https://github.com/MalindiFrank/4Insights.git
cd 4Insights
```

2. Install dependencies for the dashboard:

```bash
cd dashboard
npm install
```

3. Start the Collector API (development mode):

```bash
cd ../collector
deno run --allow-net --allow-read --allow-write main.ts
```

4. Start the Dashboard Backend (BFF):

```bash
cd ../dashboard-backend
DASHBOARD_BACKEND_PORT=8010 AUTH_BASE_URL=http://localhost:8001 \
  COLLECTOR_BASE_URL=http://localhost:8000 \
  deno run --allow-net --allow-env main.ts
```

5. Run the SvelteKit dashboard:

```bash
cd ../dashboard
npm run prepare ( Optional )
npm run dev
```

6. Access the dashboard in your browser:

```
http://localhost:5173
```

---

### Usage

#### Embedding the Tracker

After recieving login credentials from the 4Insights dashboard website, you will
receive a **public site token** i.e `public_abc123`. Embed the following snippet
in your website (entry `html` file / component):

```html
<script
  async
  src="https://4insights.onrender.com/tracker.js"
  data-site="public_abc123"
></script>
```

The `tracker` will `automatically send` pageview events to your Collector API. `No
configuration` is required unless you want to track additional events like clicks
or custom interactions.

#### Viewing Analytics

1. Start the dashboard and collector as described in the Quick Start section.
2. Open the dashboard in your browser at `http://localhost:5173`.
3. The dashboard will automatically display:

   - Total events count
   - Total pageviews count
   - Top paths with view counts
4. Use the refresh button to get updated metrics.

---

### Event Types & Payloads

The tracker currently supports pageview events with the following structure:

```json
{
  "type": "pageview",
  "userId": "id-abc123",
  "sessionId": "id-def456",
  "page": "Home Page",
  "referrer": "https://google.com",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "language": "en-US",
  "screen": "1366x768",
  "timezone": "America/New_York",
  "metadata": {
    "url": "http://localhost:5173/",
    "path": "/",
    "host": "localhost:5173",
    "hash": "",
    "query": "",
    "routeParams": {}
  }
}
```

Currently supported event types:

- **pageview** – triggered when a page loads or route changes in SPAs.

Future event types (not yet implemented):

- **click** – triggered when a user interacts with a page element.
- **custom** – optional, developer-defined events.

All events are **anonymous**, and any extra metadata should **not include
personal information**.

---

### Data Storage

**Current Implementation (File-based)**

The system currently uses file-based storage for development:

- **Events**: Stored in `collector/data/events.ndjson` (Newline Delimited JSON)
- **Sites**: Stored in `collector/data/sites.json` (JSON array)

**Future Database Structure**

When migrated to a database, the structure will include:

**Sites Table**

- `id` – Primary key
- `name` – Name of the website
- `public_token` – Token used by tracker
- `retention_days` – Data retention period
- `created_at` – Timestamp

**Events Table**

- `id` – Primary key
- `site_id` – Foreign key to site
- `type` – Event type
- `path` – Page path
- `referrer` – Optional referrer
- `screen_w` / `screen_h` – Screen size
- `meta` – Optional JSON metadata
- `timestamp` – Event time
- `received_at` – Server receipt time

---
### Repo Layout

```
collector/
  main.ts                 # Deno 2 HTTP server with CORS support
  types.ts                # Shared types for events and metrics
  utils/
    storage.ts            # File-based event storage (NDJSON) with metrics aggregation
    validator.ts          # Runtime validation for incoming events
  routes/                 # Modular route handlers
    admin.ts              # Site management endpoints
    batch.ts              # Batch event collection
    collect.ts            # Event collection endpoint
    metrics.ts            # Metrics aggregation endpoint
  tests/
    collector.test.ts     # Basic collector tests
  data/                   # File-based data storage
    events.ndjson         # Event data (append-only)
    sites.json            # Site configuration

tracker/
  index.ts                # TypeScript tracker with SPA support
  types.ts                # Tracker-specific types and interfaces
  build/
    tracker.js            # Built tracker bundle for browsers
  tests/
    tracker.test.ts       # Tracker functionality tests

dashboard/                # SvelteKit application
  src/
    routes/
      +page.svelte        # Main dashboard with metrics display
      +layout.svelte      # App layout
      about/              # About page
      sverdle/            # Demo game (SvelteKit example)
  package.json            # SvelteKit dependencies
  README.md               # Dashboard-specific documentation

auth/                     # Authentication system
  demo/                   # Demo authentication implementation
    server/
      main.ts             # Auth server with Deno.serve
      CredentialService.ts # API key and credential management
      SessionService.ts   # Token generation and validation
      AuthMiddleware.ts   # HTTP authentication middleware
      types.ts            # Server-specific types
      utils/
        Config.ts         # Configuration management
        InMemoryCredentialStorage.ts # Temporary storage
      tests/
        auth.test.ts      # Integration tests
    client/
      components/
        demo.html         # Interactive demo client
    README.md             # Auth system documentation
  proper/                 # Future production auth system
    coming-soon/
  shared/
    interfaces/
      types.ts            # Shared authentication interfaces

deno.json                 # Deno configuration and tasks
.gitignore               # Git ignore patterns
```

### Collector Endpoints

- `POST /4insights/collect` — Accepts an array of events (e.g., pageviews)
- `POST /4insights/batch` — Alias for `/4insights/collect` (batch processing)
- `GET /4insights/metrics` — Basic overview metrics (total events, total pageviews, top paths)
- `POST /4insights/admin/sites` — Create new sites (admin endpoint)
- `OPTIONS` — CORS preflight support for all endpoints

Example request body for `/4insights/collect`:

```json
[
  {
    "type": "pageview",
    "userId": "id-abc",
    "sessionId": "id-def",
    "page": "Home",
    "referrer": "",
    "timestamp": "2025-10-15T12:00:00.000Z",
    "userAgent": "Mozilla/5.0 ...",
    "language": "en-US",
    "screen": "1366x768",
    "timezone": "UTC",
    "metadata": {
      "url": "http://localhost:5173/",
      "path": "/",
      "host": "localhost:5173",
      "hash": "",
      "query": "",
      "routeParams": {}
    }
  }
]
```

### Tracker Usage

Embed the built tracker and pass your API key:

```html
<script src="/tracker.js" data-key="123abc" async></script>
```

Or initialize manually:

```html
<script>
  new InsightTracker({ apiKey: '123abc', endpoint: 'http://localhost:8000/4insights/collect' });
  // For local dev, ensure CORS or load tracker from the same origin as collector
  // Default endpoint is "/4insights/collect"
  // The collector exposes metrics at "/4insights/metrics"
  // Start collector with:
  //   deno run --allow-net --allow-read --allow-write collector/main.ts
  // Then open your app and include the script above.
  // Navigate around to see pageview events recorded.
  // Query metrics at http://localhost:8000/4insights/metrics
}</script>
```
### How to Run (Quick Start)

1) Start the Collector (Deno 2):

```bash
deno run --allow-net --allow-read --allow-write collector/main.ts
```

The collector listens on `http://localhost:8000` and exposes:
- `POST /4insights/collect` (and `/4insights/batch`) to receive events
- `GET /4insights/metrics` for aggregated metrics
- `POST /4insights/admin/sites` to create a site (name in JSON)

2) Run the Dashboard (SvelteKit):

```bash
cd dashboard
npm install
npm run dev
# open http://localhost:5173
```

The homepage fetches metrics from the BFF at `http://localhost:8010/dashboard/metrics`.

3) Use the Tracker on a web page:

Option A (auto-init via script tag):

```html
<script src="/tracker.js" data-key="public_demo" async></script>
```

Option B (manual init in your app):

```html
<script type="module">
  import { InsightTracker } from '/path/to/tracker/index.ts';
  new InsightTracker({ apiKey: 'public_demo', endpoint: 'http://localhost:8000/4insights/collect' });
</script>
```

4) Start the Auth Demo Server (Optional):

```bash
cd auth/demo/server
deno run --allow-net --allow-env main.ts
```

The auth server runs on `http://localhost:8001` and provides:
- `POST /demo/credentials` to generate API keys
- `POST /demo/sessions` to create authentication sessions
- `GET /demo/verify` to verify tokens
- `DELETE /demo/sessions` to logout

Test the auth system:
```bash
deno run --allow-net --allow-env auth/demo/server/tests/auth.test.ts
```

Note: The provided `tracker/build/tracker.js` is a ready-to-use browser bundle snapshot. You may also bundle `tracker/index.ts` yourself using your preferred build tool.

### Developer Workflow (Project Requirements)

- Keep interfaces and types in a dedicated `types.ts` within each directory.
- Add clear, beginner-friendly docstrings and comments.
- Commit in small, descriptive chunks after each functional change.
- Always run formatting, type-checks, and builds after changes:

```bash
# Format and Deno type-check (collector)
deno fmt && deno check collector/ tracker/ auth/

# Dashboard check/build
cd dashboard && npm run check && npm run build
```
---

<!-- ### Roadmap

**Phase 1 (MVP)**

* Pageview tracking
* Collector API for single events
* SvelteKit dashboard for site analytics
* CSV export

**Phase 2 (Next)**

* Batch event submission
* Rate limiting and sampling
* Advanced dashboard features (funnels, sessions)

**Phase 3 (Future/Premium)**

* Team management and role-based access
* Webhooks and notifications
* Billing, quotas, and self-hosted deployment

--- -->

### Contributing

Contributions are encouraged! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name-here`)
3. Commit your changes (`git commit -m "Add a descriptive msg here"`)
4. Push to your branch (`git push origin feature-name-here`)
5. Create a pull request

Please respect the **privacy-first principles** when adding features.

---

### License

This project is semi-open source and available under the **MIT License**. You
may use, modify, and distribute it freely, while maintaining attribution.

---
