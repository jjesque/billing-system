# Test Generate Invoice API - PowerShell version
# Make sure to replace the endpoint and function ID with your actual values

$AppwriteEndpoint = "http://localhost/v1"
$ProjectId = "billing-system"
$FunctionId = "generate-invoice"

# Sample payload
$Payload = @{
    sourceSystem = "TestSystem"
    sourceId = "TEST-001"
    client = @{
        name = "Test Client Corp"
        email = "test@example.com"
        address = "123 Test St, Test City, TC 12345"
        taxId = "TEST-123456"
    }
    items = @(
        @{
            description = "Test Service"
            qty = 10
            unitPrice = 100.00
            taxCategory = "standard"
        }
    )
    markups = @()
    discounts = @()
    currency = "USD"
    dueDate = "2025-12-31"
    notes = "This is a test invoice"
    emailRecipients = @("test@example.com")
    metadata = @{
        projectCode = "TEST-001"
    }
} | ConvertTo-Json -Depth 10

Write-Host "🧪 Testing Invoice Generation..." -ForegroundColor Green
Write-Host "Endpoint: $AppwriteEndpoint/functions/$FunctionId/executions"
Write-Host "Payload: $Payload"
Write-Host ""

# Make the request
try {
    $Response = Invoke-RestMethod -Uri "$AppwriteEndpoint/functions/$FunctionId/executions" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "X-Appwrite-Project" = $ProjectId
        } `
        -Body $Payload

    Write-Host "✅ Response:" -ForegroundColor Green
    $Response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green
