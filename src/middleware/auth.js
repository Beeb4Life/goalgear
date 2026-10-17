/**
 * GoalGear - Authentication & Authorization Middleware
 *
 * Enforces role checks and JWT verification server-side.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_goalgear_jwt_token_key_change_me_in_production';

/**
 * Verifies JWT token from Authorization header (Bearer <token>)
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Authentication token required.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired authentication token.' });
    }
}

/**
 * Ensures the authenticated user possesses the 'admin' role
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
    }
    next();
}

/**
 * Optional authentication: decodes user if token provided, but does not block guests
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            // Ignore invalid optional tokens
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
}

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth,
    JWT_SECRET
};
