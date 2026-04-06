/**
 * masterAdminMiddleware.js
 *
 * Copy into:
 *   Mall of Cayman  →  middleware/masterAdminMiddleware.js
 *   CayEats         →  middleware/masterAdminMiddleware.js
 *   DCC             →  middleware/masterAdminMiddleware.js
 *
 * This does NOT break existing admin logins. It only adds a bypass path
 * for requests that carry the x-master-admin-secret header.
 * Normal users/admins logging in with JWT are completely unaffected.
 */

const allowAdminOrMaster = (req, res, next) => {
  const secret = req.headers["x-master-admin-secret"];

  // Not a master admin request — go to normal auth
  if (!secret || secret !== process.env.MASTER_ADMIN_SECRET) {
    return next();
  }

  // ✅ Master admin request confirmed
  req.isMasterAdmin = true;

  // Detect which project this is in by checking the URL prefix
  const isMoC = req.originalUrl.startsWith("/api/v2");

  // Populate req.user so ALL downstream auth checks pass without DB lookups:
  // - MoC isAuthenticated: checks req.user exists (skipped via isMasterAdmin flag)
  // - MoC isAdmin(): checks req.user.role === "Admin" 
  // - MoC requirePermission(): checks isMasterAdmin flag
  // - CayEats protect: checks isMasterAdmin flag
  // - CayEats adminOnly: checks req.user.role === "admin"
  // - DCC protect: checks isMasterAdmin flag  
  // - DCC authorize: checks isMasterAdmin flag
  req.user = {
    _id:      "000000000000000000000000",
    id:       "000000000000000000000000",
    name:     "Master Admin",
    email:    "master@admin.internal",
    role:     isMoC ? "Admin" : "admin",   // MoC uses "Admin", CayEats uses "admin"
    isActive: true,
    isBanned: false,
    isEmailVerified: true,
    permissions: {
      canManageUsers:      true,
      canManageVendors:    true,
      canManageCategories: true,
      canManageProducts:   true,
      canApproveProducts:  true,
      canApproveVendors:   true,
      canManageOrders:     true,
      canManageContent:    true,
      canManageSettings:   true,
      canViewAnalytics:    true,
    },
    save:            async () => {},
    comparePassword: async () => true,
  };

  return next();
};

module.exports = { allowAdminOrMaster };
