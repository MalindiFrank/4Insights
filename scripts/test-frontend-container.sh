#!/bin/bash
# Frontend Container Test Script
# Tests the Docker container for the 4Insights frontend

# Don't use set -e because we handle errors explicitly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_test() {
    echo -e "\n${YELLOW}=== $1 ===${NC}"
}

pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((TESTS_FAILED++))
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    docker stop frontend-test 2>/dev/null || true
    docker rm frontend-test 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Build the container
print_test "Building Frontend Container"
if docker build -f docker/dashboard-frontend/Dockerfile -t 4insights-frontend:test . > /dev/null 2>&1; then
    pass "Container built successfully"
else
    fail "Container build failed"
    exit 1
fi

# Start the container
print_test "Starting Container"
CONTAINER_ID=$(docker run -d --name frontend-test -p 3000:3000 \
    -e DASHBOARD_BACKEND_URL=http://localhost:8010 \
    -e AUTH_SERVICE_URL=http://localhost:8001 \
    -e COLLECTOR_URL=http://localhost:8000 \
    4insights-frontend:test)

if [ -n "$CONTAINER_ID" ]; then
    pass "Container started: ${CONTAINER_ID:0:12}"
else
    fail "Container failed to start"
    exit 1
fi

# Wait for container to be ready
echo "Waiting for container to be ready..."
sleep 5

# Test 1: Container is running
print_test "Test 1: Container Health"
if docker ps | grep -q frontend-test; then
    pass "Container is running"
else
    fail "Container is not running"
fi

# Test 2: API Config endpoint
print_test "Test 2: /api/config Endpoint"
RESPONSE=$(curl -s http://localhost:3000/api/config)
if echo "$RESPONSE" | jq -e '.dashboardBackendUrl' > /dev/null 2>&1; then
    pass "Config endpoint returns valid JSON"
else
    fail "Config endpoint response invalid"
fi

# Test 3: Runtime configuration values
print_test "Test 3: Runtime Configuration Values"
BACKEND_URL=$(echo "$RESPONSE" | jq -r '.dashboardBackendUrl')
if [ "$BACKEND_URL" = "http://localhost:8010" ]; then
    pass "Backend URL correctly loaded from environment"
else
    fail "Backend URL mismatch: got $BACKEND_URL"
fi

# Test 4: Main page loads
print_test "Test 4: Main Page (GET /)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$STATUS" = "200" ]; then
    pass "Main page returns 200 OK"
else
    fail "Main page returned $STATUS"
fi

# Test 5: Login page loads
print_test "Test 5: Login Page (GET /login)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login)
if [ "$STATUS" = "200" ]; then
    pass "Login page returns 200 OK"
else
    fail "Login page returned $STATUS"
fi

# Test 6: About page loads
print_test "Test 6: About Page (GET /about)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/about)
if [ "$STATUS" = "200" ]; then
    pass "About page returns 200 OK"
else
    fail "About page returned $STATUS"
fi

# Test 7: 404 error handling
print_test "Test 7: 404 Error Handling"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/nonexistent)
if [ "$STATUS" = "404" ]; then
    pass "404 page returns correct status"
else
    fail "404 page returned $STATUS instead of 404"
fi

# Test 8: Tracker script is available
print_test "Test 8: Tracker Script (GET /static/tracker.js)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/static/tracker.js)
CONTENT_TYPE=$(curl -s -I http://localhost:3000/static/tracker.js | grep -i "content-type" | grep -i "javascript")
if [ "$STATUS" = "200" ] && [ -n "$CONTENT_TYPE" ]; then
    pass "Tracker script available with correct content-type"
else
    fail "Tracker script test failed (status: $STATUS)"
fi

# Test 9: Invalid HTTP method handling
print_test "Test 9: Invalid HTTP Method on /api/config"
STATUS=$(curl -s -X POST -o /dev/null -w "%{http_code}" http://localhost:3000/api/config)
if [ "$STATUS" = "405" ]; then
    pass "POST to /api/config correctly returns 405 Method Not Allowed"
else
    fail "Expected 405, got $STATUS"
fi

# Test 10: Container health check
print_test "Test 10: Docker Health Check"
sleep 10  # Wait for health check to run
HEALTH=$(docker inspect frontend-test --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")
if [ "$HEALTH" = "healthy" ] || [ "$HEALTH" = "none" ]; then
    pass "Container health check: $HEALTH"
else
    fail "Container health check failed: $HEALTH"
fi

# Test 11: No errors in logs
print_test "Test 11: Container Logs"
ERRORS=$(docker logs frontend-test 2>&1 | grep -i "error" | grep -v "0 vulnerabilities" || true)
if [ -z "$ERRORS" ]; then
    pass "No errors in container logs"
else
    fail "Errors found in logs: $ERRORS"
fi

# Test 12: Runtime config change (no rebuild)
print_test "Test 12: Runtime Config Change (No Rebuild)"
docker stop frontend-test > /dev/null 2>&1
docker rm frontend-test > /dev/null 2>&1

CONTAINER_ID=$(docker run -d --name frontend-test -p 3000:3000 \
    -e DASHBOARD_BACKEND_URL=https://production.example.com \
    -e AUTH_SERVICE_URL=https://auth-prod.example.com \
    -e COLLECTOR_URL=https://collector-prod.example.com \
    4insights-frontend:test)

sleep 5

NEW_CONFIG=$(curl -s http://localhost:3000/api/config)
NEW_BACKEND=$(echo "$NEW_CONFIG" | jq -r '.dashboardBackendUrl')

if [ "$NEW_BACKEND" = "https://production.example.com" ]; then
    pass "Runtime config updated without rebuild"
else
    fail "Runtime config not updated: got $NEW_BACKEND"
fi

# Print summary
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed! ✗${NC}"
    exit 1
fi

