const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.listarProductos);
router.post('/', productoController.crearProducto);
router.get('/delete/:id', productoController.eliminarProducto);
router.get('/buscar', productoController.buscarProductos);

module.exports = router;
