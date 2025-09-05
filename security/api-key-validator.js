const crypto = require("crypto")

/**
 * HMAC-based API Key Validator
 * Validates incoming requests using HMAC signature
 */
class APIKeyValidator {
  constructor(secretKey) {
    this.secretKey = secretKey
  }

  /**
   * Generate HMAC signature for request validation
   */
  generateSignature(payload, timestamp) {
    const message = `${timestamp}.${JSON.stringify(payload)}`
    return crypto.createHmac("sha256", this.secretKey).update(message).digest("hex")
  }

  /**
   * Validate incoming request signature
   */
  validateRequest(payload, signature, timestamp, tolerance = 300) {
    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > tolerance) {
      throw new Error("Request timestamp too old")
    }

    // Generate expected signature
    const expectedSignature = this.generateSignature(payload, timestamp)

    // Compare signatures using constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))) {
      throw new Error("Invalid signature")
    }

    return true
  }
}

module.exports = { APIKeyValidator }
