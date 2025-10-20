# 4Insights Tracker

Lightweight browser tracker that captures pageviews and sends them to the
Collector.

## Usage

Embed via script tag (after bundling):

```html
<script src="/path/to/tracker.js" data-key="public_XXXX"></script>
```

Or initialize programmatically:

```ts
import { InsightTracker } from "./tracker/index.ts";
new InsightTracker({
  apiKey: "public_XXXX",
  endpoint: "http://localhost:8000/4insights/collect",
});
```

The tracker sends a `pageview` event on load and on SPA navigations. It sets
header `X-API-Key` with your provided `apiKey`.

## Build

Copy example env and then bundle the tracker to a single JS file:

```bash
cp tracker/.env.example tracker/.env
deno bundle tracker/index.ts tracker/build/tracker.js
```

## Config

- `apiKey`: required public token for your site
- `endpoint`: optional, defaults to `/4insights/collect`
- `userId`: optional override for anonymous user id
