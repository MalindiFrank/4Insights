#!/bin/bash
# CORS Testing Script for 4Insights Services
# Tests both allowed and disallowed origins

set -e

echo "========================================="
echo "CORS Testing Script for 4Insights"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
AUTH_URL="http://localhost:8001"
BACKEND_URL="http://localhost:8010"
COLLECTOR_URL="http://localhost:8000"

ALLOWED_ORIGIN="http://localhost:5173"
DISALLOWED_ORIGIN="http://evil.com"

echo "Test Configuration:"
echo "  Auth Service: $AUTH_URL"
echo "  Dashboard Backend: $BACKEND_URL"
echo "  Collector: $COLLECTOR_URL"
echo ""

# Function to test CORS
test_cors() {
    local service_name=$1
    local url=$2
    local origin=$3
    local method=$4
    local should_allow=$5
    
    echo -n "Testing $service_name with origin $origin ($method)... "
    
    if [ "$method" = "OPTIONS" ]; then
        response=$(curl -s -i -X OPTIONS \
            -H "Origin: $origin" \
            -H "Access-Control-Request-Method: POST" \
            "$url" 2>&1)
    else
        response=$(curl -s -i -X POST \
            -H "Origin: $origin" \
            -H "Content-Type: application/json" \
            -d '{}' \
            "$url" 2>&1)
    fi
    
    # Check for Access-Control-Allow-Origin header (case-insensitive)
    if echo "$response" | grep -qi "access-control-allow-origin: $origin"; then
        if [ "$should_allow" = "yes" ]; then
            echo -e "${GREEN}✓ PASS${NC} - CORS headers present"
        else
            echo -e "${RED}✗ FAIL${NC} - CORS headers should NOT be present for disallowed origin"
        fi
    else
        if [ "$should_allow" = "no" ]; then
            echo -e "${GREEN}✓ PASS${NC} - CORS headers correctly omitted"
        else
            echo -e "${RED}✗ FAIL${NC} - CORS headers missing for allowed origin"
            echo "Response headers:"
            echo "$response" | grep -i "access-control" || echo "  (no CORS headers found)"
        fi
    fi
}

echo "========================================="
echo "1. Testing Auth Service"
echo "========================================="
echo ""

# Test OPTIONS preflight
test_cors "Auth Service" "$AUTH_URL/demo/credentials" "$ALLOWED_ORIGIN" "OPTIONS" "yes"
test_cors "Auth Service" "$AUTH_URL/demo/credentials" "$DISALLOWED_ORIGIN" "OPTIONS" "no"

# Test actual POST request
test_cors "Auth Service" "$AUTH_URL/demo/credentials" "$ALLOWED_ORIGIN" "POST" "yes"
test_cors "Auth Service" "$AUTH_URL/demo/credentials" "$DISALLOWED_ORIGIN" "POST" "no"

echo ""
echo "========================================="
echo "2. Testing Dashboard Backend"
echo "========================================="
echo ""

test_cors "Dashboard Backend" "$BACKEND_URL/health" "$ALLOWED_ORIGIN" "OPTIONS" "yes"
test_cors "Dashboard Backend" "$BACKEND_URL/health" "$DISALLOWED_ORIGIN" "OPTIONS" "no"

echo ""
echo "========================================="
echo "3. Testing Collector Service"
echo "========================================="
echo ""

test_cors "Collector" "$COLLECTOR_URL/4insights/collect" "$ALLOWED_ORIGIN" "OPTIONS" "yes"
test_cors "Collector" "$COLLECTOR_URL/4insights/collect" "$DISALLOWED_ORIGIN" "OPTIONS" "no"
test_cors "Collector" "$COLLECTOR_URL/4insights/collect" "$ALLOWED_ORIGIN" "POST" "yes"
test_cors "Collector" "$COLLECTOR_URL/4insights/collect" "$DISALLOWED_ORIGIN" "POST" "no"

echo ""
echo "========================================="
echo "4. Detailed CORS Header Check"
echo "========================================="
echo ""

echo "Checking Auth Service OPTIONS response with allowed origin:"
curl -i -X OPTIONS \
    -H "Origin: $ALLOWED_ORIGIN" \
    -H "Access-Control-Request-Method: POST" \
    "$AUTH_URL/demo/credentials" 2>&1 | grep -i "access-control" || echo "No CORS headers"

echo ""
echo "Checking Auth Service POST response with allowed origin:"
curl -i -X POST \
    -H "Origin: $ALLOWED_ORIGIN" \
    -H "Content-Type: application/json" \
    -d '{}' \
    "$AUTH_URL/demo/credentials" 2>&1 | grep -i "access-control" || echo "No CORS headers"

echo ""
echo "========================================="
echo "Testing Complete!"
echo "========================================="
echo ""
echo "Note: Make sure all services are running:"
echo "  - Auth Service: cd auth/demo/server && deno run --allow-net --allow-env main.ts"
echo "  - Dashboard Backend: cd dashboard/backend && deno run --allow-net --allow-env main.ts"
echo "  - Collector: cd collector && deno run --allow-net --allow-env --allow-read --allow-write main.ts"

