#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:8000" # Standardized port if needed, or keep 8000
REQ_ID="req-$(date +%s)"

echo "=== [1] Login as admin ==="
ADMIN_LOGIN=$(curl -sS -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-request-id: $REQ_ID" \
  -d '{"username":"admin","password":"admin"}')
echo "Admin Login Response: $ADMIN_LOGIN"

TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//;s/"//')

if [ -z "$TOKEN" ]; then
  echo "Error: Failed to get access token"
  exit 1
fi

echo "=== [1.1] Refresh Token ==="
REFRESH_RESPONSE=$(curl -sS -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Refresh Response: $REFRESH_RESPONSE"

NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//;s/"//')

if [ -n "$NEW_TOKEN" ]; then
  echo "Token refreshed successfully. Checking if old token is blacklisted..."
  CHECK_OLD_TOKEN=$(curl -sS -X GET "$BASE_URL/accounts?branch_code=BKK-001" \
    -H "x-request-id: $REQ_ID" \
    -H "Authorization: Bearer $TOKEN")
  echo "Old Token Verification (Expected 401/Blacklisted): $CHECK_OLD_TOKEN"
  
  TOKEN=$NEW_TOKEN
  echo "Using New Token for subsequent requests."
else
  echo "Warning: Failed to refresh token. Continuing with old token."
fi

echo "=== [2] Create Account ==="
curl -sS -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"account_id":"ACC-'"$REQ_ID"'","balance":1000.00,"branch_code":"BKK-001","account_type":"SAVINGS","currency_code":"THB","account_name":"บัญชีทดสอบคุณอนุรักษ์"}'
echo -e "\n"

echo "=== [3] Search Account (by account_id) ==="
curl -sS -X GET "$BASE_URL/accounts?account_id=ACC-$REQ_ID" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== [4] Search Accounts (by branch_code) ==="
curl -sS -X GET "$BASE_URL/accounts?branch_code=BKK-001" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== [5] Edit Account ==="
curl -sS -X POST "$BASE_URL/accounts/edit" \
  -H "Content-Type: application/json" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "account_id": "ACC-'"$REQ_ID"'",
    "account_name": "Updated Account Name",
    "status": "ACTIVE",
    "version": 2
  }'
echo -e "\n"

echo "=== [6] Update Balance (DEPOSIT v2) ==="
curl -sS -X POST "$BASE_URL/accounts/balance/v2" \
  -H "Content-Type: application/json" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"account_id":"ACC-'"$REQ_ID"'","amount":500.00,"transaction_type":"DEPOSIT","branch_code":"BKK-001","employee_id":"EMP001","description":"ฝากเงินโดยพนักงาน"}'
echo -e "\n"

echo "=== [7] Get Transaction History ==="
curl -sS -X GET "$BASE_URL/transaction-history?account_id=ACC-$REQ_ID" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== [8] Health Checks ==="
curl -sS -X GET "$BASE_URL/health/liveness"
echo
curl -sS -X GET "$BASE_URL/health/readiness"
echo -e "\n"

echo "=== [9] Logout ==="
curl -sS -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -H "x-request-id: $REQ_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== Done ==="
