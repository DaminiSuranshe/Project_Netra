const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ----------------------
// JWT AUTHENTICATION MIDDLEWARE
// ----------------------
function authMiddleware(req, res, next) {
  // Support "Bearer <token>" header
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded; // store decoded payload
    next();
  });
}

// ----------------------
// ROLE-BASED ACCESS
// ----------------------
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = authMiddleware;       // default export
module.exports.requireRole = requireRole; // named export for role check
