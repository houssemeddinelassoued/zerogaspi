const express = require('express');
const router = express.Router();
const basketController = require('../controllers/basketController');

// Route to get all baskets
router.get('/', basketController.getAllBaskets);

// Route to create a new basket
router.post('/', basketController.createBasket);

// Route to get a specific basket by ID
router.get('/:id', basketController.getBasketById);

// Route to update a basket by ID
router.put('/:id', basketController.updateBasket);

// Route to delete a basket by ID
router.delete('/:id', basketController.deleteBasket);

module.exports = router;