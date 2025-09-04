const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Mostrar login
router.get('/', (req, res) => {
  res.render('login', { error: null, clearLocal: false });
});

// Procesar login
router.post('/login', authController.login);

// Cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;
