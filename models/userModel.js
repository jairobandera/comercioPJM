const db = require('../config/db');

const User = {
  findByUsername: (username, callback) => {
    db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0]);
    });
  }
};

module.exports = User;
