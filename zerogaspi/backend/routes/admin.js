const express = require('express');
const router  = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Toutes les routes admin nécessitent un token + rôle admin
router.use(authMiddleware, requireRole('admin'));

// Partenaires en attente de validation
router.get('/partners/pending', adminController.getPendingPartners);

// Valider un partenaire
router.put('/partners/:id/validate', adminController.validatePartner);

// Statistiques globales
router.get('/stats', adminController.getStats);

module.exports = router;