const express = require('express');
const router  = express.Router();
const partnerController = require('../controllers/partnerController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Lister tous les partenaires validés (public)
router.get('/', partnerController.getAllPartners);

// Profil d'un partenaire (public)
router.get('/:id', partnerController.getPartnerById);

// Mettre à jour son propre profil (partenaire authentifié)
router.put('/:id', authMiddleware, requireRole('partner', 'admin'), partnerController.updatePartner);

module.exports = router;