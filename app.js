const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const initAdminUser = require('./config/initAdmin');
const ventaController = require('./controllers/ventaController');
const db = require('./config/db');

const app = express();
const PORT = 3000;

const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const gastoRoutes = require('./routes/gastoRoutes');
const arqueoRoutes = require('./routes/arqueoRoutes');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'secreto123',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/', authRoutes);

// Middleware de protección
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/');
}

// ✅ Dashboard protegido (solo una vez)
app.get('/dashboard', isAuthenticated, (req, res) => {
    ventaController.obtenerVentas((err, ventas) => {
        if (err) ventas = [];

        db.query(`
            SELECT p.id, p.nombre, p.precio, c.nombre AS categoria, p.tipo_venta
            FROM productos p
            JOIN categorias c ON p.id_categoria = c.id
        `, (err, productos) => {
            if (err) productos = [];

            // Guardar valores en variables locales ANTES de limpiar la sesión
            const mensaje = req.session.mensaje || null;
            const ticketUrl = req.session.ticketUrl || null;

            // Limpiar la sesión
            req.session.mensaje = null;
            req.session.ticketUrl = null;

            // Pasar los valores a la vista
            res.render('dashboard', {
                user: req.session.user,
                ventas,
                productos,
                mensaje,
                ticketUrl
            });
        });
    });
});

app.use('/categorias', categoriaRoutes);
app.use('/productos', productoRoutes);
app.use('/ventas', ventaRoutes);
app.use('/gastos', gastoRoutes);
app.use('/arqueo', arqueoRoutes);

// Inicializar admin automáticamente
initAdminUser();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
