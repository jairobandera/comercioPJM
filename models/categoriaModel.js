const db = require('../config/db');

const Categoria = {
  getAll: (callback) => {
    db.query("SELECT * FROM categorias WHERE activo = 1 ORDER BY id DESC", callback);
  },

  findByName: (nombre, callback) => {
    db.query("SELECT * FROM categorias WHERE nombre = ?", [nombre], callback);
  },

  create: (nombre, callback) => {
    db.query("INSERT INTO categorias (nombre, activo) VALUES (?, 1)", [nombre], callback);
  },

  reactivate: (id, callback) => {
    db.query("UPDATE categorias SET activo = 1 WHERE id = ?", [id], callback);
  },

  update: (id, nombre, callback) => {
    db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id], callback);
  },

  deactivate: (id, callback) => {
    db.query("UPDATE categorias SET activo = 0 WHERE id = ?", [id], callback);
  }
};

module.exports = Categoria;
