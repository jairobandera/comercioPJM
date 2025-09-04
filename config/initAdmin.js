const bcrypt = require('bcryptjs');
const db = require('./db');

function initAdminUser() {
  const username = 'admin';
  const plainPassword = 'admin123';

  // Buscar si ya existe
  db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error al buscar admin:', err);
      return;
    }

    if (results.length > 0) {
      console.log('✅ Usuario admin ya existe');
    } else {
      // Crear nuevo admin con contraseña encriptada
      bcrypt.hash(plainPassword, 10, (err, hash) => {
        if (err) {
          console.error('Error al encriptar contraseña:', err);
          return;
        }

        db.query(
          'INSERT INTO usuarios (username, password) VALUES (?, ?)',
          [username, hash],
          (err) => {
            if (err) {
              console.error('Error al insertar admin:', err);
              return;
            }
            console.log('🚀 Usuario admin creado con éxito (user: admin / pass: admin123)');
          }
        );
      });
    }
  });
}

module.exports = initAdminUser;
