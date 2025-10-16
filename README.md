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

**MVP Features:**

- Track pageviews on any website with a small JS snippet.
- Optional click and custom event tracking.
- Dashboard showing total pageviews, top pages, top referrers, and recent
  events.
- CSV export of analytics data.
- Privacy-first: no cookies, no personal data collection, optional geo disabled
  by default.

**Future Features:**

- Event batching for performance optimization.
- Funnel tracking and conversion analytics.
- Role-based site management and team collaboration.
- Webhooks for event notifications.

---

### Architecture

4Insights consists of three main components:

1. **Tracker Script**

   - A small JavaScript snippet embedded into the website.
   - Sends events such as pageviews and clicks to the Collector API.
   - Uses `sendBeacon` for reliable delivery and respects the browser’s Do Not
     Track settings.

2. **Collector API**

   - A backend service built with Deno.
   - Receives event payloads, validates them, and stores them in a lightweight
     database.
   - Provides endpoints for batch submission, admin configuration, and analytics
     aggregation.

3. **Dashboard**

   - A SvelteKit application for site owners to view analytics.
   - Fetches aggregated data from the Collector API and displays it in charts,
     tables, and summaries.

The system is modular, meaning each component can be extended or replaced
independently as needed.

---

### Getting Started

#### Prerequisites

- Deno 2
- Node.js (for building SvelteKit dashboard)
- SQLite - ? - (or any preferred database for production)

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

4. Run the SvelteKit dashboard:

```bash
cd ../dashboard
npm run prepare ( Optional )
npm run dev
```

5. Access the dashboard in your browser:

```
http://localhost:5173
```

---

### Usage

#### Embedding the Tracker

After creating a site in the dashboard, you will receive a **public site
token**. Embed the following snippet in your website:

```html
<script
  async
  src="https://4insights.onrender.com/tracker.js"
  data-site="public_abc123"
></script>
```

The tracker will automatically send pageview events to your Collector API. No
configuration is required unless you want to track additional events like clicks
or custom interactions.

#### Viewing Analytics

1. Log in to the dashboard.
2. Select the site you want to view.
3. Explore:

   - Overview metrics (total pageviews, daily trends)
   - Top pages and referrers
   - Recent events
4. Export data in CSV format if needed.

---

### Event Types & Payloads

All events share a base payload structure:

```json
{
  "site_token": "public_abc123",
  "type": "pageview",
  "path": "/home",
  "referrer": "https://google.com",
  "screen": { "width": 1366, "height": 768 },
  "timestamp": "2025-10-06T13:00:00Z",
  "meta": {}
}
```

Supported event types:

- **pageview** – triggered when a page loads.
- **click** – triggered when a user interacts with a page element.
- **custom** – optional, developer-defined events.

All events are **anonymous**, and any extra metadata should **not include
personal information**.

---

### Database Structure

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
  main.ts                 # Deno HTTP server exposing /4insights/collect and /4insights/metrics
  types.ts                # Shared types for events and metrics
  utils/
    storage.ts            # File-based event storage (NDJSON)
    validator.ts          # Runtime validation for incoming events
  db/
    schema.sql            # Placeholder for future DB schema (not used by file store)

tracker/
  index.ts                # TypeScript tracker (auto-initializes if script tag has data-key)
  build/tracker.js        # Built tracker bundle (example)

dashboard/                # SvelteKit app (skeleton)
```

### Collector Endpoints

- `POST /4insights/collect` — Accepts an array of events (e.g., pageviews)
- `GET /4insights/metrics` — Basic overview metrics (total events, total pageviews, top paths)

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

The homepage fetches metrics from `http://localhost:8000/4insights/metrics`.

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

Note: The provided `tracker/build/tracker.js` is a ready-to-use browser bundle snapshot. You may also bundle `tracker/index.ts` yourself using your preferred build tool.

### Developer Workflow (Project Requirements)

- Keep interfaces and types in a dedicated `types.ts` within each directory.
- Add clear, beginner-friendly docstrings and comments.
- Commit in small, descriptive chunks after each functional change.
- Always run formatting, type-checks, and builds after changes:

```bash
# Format and Deno type-check (collector)
deno fmt && deno check collector/main.ts collector/utils/storage.ts collector/utils/validator.ts collector/types.ts

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

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Add feature"`)
4. Push to your branch (`git push origin feature-name`)
5. Create a pull request

Please respect the **privacy-first principles** when adding features.

---

### License

This project is open source and available under the **MIT License**. You may
use, modify, and distribute it freely, while maintaining attribution.

---
