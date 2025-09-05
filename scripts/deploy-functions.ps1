# Deploy Appwrite Functions Script for PowerShell
# Make sure you have the Appwrite CLI installed and configured

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Appwrite Functions..." -ForegroundColor Green

# Check if Appwrite CLI is installed
if (!(Get-Command "appwrite" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Appwrite CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g appwrite-cli" -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Deploy Generate Invoice Function
Write-Host "📦 Deploying Generate Invoice Function..." -ForegroundColor Blue
Set-Location "functions/generate-invoice"
npm install
Set-Location "../.."

appwrite functions create `
    --functionId="generate-invoice" `
    --name="Generate Invoice" `
    --runtime="node-18.0" `
    --execute='["any"]' `
    --timeout=900

appwrite functions createDeployment `
    --functionId="generate-invoice" `
    --code="functions/generate-invoice" `
    --activate=true

# Set environment variables for generate-invoice function
$envVars = @(
    "APPWRITE_DATABASE_ID",
    "APPWRITE_INVOICES_COLLECTION_ID",
    "APPWRITE_LOGS_COLLECTION_ID",
    "APPWRITE_STORAGE_BUCKET_ID",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "COMPANY_NAME",
    "COMPANY_ADDRESS",
    "COMPANY_EMAIL",
    "INVOICE_HMAC_SECRET"
)

foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ($value) {
        appwrite functions createVariable `
            --functionId="generate-invoice" `
            --key="$var" `
            --value="$value"
    }
}

# Deploy Resend Invoice Function
Write-Host "📦 Deploying Resend Invoice Function..." -ForegroundColor Blue
Set-Location "functions/resend-invoice"
npm install
Set-Location "../.."

appwrite functions create `
    --functionId="resend-invoice" `
    --name="Resend Invoice" `
    --runtime="node-18.0" `
    --execute='["users"]' `
    --timeout=300

appwrite functions createDeployment `
    --functionId="resend-invoice" `
    --code="functions/resend-invoice" `
    --activate=true

# Set environment variables for resend-invoice function
$resendEnvVars = @(
    "APPWRITE_DATABASE_ID",
    "APPWRITE_INVOICES_COLLECTION_ID",
    "APPWRITE_LOGS_COLLECTION_ID",
    "APPWRITE_STORAGE_BUCKET_ID",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "COMPANY_NAME"
)

foreach ($var in $resendEnvVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ($value) {
        appwrite functions createVariable `
            --functionId="resend-invoice" `
            --key="$var" `
            --value="$value"
    }
}

# Deploy Get Logs Function
Write-Host "📦 Deploying Get Logs Function..." -ForegroundColor Blue
Set-Location "functions/get-logs"
npm install
Set-Location "../.."

appwrite functions create `
    --functionId="get-logs" `
    --name="Get Logs" `
    --runtime="node-18.0" `
    --execute='["users"]' `
    --timeout=60

appwrite functions createDeployment `
    --functionId="get-logs" `
    --code="functions/get-logs" `
    --activate=true

# Set environment variables for get-logs function
$logsEnvVars = @(
    "APPWRITE_DATABASE_ID",
    "APPWRITE_LOGS_COLLECTION_ID"
)

foreach ($var in $logsEnvVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    if ($value) {
        appwrite functions createVariable `
            --functionId="get-logs" `
            --key="$var" `
            --value="$value"
    }
}

Write-Host "✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host "🔧 Don't forget to update your .env file with the function IDs" -ForegroundColor Yellow
