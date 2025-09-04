const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // tu usuario MySQL
  password: '',      // tu contraseña MySQL
  database: 'comercio',
  decimalNumbers: true   // 👈 convierte DECIMAL a Number automáticamente
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL - BD comercio');
});

module.exports = connection;
