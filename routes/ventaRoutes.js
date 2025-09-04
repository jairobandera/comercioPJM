const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Registrar venta
router.post('/', ventaController.registrarVenta);

// Ver ticket
router.get('/ticket/:id', ventaController.verTicket);

// Listar ventas
router.get('/', ventaController.listarVentas);

// Exportar
router.get('/export/pdf', ventaController.exportarPDF);

module.exports = router;
