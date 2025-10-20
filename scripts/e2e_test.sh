#!/usr/bin/env bash
# Simple end-to-end test helper for 4Insights
# - Generates credentials (optional)
# - Posts a sample pageview event to the collector
# - Queries collector and dashboard backend metrics to verify the event

set -euo pipefail

AUTH_URL="${AUTH_URL:-http://localhost:8001}"
COLLECTOR_URL="${COLLECTOR_URL:-http://localhost:8000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8010}"

echo "Using AUTH_URL=$AUTH_URL, COLLECTOR_URL=$COLLECTOR_URL, BACKEND_URL=$BACKEND_URL"

if [ $# -ge 1 ]; then
  API_KEY="$1"
  echo "Using provided API key: $API_KEY"
else
  echo "Generating credentials from auth service..."
  resp=$(curl -sS -X POST "$AUTH_URL/demo/credentials" -H 'Content-Type: application/json')
  API_KEY=$(echo "$resp" | jq -r '.data.apiKey')
  PASSPHRASE=$(echo "$resp" | jq -r '.data.passphrase')
  echo "Generated apiKey=$API_KEY"
  echo "Creating session to get token..."
  sess=$(curl -sS -X POST "$AUTH_URL/demo/sessions" -H 'Content-Type: application/json' -d "{\"apiKey\": \"$API_KEY\", \"passphrase\": \"$PASSPHRASE\"}")
  TOKEN=$(echo "$sess" | jq -r '.data.token')
  if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "Failed to create session: $sess"
    exit 1
  fi
  echo "Received token"
fi

echo "Posting sample pageview event to collector..."
TS=$(date --iso-8601=seconds)
EVENT=$(cat <<EOF
[{"type":"pageview","userId":"e2e_user","sessionId":"e2e_session","page":"Test E2E","referrer":"","timestamp":"$TS","userAgent":"e2e-agent/1.0","language":"en-US","screen":"800x600","timezone":"UTC","metadata":{"url":"http://localhost/test-e2e","path":"/test-e2e","host":"localhost","hash":"","query":"","routeParams":{}}}]
EOF
)

curl -sS -X POST "$COLLECTOR_URL/4insights/collect" -H 'Content-Type: application/json' -H "X-API-Key: $API_KEY" -d "$EVENT" | jq .

echo "Waiting 0.5s for collector to persist..."
sleep 0.5

echo "Collector metrics (unscoped):"
curl -sS "$COLLECTOR_URL/4insights/metrics" | jq .

echo "Collector metrics (scoped to API key):"
curl -sS -H "X-API-Key: $API_KEY" "$COLLECTOR_URL/4insights/metrics" | jq .

if [ -n "${TOKEN:-}" ]; then
  echo "Dashboard backend metrics (via BFF):"
  curl -sS -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/dashboard/metrics" | jq .
fi

echo "Done."
