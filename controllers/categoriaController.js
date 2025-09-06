const db = require('../config/db');
const Categoria = require('../models/categoriaModel');

// Listar categorías activas
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

// Crear categoria
exports.crearCategoria = (req, res) => {
  const { nombre } = req.body;

  Categoria.findByName(nombre, (err, results) => {
    if (err) {
      req.session.mensaje = "❌ Error en base de datos";
      return res.redirect('/categorias');
    }

    if (results.length > 0) {
      const categoria = results[0];
      if (categoria.activo === 1) {
        req.session.mensaje = "❌ La categoría ya existe y está activa";
        return res.redirect('/categorias');
      } else {
        // Estaba desactivada → reactivar
        Categoria.reactivate(categoria.id, (err2) => {
          req.session.mensaje = err2
            ? "❌ Error al reactivar categoría"
            : "✅ Categoría reactivada con éxito";
          return res.redirect('/categorias');
        });
      }
    } else {
      // Crear nueva
      Categoria.create(nombre, (err3) => {
        req.session.mensaje = err3
          ? "❌ Error al crear categoría"
          : "✅ Categoría creada con éxito";
        res.redirect('/categorias');
      });
    }
  });
};

// Editar categoría
exports.editarCategoria = (req, res) => {
  const { id, nombre } = req.body;

  if (!id || !nombre) {
    req.session.mensaje = "Todos los campos son obligatorios";
    return res.redirect("/categorias");
  }

  Categoria.update(id, nombre, (err) => {
    if (err) {
      console.error("❌ Error al editar categoría:", err);
      req.session.mensaje = "❌ Error al editar categoría";
      return res.redirect("/categorias");
    }
    req.session.mensaje = "✅ Categoría actualizada con éxito";
    res.redirect("/categorias");
  });
};

// 🔴 Desactivar categoría y todos sus productos asociados
exports.desactivarCategoria = (req, res) => {
  const { id } = req.params;

  const sqlCategoria = "UPDATE categorias SET activo = 0 WHERE id = ?";
  const sqlProductos = "UPDATE productos SET activo = 0 WHERE id_categoria = ?";

  db.query(sqlCategoria, [id], (err1) => {
    if (err1) {
      console.error("❌ Error al desactivar categoría:", err1);
      req.session.mensaje = "❌ Error al desactivar categoría";
      return res.redirect("/categorias");
    }

    db.query(sqlProductos, [id], (err2) => {
      if (err2) {
        console.error("❌ Error al desactivar productos de la categoría:", err2);
        req.session.mensaje = "⚠️ Categoría desactivada, pero hubo un error al desactivar los productos";
        return res.redirect("/categorias");
      }

      req.session.mensaje = "✅ Categoría y sus productos desactivados con éxito";
      res.redirect("/categorias");
    });
  });
};
