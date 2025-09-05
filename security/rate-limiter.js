/**
 * Rate Limiting Configuration
 */
class RateLimiter {
  constructor() {
    this.requests = new Map()
    this.cleanup()
  }

  /**
   * Check if request is within rate limit
   */
  isAllowed(identifier, limit = 100, windowMs = 60000) {
    const now = Date.now()
    const windowStart = now - windowMs

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const userRequests = this.requests.get(identifier)

    // Remove old requests outside the window
    const validRequests = userRequests.filter((time) => time > windowStart)

    if (validRequests.length >= limit) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }

  /**
   * Clean up old entries periodically
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now()
      const cutoff = now - 300000 // 5 minutes

      for (const [identifier, requests] of this.requests.entries()) {
        const validRequests = requests.filter((time) => time > cutoff)
        if (validRequests.length === 0) {
          this.requests.delete(identifier)
        } else {
          this.requests.set(identifier, validRequests)
        }
      }
    }, 60000) // Clean every minute
  }
}

module.exports = { RateLimiter }
