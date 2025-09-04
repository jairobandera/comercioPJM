const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

exports.login = (req, res) => {
  const { username, password } = req.body;

  User.findByUsername(username, (err, user) => {
    if (err) return res.send('Error en la base de datos');
    if (!user) return res.render('login', { error: 'Usuario no encontrado', clearLocal: false });

    // Verificar contraseña
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.send('Error en comparación');
      if (!isMatch) {
        return res.render('login', { error: 'Contraseña incorrecta', clearLocal: false });
      }

      // Guardar sesión
      req.session.user = { id: user.id, username: user.username };
      res.redirect('/dashboard');
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.render('login', { error: null, clearLocal: true });
  });
};
