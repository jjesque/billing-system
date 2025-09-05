# API Reference - Billing System

Complete API documentation for the Billing System with Automated Invoice Generator.

## Authentication

All API requests require HMAC-SHA256 authentication using the following headers:

\`\`\`http
X-Appwrite-Project: your-project-id
X-Signature: hmac-sha256-signature
X-Timestamp: unix-timestamp
Content-Type: application/json
\`\`\`

### Generating HMAC Signature

\`\`\`javascript
const crypto = require('crypto');

function generateSignature(payload, timestamp, secretKey) {
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
}

// Usage
const timestamp = Math.floor(Date.now() / 1000);
const signature = generateSignature(payload, timestamp, 'your-secret-key');
\`\`\`

## Endpoints

### 1. Generate Invoice

Creates a new invoice, generates PDF, and sends email notification.

**Endpoint:** `POST /v1/functions/generate-invoice/executions`

**Request Body:**
\`\`\`json
{
  "customer": {
    "name": "string (required)",
    "email": "string (required, valid email)",
    "address": "string (optional)",
    "phone": "string (optional)"
  },
  "invoice": {
    "invoiceNumber": "string (required, unique)",
    "issueDate": "string (required, YYYY-MM-DD)",
    "dueDate": "string (required, YYYY-MM-DD)",
    "items": [
      {
        "description": "string (required)",
        "quantity": "number (required, > 0)",
        "rate": "number (required, >= 0)",
        "amount": "number (required, >= 0)"
      }
    ],
    "subtotal": "number (required, >= 0)",
    "tax": "number (optional, >= 0)",
    "discount": "number (optional, >= 0)",
    "total": "number (required, >= 0)",
    "notes": "string (optional)",
    "paymentTerms": "string (optional)"
  },
  "branding": {
    "logoUrl": "string (optional)",
    "primaryColor": "string (optional, hex color)",
    "companyName": "string (optional, overrides default)",
    "companyAddress": "string (optional, overrides default)",
    "companyEmail": "string (optional, overrides default)",
    "companyPhone": "string (optional, overrides default)"
  }
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "success": true,
  "data": {
    "invoiceId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "invoiceNumber": "INV-2024-001",
    "pdfUrl": "https://cloud.appwrite.io/v1/storage/buckets/invoices/files/file-id/view",
    "pdfFileId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "emailSent": true,
    "recipientEmail": "customer@example.com",
    "generatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Invoice generated and sent successfully"
}
\`\`\`

**Response (Error):**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email address format",
    "details": {
      "field": "customer.email",
      "value": "invalid-email"
    }
  }
}
\`\`\`

### 2. Resend Invoice

Resends an existing invoice to a specified email address.

**Endpoint:** `POST /v1/functions/resend-invoice/executions`

**Request Body:**
\`\`\`json
{
  "invoiceId": "string (required)",
  "recipientEmail": "string (required, valid email)",
  "customMessage": "string (optional)"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "success": true,
  "data": {
    "invoiceId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "recipientEmail": "customer@example.com",
    "resentAt": "2024-01-15T14:30:00.000Z"
  },
  "message": "Invoice resent successfully"
}
\`\`\`

### 3. Get Audit Logs

Retrieves system audit logs with optional filtering.

**Endpoint:** `GET /v1/functions/get-logs/executions`

**Query Parameters:**
- `startDate` (optional): ISO date string (YYYY-MM-DD)
- `endDate` (optional): ISO date string (YYYY-MM-DD)
- `action` (optional): Filter by action type
- `userId` (optional): Filter by user ID
- `limit` (optional): Number of records (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
\`\`\`http
GET /v1/functions/get-logs/executions?startDate=2024-01-01&endDate=2024-01-31&action=invoice_generated&limit=25
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "action": "invoice_generated",
        "userId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "userEmail": "admin@company.com",
        "details": {
          "invoiceId": "64f8a1b2c3d4e5f6a7b8c9d2",
          "invoiceNumber": "INV-2024-001",
          "customerEmail": "customer@example.com",
          "amount": 1250.00
        },
        "timestamp": "2024-01-15T10:30:00.000Z",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 25,
      "offset": 0,
      "hasMore": true
    }
  }
}
\`\`\`

## Error Codes

### Authentication Errors

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_MISSING` | Missing authentication headers | No X-Signature or X-Timestamp header |
| `AUTH_INVALID` | Invalid signature | HMAC signature validation failed |
| `AUTH_EXPIRED` | Request timestamp expired | Timestamp outside tolerance window |
| `AUTH_UNAUTHORIZED` | Insufficient permissions | User role lacks required permissions |

### Validation Errors

| Code | Message | Description |
|------|---------|-------------|
| `VALIDATION_ERROR` | Invalid input data | Request body validation failed |
| `MISSING_REQUIRED_FIELD` | Required field missing | Required field not provided |
| `INVALID_EMAIL` | Invalid email format | Email address format validation failed |
| `INVALID_DATE` | Invalid date format | Date not in YYYY-MM-DD format |
| `INVALID_AMOUNT` | Invalid amount value | Negative or non-numeric amount |

### Business Logic Errors

| Code | Message | Description |
|------|---------|-------------|
| `INVOICE_EXISTS` | Invoice number already exists | Duplicate invoice number |
| `INVOICE_NOT_FOUND` | Invoice not found | Invoice ID does not exist |
| `PDF_GENERATION_FAILED` | PDF generation failed | Error creating PDF document |
| `EMAIL_SEND_FAILED` | Email delivery failed | SMTP or email service error |
| `STORAGE_ERROR` | File storage error | Error saving PDF to storage |

### System Errors

| Code | Message | Description |
|------|---------|-------------|
| `INTERNAL_ERROR` | Internal server error | Unexpected system error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | System maintenance or overload |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | Too many requests from client |

## Rate Limits

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| Generate Invoice | 100 requests | 1 hour | Per API key |
| Resend Invoice | 50 requests | 1 hour | Per API key |
| Get Logs | 200 requests | 1 hour | Per authenticated user |

## Webhook Integration

### Invoice Generated Webhook

When an invoice is successfully generated, the system can send a webhook to your specified endpoint.

**Webhook URL Configuration:**
Set in Appwrite Console → Functions → generate-invoice → Settings → Environment Variables:
\`\`\`
WEBHOOK_URL=https://your-app.com/webhooks/invoice-generated
WEBHOOK_SECRET=your-webhook-secret
\`\`\`

**Webhook Payload:**
\`\`\`json
{
  "event": "invoice.generated",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "invoiceId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "invoiceNumber": "INV-2024-001",
    "customerEmail": "customer@example.com",
    "total": 1250.00,
    "pdfUrl": "https://cloud.appwrite.io/v1/storage/buckets/invoices/files/file-id/view"
  }
}
\`\`\`

## SDK Examples

### JavaScript/Node.js

\`\`\`javascript
const crypto = require('crypto');

class BillingAPI {
  constructor(endpoint, projectId, secretKey) {
    this.endpoint = endpoint;
    this.projectId = projectId;
    this.secretKey = secretKey;
  }

  generateSignature(payload, timestamp) {
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  async generateInvoice(invoiceData) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateSignature(invoiceData, timestamp);

    const response = await fetch(`${this.endpoint}/functions/generate-invoice/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': this.projectId,
        'X-Signature': signature,
        'X-Timestamp': timestamp.toString()
      },
      body: JSON.stringify(invoiceData)
    });

    return await response.json();
  }
}

// Usage
const billing = new BillingAPI(
  'https://cloud.appwrite.io/v1',
  'your-project-id',
  'your-secret-key'
);

const invoice = await billing.generateInvoice({
  customer: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  invoice: {
    invoiceNumber: 'INV-2024-001',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    items: [{
      description: 'Consulting Services',
      quantity: 10,
      rate: 125.00,
      amount: 1250.00
    }],
    subtotal: 1250.00,
    total: 1250.00
  }
});
\`\`\`

### Python

\`\`\`python
import hashlib
import hmac
import json
import time
import requests

class BillingAPI:
    def __init__(self, endpoint, project_id, secret_key):
        self.endpoint = endpoint
        self.project_id = project_id
        self.secret_key = secret_key

    def generate_signature(self, payload, timestamp):
        message = f"{timestamp}.{json.dumps(payload, separators=(',', ':'))}"
        return hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

    def generate_invoice(self, invoice_data):
        timestamp = int(time.time())
        signature = self.generate_signature(invoice_data, timestamp)

        headers = {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': self.project_id,
            'X-Signature': signature,
            'X-Timestamp': str(timestamp)
        }

        response = requests.post(
            f"{self.endpoint}/functions/generate-invoice/executions",
            headers=headers,
            json=invoice_data
        )

        return response.json()
\`\`\`

## Testing

### Unit Tests

\`\`\`javascript
// Test HMAC signature generation
const { APIKeyValidator } = require('./security/api-key-validator');

describe('HMAC Validation', () => {
  test('should generate valid signature', () => {
    const validator = new APIKeyValidator('test-secret');
    const payload = { test: 'data' };
    const timestamp = Math.floor(Date.now() / 1000);
    
    const signature = validator.generateSignature(payload, timestamp);
    expect(signature).toBeDefined();
    expect(signature).toHaveLength(64);
  });

  test('should validate correct signature', () => {
    const validator = new APIKeyValidator('test-secret');
    const payload = { test: 'data' };
    const timestamp = Math.floor(Date.now() / 1000);
    
    const signature = validator.generateSignature(payload, timestamp);
    expect(() => {
      validator.validateRequest(payload, signature, timestamp);
    }).not.toThrow();
  });
});
\`\`\`

### Integration Tests

\`\`\`bash
# Test complete invoice generation flow
curl -X POST https://your-appwrite-endpoint/v1/functions/generate-invoice/executions \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: your-project-id" \
  -H "X-Signature: generated-hmac-signature" \
  -H "X-Timestamp: current-timestamp" \
  -d @sample-payloads/generate-invoice.json
\`\`\`

## Changelog

### Version 1.0.0 (Initial Release)
- Invoice generation with PDF creation
- Email delivery with attachments
- Audit logging system
- Role-based access control
- React frontend with authentication
- HMAC-based API security

### Future Enhancements
- Recurring invoice support
- Payment integration (Stripe, PayPal)
- Multi-currency support
- Invoice templates customization
- Bulk invoice operations
- Advanced reporting and analytics
