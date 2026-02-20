// middleware/role.middleware.js
module.exports = (requiredRole) => (req, res, next) => {
  console.log('[role middleware] Checking role for path:', req.path);
  console.log('[role middleware] req.user exists?', !!req.user);

  if (!req.user) {
    console.log('[role middleware] No req.user → 401');
    return res.status(401).json({ message: 'Unauthorized - authentication required' });
  }

  console.log('[role middleware] User role is:', req.user.role);

  if (!req.user.role) {
    console.log('[role middleware] User has no role field → 403');
    return res.status(403).json({ message: 'Access denied - no role assigned' });
  }

  if (req.user.role !== requiredRole) {
    console.log(`[role middleware] Role mismatch: has ${req.user.role}, needs ${requiredRole} → 403`);
    return res.status(403).json({ message: `Access denied - requires ${requiredRole} role` });
  }

  console.log('[role middleware] Role check passed → next()');
  next();
};