const express = require('express');
const router = express.Router();
const arqueoController = require('../controllers/arqueoController');

// Mostrar arqueo
router.get('/', arqueoController.verArqueo);

// Guardar arqueo
router.post('/guardar', arqueoController.guardarArqueo);

// Exportar PDF
router.get('/exportar/pdf', arqueoController.exportarPDF);

module.exports = router;
