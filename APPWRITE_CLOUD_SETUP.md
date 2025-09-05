# Complete Appwrite Cloud Setup Guide

This guide will walk you through setting up the Billing System using Appwrite Cloud from scratch.

## Step 1: Create Appwrite Cloud Account

1. **Go to Appwrite Cloud:**
   - Visit [https://cloud.appwrite.io](https://cloud.appwrite.io)
   - Click "Sign Up" to create a new account
   - Verify your email address

2. **Create a New Project:**
   - Click "Create Project" 
   - Enter project name: `Billing System`
   - Choose your preferred region (closest to your users)
   - Click "Create"
   - **Copy your Project ID** - you'll need this later

## Step 2: Generate API Key

1. **Navigate to API Keys:**
   - In your project dashboard, go to "Settings" → "API Keys"
   - Click "Create API Key"

2. **Configure API Key:**
   - Name: `Billing System Backend`
   - Scopes: Select ALL scopes (or at minimum):
     - `databases.read`, `databases.write`
     - `collections.read`, `collections.write`
     - `documents.read`, `documents.write`
     - `files.read`, `files.write`
     - `buckets.read`, `buckets.write`
     - `functions.read`, `functions.write`
     - `execution.read`, `execution.write`
   - Click "Create"
   - **Copy your API Key** - you'll need this later

## Step 3: Set Up Environment Variables

1. **Copy the example file:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. **Update your .env file with your Appwrite Cloud details:**
   \`\`\`env
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-actual-project-id-here
   APPWRITE_API_KEY=your-actual-api-key-here
   
   # Update other variables as needed
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   COMPANY_NAME=Your Company Name
   # ... etc
   \`\`\`

## Step 4: Install Appwrite CLI

1. **Install via npm:**
   \`\`\`bash
   npm install -g appwrite-cli
   \`\`\`

2. **Login to Appwrite:**
   \`\`\`bash
   appwrite login
   \`\`\`
   - Choose "Appwrite Cloud"
   - Enter your email and password

3. **Initialize project:**
   \`\`\`bash
   appwrite init project
   \`\`\`
   - Select your project from the list
   - Choose current directory

## Step 5: Create Database and Collections

1. **Run the setup script:**
   \`\`\`bash
   node scripts/setup-collections.js
   \`\`\`

   Or manually create in Appwrite Console:

2. **Create Database:**
   - Go to "Databases" in your Appwrite Console
   - Click "Create Database"
   - Database ID: `billing-db`
   - Name: `Billing Database`

3. **Create Collections:**

   **Clients Collection:**
   - Collection ID: `clients`
   - Name: `Clients`
   - Attributes:
     - `name` (string, required, size: 255)
     - `email` (email, required, size: 320)
     - `phone` (string, size: 20)
     - `address` (string, size: 500)
     - `createdAt` (datetime, default: now)

   **Invoices Collection:**
   - Collection ID: `invoices`
   - Name: `Invoices`
   - Attributes:
     - `invoiceNumber` (string, required, size: 50)
     - `clientId` (string, required, size: 36)
     - `amount` (double, required)
     - `currency` (string, required, size: 3, default: "USD")
     - `status` (enum: ["draft", "sent", "paid", "overdue"], default: "draft")
     - `description` (string, size: 1000)
     - `dueDate` (datetime, required)
     - `items` (string, size: 10000) // JSON string
     - `pdfUrl` (url, size: 500)
     - `sentAt` (datetime)
     - `paidAt` (datetime)
     - `createdAt` (datetime, default: now)

   **Logs Collection:**
   - Collection ID: `invoice-logs`
   - Name: `Invoice Logs`
   - Attributes:
     - `invoiceId` (string, required, size: 36)
     - `action` (enum: ["created", "sent", "resent", "paid", "failed"])
     - `details` (string, size: 1000)
     - `timestamp` (datetime, default: now)
     - `userAgent` (string, size: 500)
     - `ipAddress` (ip)

## Step 6: Create Storage Bucket

1. **In Appwrite Console:**
   - Go to "Storage"
   - Click "Create Bucket"
   - Bucket ID: `invoice-pdfs`
   - Name: `Invoice PDFs`
   - File Security: Enabled
   - Maximum File Size: 10MB
   - Allowed File Extensions: `pdf`
   - Permissions:
     - Read: `role:all`
     - Create: `role:all`
     - Update: `role:all`
     - Delete: `role:all`

## Step 7: Deploy Functions

1. **Deploy Generate Invoice Function:**
   \`\`\`bash
   cd functions/generate-invoice
   appwrite functions create \
     --functionId generate-invoice \
     --name "Generate Invoice" \
     --runtime node-18.0 \
     --execute role:all
   
   appwrite functions createDeployment \
     --functionId generate-invoice \
     --code . \
     --activate true
   \`\`\`

2. **Deploy Resend Invoice Function:**
   \`\`\`bash
   cd ../resend-invoice
   appwrite functions create \
     --functionId resend-invoice \
     --name "Resend Invoice" \
     --runtime node-18.0 \
     --execute role:all
   
   appwrite functions createDeployment \
     --functionId resend-invoice \
     --code . \
     --activate true
   \`\`\`

3. **Deploy Get Logs Function:**
   \`\`\`bash
   cd ../get-logs
   appwrite functions create \
     --functionId get-logs \
     --name "Get Logs" \
     --runtime node-18.0 \
     --execute role:all
   
   appwrite functions createDeployment \
     --functionId get-logs \
     --code . \
     --activate true
   \`\`\`

## Step 8: Configure Function Environment Variables

For each function, add environment variables in Appwrite Console:

1. **Go to Functions → [Function Name] → Settings → Environment Variables**

2. **Add these variables for ALL functions:**
   \`\`\`
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   APPWRITE_DATABASE_ID=billing-db
   APPWRITE_CLIENTS_COLLECTION_ID=clients
   APPWRITE_INVOICES_COLLECTION_ID=invoices
   APPWRITE_LOGS_COLLECTION_ID=invoice-logs
   APPWRITE_STORAGE_BUCKET_ID=invoice-pdfs
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   COMPANY_NAME=Your Company Name
   COMPANY_ADDRESS=123 Business St, City, State 12345
   COMPANY_EMAIL=billing@yourcompany.com
   COMPANY_PHONE=+1-555-123-4567
   INVOICE_HMAC_SECRET=your-super-secret-key
   \`\`\`

## Step 9: Test Your Setup

1. **Test Generate Invoice API:**
   \`\`\`bash
   curl -X POST \
     https://cloud.appwrite.io/v1/functions/generate-invoice/executions \
     -H "Content-Type: application/json" \
     -H "X-Appwrite-Project: your-project-id" \
     -H "X-Appwrite-Key: your-api-key" \
     -d '{
       "client": {
         "name": "John Doe",
         "email": "john@example.com",
         "address": "123 Main St, City, State 12345",
         "phone": "+1-555-123-4567"
       },
       "invoice": {
         "amount": 1500.00,
         "currency": "USD",
         "description": "Web Development Services",
         "dueDate": "2024-02-15",
         "items": [
           {
             "description": "Frontend Development",
             "quantity": 40,
             "rate": 25.00,
             "amount": 1000.00
           }
         ]
       }
     }'
   \`\`\`

2. **Check Function Logs:**
   - Go to Functions → [Function Name] → Executions
   - Check for any errors in the execution logs

## Step 10: Deploy Frontend (Optional)

1. **Update frontend environment variables:**
   \`\`\`bash
   # In your frontend/.env file
   REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   REACT_APP_APPWRITE_PROJECT_ID=your-project-id
   \`\`\`

2. **Build and deploy:**
   \`\`\`bash
   cd frontend
   npm install
   npm run build
   \`\`\`

3. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

## Troubleshooting

### Common Issues:

1. **"Project not found" error:**
   - Verify your Project ID is correct
   - Ensure you're using the right API endpoint

2. **"Insufficient permissions" error:**
   - Check your API key has all required scopes
   - Verify collection permissions allow your operations

3. **Function deployment fails:**
   - Ensure you're in the correct directory when deploying
   - Check that package.json exists in the function directory
   - Verify runtime is set to node-18.0

4. **Email sending fails:**
   - For Gmail, use App Passwords instead of regular password
   - Verify SMTP settings are correct
   - Check function environment variables

### Getting Help:

- Appwrite Documentation: [appwrite.io/docs](https://appwrite.io/docs)
- Appwrite Discord: [appwrite.io/discord](https://appwrite.io/discord)
- Check function execution logs in Appwrite Console

## Next Steps

1. Customize the PDF template in your functions
2. Set up proper authentication for the frontend
3. Configure webhooks for real-time updates
4. Set up monitoring and alerts
5. Configure backup strategies

Your Billing System is now ready to use with Appwrite Cloud! 🎉
