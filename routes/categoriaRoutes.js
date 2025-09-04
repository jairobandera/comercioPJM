const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.listarCategorias);
router.post('/', categoriaController.crearCategoria);
router.get('/delete/:id', categoriaController.eliminarCategoria);

module.exports = router;
