const db = require('../config/db');

const Producto = {
  getAll: (callback) => {
    const sql = `
      SELECT p.id, p.nombre, p.precio, p.tipo_venta, c.nombre AS categoria
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id
      ORDER BY p.id DESC
    `;
    db.query(sql, callback);
  },
  create: (nombre, precio, tipo_venta, id_categoria, callback) => {
    db.query(
      'INSERT INTO productos (nombre, precio, tipo_venta, id_categoria) VALUES (?, ?, ?, ?)',
      [nombre, precio, tipo_venta, id_categoria],
      callback
    );
  },
  delete: (id, callback) => {
    db.query('DELETE FROM productos WHERE id = ?', [id], callback);
  },
  buscar: (q, callback) => {
    const sql = `
    SELECT p.id, p.nombre, p.precio, p.tipo_venta, c.nombre AS categoria
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id
    WHERE p.nombre LIKE ? OR c.nombre LIKE ?
    LIMIT 10
  `;
    db.query(sql, [`%${q}%`, `%${q}%`], callback);
  }
};

module.exports = Producto;
