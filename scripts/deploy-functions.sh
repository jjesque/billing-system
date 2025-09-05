#!/bin/bash

# Deploy Appwrite Functions Script
# Make sure you have the Appwrite CLI installed and configured

set -e

echo "🚀 Deploying Appwrite Functions..."

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo "❌ Appwrite CLI not found. Please install it first:"
    echo "npm install -g appwrite-cli"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Deploy Generate Invoice Function
echo "📦 Deploying Generate Invoice Function..."
cd functions/generate-invoice
npm install
cd ../..

appwrite functions create \
    --functionId="generate-invoice" \
    --name="Generate Invoice" \
    --runtime="node-18.0" \
    --execute='["any"]' \
    --timeout=900

appwrite functions createDeployment \
    --functionId="generate-invoice" \
    --code="functions/generate-invoice" \
    --activate=true

# Set environment variables for generate-invoice function
appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="APPWRITE_DATABASE_ID" \
    --value="$APPWRITE_DATABASE_ID"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="APPWRITE_INVOICES_COLLECTION_ID" \
    --value="$APPWRITE_INVOICES_COLLECTION_ID"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="APPWRITE_LOGS_COLLECTION_ID" \
    --value="$APPWRITE_LOGS_COLLECTION_ID"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="APPWRITE_STORAGE_BUCKET_ID" \
    --value="$APPWRITE_STORAGE_BUCKET_ID"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="SMTP_HOST" \
    --value="$SMTP_HOST"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="SMTP_PORT" \
    --value="$SMTP_PORT"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="SMTP_USER" \
    --value="$SMTP_USER"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="SMTP_PASS" \
    --value="$SMTP_PASS"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="COMPANY_NAME" \
    --value="$COMPANY_NAME"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="COMPANY_ADDRESS" \
    --value="$COMPANY_ADDRESS"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="COMPANY_EMAIL" \
    --value="$COMPANY_EMAIL"

appwrite functions createVariable \
    --functionId="generate-invoice" \
    --key="INVOICE_HMAC_SECRET" \
    --value="$INVOICE_HMAC_SECRET"

# Deploy Resend Invoice Function
echo "📦 Deploying Resend Invoice Function..."
cd functions/resend-invoice
npm install
cd ../..

appwrite functions create \
    --functionId="resend-invoice" \
    --name="Resend Invoice" \
    --runtime="node-18.0" \
    --execute='["users"]' \
    --timeout=300

appwrite functions createDeployment \
    --functionId="resend-invoice" \
    --code="functions/resend-invoice" \
    --activate=true

# Set environment variables for resend-invoice function
appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="APPWRITE_DATABASE_ID" \
    --value="$APPWRITE_DATABASE_ID"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="APPWRITE_INVOICES_COLLECTION_ID" \
    --value="$APPWRITE_INVOICES_COLLECTION_ID"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="APPWRITE_LOGS_COLLECTION_ID" \
    --value="$APPWRITE_LOGS_COLLECTION_ID"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="APPWRITE_STORAGE_BUCKET_ID" \
    --value="$APPWRITE_STORAGE_BUCKET_ID"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="SMTP_HOST" \
    --value="$SMTP_HOST"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="SMTP_PORT" \
    --value="$SMTP_PORT"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="SMTP_USER" \
    --value="$SMTP_USER"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="SMTP_PASS" \
    --value="$SMTP_PASS"

appwrite functions createVariable \
    --functionId="resend-invoice" \
    --key="COMPANY_NAME" \
    --value="$COMPANY_NAME"

# Deploy Get Logs Function
echo "📦 Deploying Get Logs Function..."
cd functions/get-logs
npm install
cd ../..

appwrite functions create \
    --functionId="get-logs" \
    --name="Get Logs" \
    --runtime="node-18.0" \
    --execute='["users"]' \
    --timeout=60

appwrite functions createDeployment \
    --functionId="get-logs" \
    --code="functions/get-logs" \
    --activate=true

# Set environment variables for get-logs function
appwrite functions createVariable \
    --functionId="get-logs" \
    --key="APPWRITE_DATABASE_ID" \
    --value="$APPWRITE_DATABASE_ID"

appwrite functions createVariable \
    --functionId="get-logs" \
    --key="APPWRITE_LOGS_COLLECTION_ID" \
    --value="$APPWRITE_LOGS_COLLECTION_ID"

echo "✅ All functions deployed successfully!"
echo "🔧 Don't forget to update your .env file with the function IDs"
