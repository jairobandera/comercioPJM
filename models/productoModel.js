const db = require('../config/db');

const Producto = {
  getAll: (callback) => {
    db.query(
      `SELECT p.*, c.nombre AS categoria 
       FROM productos p 
       JOIN categorias c ON p.id_categoria = c.id 
       WHERE p.activo = 1 
       ORDER BY p.id DESC`,
      callback
    );
  },

  create: (nombre, precio, id_categoria, tipo_venta, callback) => {
    db.query(
      `INSERT INTO productos (nombre, precio, id_categoria, tipo_venta, activo) 
       VALUES (?, ?, ?, ?, 1)`,
      [nombre, precio, id_categoria, tipo_venta],
      callback
    );
  },

  // ahora "delete" desactiva
  delete: (id, callback) => {
    db.query(
      `UPDATE productos SET activo = 0 WHERE id = ?`,
      [id],
      callback
    );
  },

  findByName: (nombre, callback) => {
    db.query("SELECT * FROM productos WHERE nombre = ?", [nombre], callback);
  },

  buscar: (q, callback) => {
    db.query(
      `SELECT p.*, c.nombre AS categoria 
       FROM productos p 
       JOIN categorias c ON p.id_categoria = c.id 
       WHERE p.activo = 1 
       AND (p.nombre LIKE ? OR c.nombre LIKE ?)`,
      [`%${q}%`, `%${q}%`],
      callback
    );
  },

  reactivate: (id, nombre, precio, id_categoria, tipo_venta, callback) => {
    db.query(
      "UPDATE productos SET activo = 1, nombre=?, precio=?, id_categoria=?, tipo_venta=? WHERE id=?",
      [nombre, precio, id_categoria, tipo_venta, id],
      callback
    );
  }
};

module.exports = Producto;
