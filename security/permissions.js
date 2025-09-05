/**
 * Role-based Access Control (RBAC) Configuration
 */
const ROLES = {
  ADMIN: "admin",
  BILLING_MANAGER: "billing_manager",
  VIEWER: "viewer",
  API_USER: "api_user",
}

const PERMISSIONS = {
  // Invoice permissions
  INVOICE_CREATE: "invoice:create",
  INVOICE_READ: "invoice:read",
  INVOICE_UPDATE: "invoice:update",
  INVOICE_DELETE: "invoice:delete",
  INVOICE_RESEND: "invoice:resend",

  // Log permissions
  LOGS_READ: "logs:read",
  LOGS_EXPORT: "logs:export",

  // Settings permissions
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",

  // User management
  USER_MANAGE: "user:manage",
}

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_DELETE,
    PERMISSIONS.INVOICE_RESEND,
    PERMISSIONS.LOGS_READ,
    PERMISSIONS.LOGS_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.USER_MANAGE,
  ],
  [ROLES.BILLING_MANAGER]: [
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_RESEND,
    PERMISSIONS.LOGS_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
  [ROLES.VIEWER]: [PERMISSIONS.INVOICE_READ, PERMISSIONS.LOGS_READ],
  [ROLES.API_USER]: [PERMISSIONS.INVOICE_CREATE, PERMISSIONS.INVOICE_RESEND],
}

/**
 * Check if user has required permission
 */
function hasPermission(userRole, requiredPermission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(requiredPermission)
}

/**
 * Middleware to check permissions
 */
function requirePermission(permission) {
  return (req, res, next) => {
    const userRole = req.user?.role

    if (!userRole || !hasPermission(userRole, permission)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: permission,
      })
    }

    next()
  }
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  requirePermission,
}
