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
    Producto.create(nombre, precio, id_categoria, tipo_venta, (err) => {
        req.session.mensaje = err ? 'Error al crear producto' : 'Producto creado con éxito';
        res.redirect('/productos');
    });
};

exports.eliminarProducto = (req, res) => {
    const { id } = req.params;
    Producto.delete(id, (err) => {
        req.session.mensaje = err ? 'Error al eliminar producto' : 'Producto eliminado';
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
