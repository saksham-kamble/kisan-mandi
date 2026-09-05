const jwt = require('jsonwebtoken');
const db = require('../config/db');

/** Verify JWT and attach user to request */
const authenticate = async (req, res, next) => {
  try {
    let token;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    } else if (req.query.token) {
      // Allow token via query param (for J-Form receipt opened in new tab)
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db('farmers').where({ id: decoded.id }).first();
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { id: user.id, phone: user.phone, role: user.role, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/** Check if authenticated user is admin or super_admin */
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/** Check if authenticated user is strictly super_admin (District Nodal Officer / APMC Board Director) */
const authorizeSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin / District Nodal Officer access required' });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin, authorizeSuperAdmin };
