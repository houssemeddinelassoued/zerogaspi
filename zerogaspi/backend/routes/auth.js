const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');

// Créer un compte (client ou partenaire)
router.post('/register', authController.register);

// Se connecter — retourne un JWT
router.post('/login', authController.login);

module.exports = router;