const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT.
 * Vérifie le header Authorization: Bearer <token>.
 * Injecte req.user = { id, role } pour les handlers suivants.
 */
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant ou malformé.' });
    }

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // On attache uniquement les données publiques du token
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch {
        return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};

/**
 * Fabrique un middleware qui restreint l'accès à un ou plusieurs rôles.
 * Usage : router.post('/', authMiddleware, requireRole('partner'), handler)
 * @param {...string} roles
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès refusé : rôle insuffisant.' });
    }
    next();
};

module.exports = { authMiddleware, requireRole };