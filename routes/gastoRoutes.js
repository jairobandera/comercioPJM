const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');

// Listar y formulario
router.get('/', gastoController.listarGastos);

// Crear gasto
router.post('/crear', gastoController.crearGasto);

// Exportar a PDF
router.get('/exportar/pdf', gastoController.exportarPDF);

module.exports = router;
