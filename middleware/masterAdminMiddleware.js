/**
 * masterAdminMiddleware.js
 *
 * ADD THIS FILE TO ALL 3 PROJECT BACKENDS
 *
 * Usage in each project's route file:
 *   const { isMasterAdmin } = require('./middleware/masterAdminMiddleware')
 *   router.get('/admin/users', isMasterAdmin, getAllUsers)
 *
 * OR add it as a global middleware before your admin routes:
 *   app.use('/api/v2', isMasterAdmin)   // Mall of Cayman
 *   app.use('/api/admin', isMasterAdmin) // CayEats & DCC
 *
 * Set this env var in each project's .env:
 *   MASTER_ADMIN_SECRET=your_super_secret_master_key_change_this_in_production
 *   (must be the SAME value as master backend's MASTER_ADMIN_SECRET)
 */

const isMasterAdmin = (req, res, next) => {
  const secret = req.headers["x-master-admin-secret"];

  if (!secret) {
    return res.status(401).json({
      success: false,
      message: "Master admin secret missing",
    });
  }

  if (secret !== process.env.MASTER_ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      message: "Invalid master admin secret",
    });
  }

  // Mark request as coming from master admin (useful for audit logs)
  req.isMasterAdmin = true;
  next();
};

/**
 * Combined middleware: allows EITHER a logged-in admin OR the master admin secret.
 * Use this if you want both your existing admin panel AND master admin to work.
 *
 * Usage: router.get('/admin/users', allowAdminOrMaster, getAllUsers)
 */
const allowAdminOrMaster = (req, res, next) => {
  const secret = req.headers["x-master-admin-secret"];
  if (secret && secret === process.env.MASTER_ADMIN_SECRET) {
    req.isMasterAdmin = true;
    return next();
  }
  // Fall through to your existing isAuthenticated + isAdmin middleware
  next();
};

module.exports = { isMasterAdmin, allowAdminOrMaster };
