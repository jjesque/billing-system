# Deployment Guide - Billing System

This guide provides step-by-step instructions for deploying the billing system to production.

## Prerequisites

- Appwrite Cloud account or self-hosted Appwrite instance
- SMTP email service (Gmail, SendGrid, etc.)
- Domain name for frontend hosting
- SSL certificate (handled automatically by most hosting providers)

## Production Deployment Steps

### 1. Appwrite Cloud Setup

1. **Create Production Project**
   \`\`\`bash
   # Login to Appwrite CLI
   appwrite login
   
   # Create new project
   appwrite projects create --projectId billing-prod --name "Billing System Production"
   \`\`\`

2. **Configure Project Settings**
   - Go to Appwrite Console → Settings
   - Add your production domain to allowed origins
   - Configure webhook URLs if needed
   - Set up custom SMTP (optional)

### 2. Database Migration

1. **Deploy Collections**
   \`\`\`bash
   # Update appwrite.json with production project ID
   # Deploy collections and permissions
   appwrite deploy collection
   \`\`\`

2. **Create Storage Buckets**
   \`\`\`bash
   # Deploy storage configuration
   appwrite deploy bucket
   \`\`\`

### 3. Function Deployment

1. **Set Production Environment Variables**
   In Appwrite Console → Functions → [Function Name] → Settings:
   
   **generate-invoice function:**
   \`\`\`
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-production-email@company.com
   SMTP_PASS=your-app-password
   COMPANY_NAME=Your Company Inc.
   COMPANY_ADDRESS=123 Business Street, City, State 12345
   COMPANY_EMAIL=billing@yourcompany.com
   COMPANY_PHONE=+1 (555) 123-4567
   HMAC_SECRET_KEY=your-production-secret-key
   \`\`\`

2. **Deploy Functions**
   \`\`\`bash
   # Deploy all functions
   appwrite deploy function
   
   # Or deploy individually
   appwrite deploy function --functionId generate-invoice
   appwrite deploy function --functionId resend-invoice
   appwrite deploy function --functionId get-logs
   \`\`\`

### 4. Frontend Deployment

#### Option A: Vercel Deployment

1. **Connect Repository**
   - Import project to Vercel
   - Set root directory to `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Environment Variables**
   \`\`\`
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=billing-prod
   \`\`\`

#### Option B: Docker Deployment

1. **Build Docker Image**
   \`\`\`bash
   cd frontend
   docker build -t billing-frontend .
   \`\`\`

2. **Run Container**
   \`\`\`bash
   docker run -d \
     --name billing-frontend \
     -p 80:80 \
     -e VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
     -e VITE_APPWRITE_PROJECT_ID=billing-prod \
     billing-frontend
   \`\`\`

### 5. Security Configuration

1. **API Key Management**
   \`\`\`bash
   # Generate secure HMAC key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   \`\`\`

2. **Set Function Permissions**
   - Ensure functions have correct execution permissions
   - Verify role-based access is properly configured
   - Test authentication flows

3. **Configure Rate Limiting**
   - Set appropriate limits for production traffic
   - Monitor function execution logs
   - Set up alerts for unusual activity

### 6. Testing Production Deployment

1. **Health Check**
   \`\`\`bash
   # Test function availability
   curl -X POST https://cloud.appwrite.io/v1/functions/generate-invoice/executions \
     -H "Content-Type: application/json" \
     -H "X-Appwrite-Project: billing-prod" \
     -d '{"test": true}'
   \`\`\`

2. **End-to-End Test**
   \`\`\`bash
   # Use production test script
   ./sample-requests/test-generate-invoice.sh
   \`\`\`

3. **Frontend Verification**
   - Access your deployed frontend URL
   - Test login functionality
   - Verify all pages load correctly
   - Test invoice generation flow

## Monitoring and Maintenance

### 1. Function Monitoring

- **Appwrite Console**: Monitor function executions and errors
- **Logs**: Review execution logs for performance issues
- **Alerts**: Set up notifications for function failures

### 2. Database Monitoring

- **Storage Usage**: Monitor file storage consumption
- **Query Performance**: Review slow queries in logs
- **Backup Strategy**: Configure automated backups

### 3. Security Monitoring

- **Failed Authentication**: Monitor failed login attempts
- **API Abuse**: Watch for unusual API usage patterns
- **Rate Limiting**: Review rate limit violations

## Scaling Considerations

### 1. Function Scaling

- **Concurrent Executions**: Appwrite automatically scales functions
- **Memory Limits**: Increase if PDF generation fails
- **Timeout Settings**: Adjust based on average processing time

### 2. Database Scaling

- **Indexing**: Add indexes for frequently queried fields
- **Archiving**: Implement log rotation for audit_logs collection
- **Caching**: Consider Redis for frequently accessed data

### 3. Storage Scaling

- **CDN**: Use Appwrite's built-in CDN for file delivery
- **Cleanup**: Implement automated cleanup of old invoices
- **Compression**: Enable compression for PDF files

## Backup and Recovery

### 1. Database Backup

\`\`\`bash
# Export collections
appwrite databases listCollections --databaseId billing-db
appwrite databases exportCollection --databaseId billing-db --collectionId invoices
\`\`\`

### 2. Storage Backup

\`\`\`bash
# Download all files from bucket
appwrite storage listFiles --bucketId invoices
# Implement automated backup script
\`\`\`

### 3. Configuration Backup

- Export appwrite.json configuration
- Backup environment variables securely
- Document custom settings and configurations

## Performance Optimization

### 1. Frontend Optimization

- **Code Splitting**: Implement lazy loading for routes
- **Bundle Analysis**: Use `npm run build -- --analyze`
- **Caching**: Configure proper cache headers

### 2. Backend Optimization

- **Function Cold Starts**: Keep functions warm with scheduled executions
- **Database Queries**: Optimize with proper indexing
- **File Storage**: Implement compression and CDN

## Security Best Practices

### 1. API Security

- **HMAC Validation**: Always validate request signatures
- **Rate Limiting**: Implement per-user and per-IP limits
- **Input Validation**: Sanitize all user inputs

### 2. Data Protection

- **Encryption**: Enable encryption for sensitive data
- **Access Control**: Use principle of least privilege
- **Audit Logging**: Log all data access and modifications

### 3. Infrastructure Security

- **HTTPS Only**: Enforce SSL/TLS for all communications
- **Environment Variables**: Never commit secrets to version control
- **Regular Updates**: Keep dependencies and runtime updated

## Troubleshooting Production Issues

### Common Production Problems

1. **Function Timeouts**
   - Increase timeout in function settings
   - Optimize PDF generation code
   - Check memory usage

2. **Email Delivery Issues**
   - Verify SMTP credentials
   - Check spam folder settings
   - Monitor email service quotas

3. **Authentication Problems**
   - Verify JWT token expiration settings
   - Check CORS configuration
   - Review user role assignments

### Emergency Procedures

1. **Function Rollback**
   \`\`\`bash
   # Deploy previous version
   appwrite deploy function --functionId generate-invoice --code previous-version.tar.gz
   \`\`\`

2. **Database Recovery**
   \`\`\`bash
   # Restore from backup
   appwrite databases importCollection --databaseId billing-db --file backup.json
   \`\`\`

3. **Frontend Rollback**
   - Use hosting provider's rollback feature
   - Or deploy previous Git commit

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Review function execution logs
- **Monthly**: Analyze storage usage and cleanup old files
- **Quarterly**: Security audit and dependency updates

### Monitoring Checklist

- [ ] Function execution success rates
- [ ] Email delivery rates
- [ ] Storage usage trends
- [ ] Authentication failure rates
- [ ] API response times
- [ ] Error log patterns

For additional support, refer to:
- [Appwrite Documentation](https://appwrite.io/docs)
- [React Documentation](https://react.dev)
- Project issue tracker
