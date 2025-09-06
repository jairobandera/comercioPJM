const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.listarCategorias);
router.post('/', categoriaController.crearCategoria);
router.post('/editar', categoriaController.editarCategoria);
router.get('/desactivar/:id', categoriaController.desactivarCategoria);
router.get('/delete/:id', categoriaController.desactivarCategoria);

module.exports = router;
