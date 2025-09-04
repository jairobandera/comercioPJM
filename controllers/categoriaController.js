const Categoria = require('../models/categoriaModel');

exports.listarCategorias = (req, res) => {
  Categoria.getAll((err, results) => {
    if (err) results = [];
    res.render('categorias', {
      categorias: results,
      mensaje: req.session.mensaje || null
    });
    req.session.mensaje = null;
  });
};

exports.crearCategoria = (req, res) => {
  const { nombre } = req.body;
  Categoria.create(nombre, (err) => {
    req.session.mensaje = err ? 'Error al crear categoría' : 'Categoría creada con éxito';
    res.redirect('/categorias');
  });
};

exports.eliminarCategoria = (req, res) => {
  const { id } = req.params;
  Categoria.delete(id, (err) => {
    req.session.mensaje = err ? 'Error al eliminar categoría' : 'Categoría eliminada';
    res.redirect('/categorias');
  });
};
