#!/bin/bash

# Test Generate Invoice API
# Make sure to replace the endpoint and function ID with your actual values

APPWRITE_ENDPOINT="http://localhost/v1"
PROJECT_ID="billing-system"
FUNCTION_ID="generate-invoice"

# Sample payload
PAYLOAD='{
  "sourceSystem": "TestSystem",
  "sourceId": "TEST-001",
  "client": {
    "name": "Test Client Corp",
    "email": "test@example.com",
    "address": "123 Test St, Test City, TC 12345",
    "taxId": "TEST-123456"
  },
  "items": [
    {
      "description": "Test Service",
      "qty": 10,
      "unitPrice": 100.00,
      "taxCategory": "standard"
    }
  ],
  "markups": [],
  "discounts": [],
  "currency": "USD",
  "dueDate": "2025-12-31",
  "notes": "This is a test invoice",
  "emailRecipients": ["test@example.com"],
  "metadata": {
    "projectCode": "TEST-001"
  }
}'

echo "🧪 Testing Invoice Generation..."
echo "Endpoint: $APPWRITE_ENDPOINT/functions/$FUNCTION_ID/executions"
echo "Payload: $PAYLOAD"
echo ""

# Make the request
curl -X POST \
  "$APPWRITE_ENDPOINT/functions/$FUNCTION_ID/executions" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -d "$PAYLOAD" \
  | jq '.'

echo ""
echo "✅ Test completed!"
