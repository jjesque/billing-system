const crypto = require("crypto")

/**
 * Generate HMAC signature for API requests
 * @param {Object} payload - The request payload
 * @param {string} secret - The HMAC secret key
 * @returns {string} - The HMAC signature
 */
function generateHMACSignature(payload, secret) {
  const payloadString = JSON.stringify(payload)
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex")
}

/**
 * Verify HMAC signature
 * @param {Object} payload - The request payload
 * @param {string} signature - The provided signature
 * @param {string} secret - The HMAC secret key
 * @returns {boolean} - Whether the signature is valid
 */
function verifyHMACSignature(payload, signature, secret) {
  const expectedSignature = generateHMACSignature(payload, secret)
  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
}

// Example usage
if (require.main === module) {
  const samplePayload = {
    sourceSystem: "ExistingBillingSystem",
    sourceId: "PO-2025-0812-123",
    client: {
      name: "Acme Corp",
      email: "finance@acme.example",
    },
    items: [
      {
        description: "Development services",
        qty: 120,
        unitPrice: 30.5,
        taxCategory: "standard",
      },
    ],
    currency: "USD",
    dueDate: "2025-09-30",
    emailRecipients: ["finance@acme.example"],
  }

  const secret = "your-hmac-secret-key-here"
  const signature = generateHMACSignature(samplePayload, secret)

  console.log("Sample Payload:", JSON.stringify(samplePayload, null, 2))
  console.log("HMAC Signature:", signature)
  console.log("Verification:", verifyHMACSignature(samplePayload, signature, secret))

  // Example curl command
  console.log("\nExample curl command:")
  console.log(`curl -X POST \\`)
  console.log(`  "http://localhost/v1/functions/generate-invoice/executions" \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  console.log(`  -H "X-Appwrite-Project: billing-system" \\`)
  console.log(`  -H "X-Invoice-Signature: ${signature}" \\`)
  console.log(`  -d '${JSON.stringify(samplePayload)}'`)
}

module.exports = {
  generateHMACSignature,
  verifyHMACSignature,
}
