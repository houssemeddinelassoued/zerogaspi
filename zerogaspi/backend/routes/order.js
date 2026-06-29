const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Créer une commande en tant que client connecté
router.post('/', authMiddleware, requireRole('consumer'), orderController.createOrder);

// Lister ses propres commandes
router.get('/my', authMiddleware, requireRole('consumer'), orderController.getMyOrders);

// Récupérer une commande par identifiant (client propriétaire ou admin)
router.get('/:id', authMiddleware, requireRole('consumer', 'admin'), orderController.getOrderById);

module.exports = router;
