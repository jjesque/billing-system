# Billing System with Automated Invoice Generator

A complete billing system built with React.js frontend and Appwrite backend that automatically generates PDF invoices, sends emails, and manages billing workflows.

## Features

- 🧾 **Automated Invoice Generation**: Generate professional PDF invoices with company branding
- 📧 **Email Integration**: Automatically send invoices via email with attachments
- 🔐 **Role-Based Access Control**: Finance staff and admin roles with different permissions
- 📊 **Audit Logging**: Complete audit trail of all invoice operations
- 🗄️ **Cloud Storage**: Secure PDF storage with Appwrite buckets
- 🔄 **Resend Functionality**: Easily resend invoices to clients
- 📱 **Responsive UI**: Modern React interface that works on all devices
- 🐳 **Docker Support**: Easy deployment with Docker containers

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Appwrite (Database, Storage, Functions, Auth)
- **PDF Generation**: PDFKit
- **Email**: Nodemailer with SMTP
- **Security**: HMAC signing, JWT tokens, RBAC

## Quick Start

1. **Clone and setup**:
   \`\`\`bash
   git clone <repository>
   cd billing-system
   cp .env.example .env
   \`\`\`

2. **Start Appwrite**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Setup backend**:
   \`\`\`bash
   npm run setup
   \`\`\`

4. **Start frontend**:
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Appwrite Console: http://localhost/console

## Project Structure

\`\`\`
billing-system/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities and config
│   │   └── main.jsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json
├── functions/              # Appwrite serverless functions
│   ├── generate-invoice/   # Invoice generation function
│   ├── resend-invoice/     # Invoice resend function
│   └── get-logs/          # Logs retrieval function
├── scripts/               # Setup and utility scripts
├── docker-compose.yml     # Appwrite local setup
└── README.md
\`\`\`

## API Endpoints

### Generate Invoice
\`\`\`http
POST /v1/functions/{functionId}/executions
Content-Type: application/json

{
  "sourceSystem": "ExistingBillingSystem",
  "sourceId": "PO-2025-0812-123",
  "client": {
    "name": "Acme Corp",
    "email": "finance@acme.example",
    "address": "123 Market St, City, Country",
    "taxId": "TAX-987654"
  },
  "items": [
    {
      "description": "Development services",
      "qty": 120,
      "unitPrice": 30.50,
      "taxCategory": "standard"
    }
  ],
  "currency": "USD",
  "dueDate": "2025-09-30",
  "emailRecipients": ["finance@acme.example"]
}
\`\`\`

## Documentation

- [Installation Guide](docs/installation.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guide](docs/security.md)

## License

MIT License - see LICENSE file for details.
