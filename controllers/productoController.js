const db = require('../config/db');
const Producto = require('../models/productoModel');
const Categoria = require('../models/categoriaModel');

exports.listarProductos = (req, res) => {
  Producto.getAll((err, results) => {
    if (err) results = [];
    Categoria.getAll((err2, categorias) => {
      if (err2) categorias = [];
      res.render('productos', {
        productos: results,
        categorias,
        mensaje: req.session.mensaje || null
      });
      req.session.mensaje = null;
    });
  });
};

exports.crearProducto = (req, res) => {
  const { nombre, precio, id_categoria, tipo_venta } = req.body;

  Producto.findByName(nombre, (err, results) => {
    if (err) {
      req.session.mensaje = "❌ Error en base de datos";
      return res.redirect('/productos');
    }

    if (results.length > 0) {
      const producto = results[0];
      if (producto.activo === 1) {
        req.session.mensaje = "❌ El producto ya existe y está activo";
        return res.redirect('/productos');
      } else {
        // Reactivar con los datos nuevos
        Producto.reactivate(producto.id, nombre, precio, id_categoria, tipo_venta, (err2) => {
          req.session.mensaje = err2
            ? "❌ Error al reactivar producto"
            : "✅ Producto reactivado y actualizado con éxito";
          return res.redirect('/productos');
        });
      }
    } else {
      // Crear nuevo
      Producto.create(nombre, precio, id_categoria, tipo_venta, (err3) => {
        req.session.mensaje = err3
          ? "❌ Error al crear producto"
          : "✅ Producto creado con éxito";
        res.redirect('/productos');
      });
    }
  });
};

exports.eliminarProducto = (req, res) => {
  const { id } = req.params;
  Producto.delete(id, (err) => {
    req.session.mensaje = err
      ? '❌ Error al desactivar producto'
      : '✅ Producto desactivado correctamente';
    res.redirect('/productos');
  });
};

// 🔎 buscador para el dashboard
exports.buscarProductos = (req, res) => {
  const q = req.query.q || "";
  Producto.buscar(q, (err, results) => {
    if (err) {
      console.error("❌ Error en búsqueda de productos:", err);
      return res.json([]);
    }
    res.json(results);
  });
};

// Editar producto
exports.editarProducto = (req, res) => {
  const { id, nombre, precio, id_categoria, tipo_venta } = req.body;

  if (!id || !nombre || !precio || !id_categoria || !tipo_venta) {
    req.session.mensaje = "Todos los campos son obligatorios";
    return res.redirect("/productos");
  }

  const sql = "UPDATE productos SET nombre = ?, precio = ?, id_categoria = ?, tipo_venta = ? WHERE id = ?";
  db.query(sql, [nombre, precio, id_categoria, tipo_venta, id], (err) => {
    if (err) {
      console.error("❌ Error al editar producto:", err);
      req.session.mensaje = "Error al editar producto";
      return res.redirect("/productos");
    }

    req.session.mensaje = "✅ Producto actualizado con éxito";
    res.redirect("/productos");
  });
};
