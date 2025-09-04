const db = require('../config/db');

const Categoria = {
  getAll: (callback) => {
    db.query('SELECT * FROM categorias ORDER BY id DESC', callback);
  },
  create: (nombre, callback) => {
    db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre], callback);
  },
  delete: (id, callback) => {
    db.query('DELETE FROM categorias WHERE id = ?', [id], callback);
  }
};

module.exports = Categoria;
