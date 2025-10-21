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

## Build (Deno-only)

The project ships a Deno-based bundler so you don't need to commit generated
files.

Create the output folder (optional) and run the Deno bundler:

```bash
# (optional) copy env example if you use runtime config
cp tracker/.env.example tracker/.env

# Deno-only bundler produces tracker/build/tracker.js
deno run --allow-read --allow-write tracker/build.ts --outDir=tracker/build
```

## Config

- `apiKey`: required public token for your site
- `endpoint`: optional, defaults to `/4insights/collect`
- `userId`: optional override for anonymous user id
