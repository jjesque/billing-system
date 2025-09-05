const { Client, Users } = require("node-appwrite")
const { PERMISSIONS, hasPermission } = require("../security/permissions")

/**
 * Authentication Middleware for Appwrite Functions
 */
class AuthMiddleware {
  constructor(client) {
    this.client = client
    this.users = new Users(client)
  }

  /**
   * Validate JWT token and extract user info
   */
  async validateToken(req) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Missing or invalid authorization header")
    }

    const token = authHeader.substring(7)

    try {
      // Validate token with Appwrite
      const session = await this.client.account.getSession(token)
      const user = await this.users.get(session.userId)

      return {
        userId: user.$id,
        email: user.email,
        role: user.labels?.role || "viewer",
        session: session,
      }
    } catch (error) {
      throw new Error("Invalid or expired token")
    }
  }

  /**
   * Check if user has required permission
   */
  checkPermission(user, requiredPermission) {
    if (!hasPermission(user.role, requiredPermission)) {
      throw new Error(`Insufficient permissions. Required: ${requiredPermission}`)
    }
    return true
  }

  /**
   * Middleware wrapper for functions
   */
  requireAuth(requiredPermission = null) {
    return async (req, res, next) => {
      try {
        const user = await this.validateToken(req)
        req.user = user

        if (requiredPermission) {
          this.checkPermission(user, requiredPermission)
        }

        next()
      } catch (error) {
        return res.status(401).json({
          error: "Authentication failed",
          message: error.message,
        })
      }
    }
  }
}

module.exports = { AuthMiddleware }
