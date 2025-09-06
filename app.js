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
    saveUninitialized: false, // 👈 evita sesiones vacías
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60, // 👈 1 hora
        sameSite: 'lax'
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware de protección
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

// Rutas públicas (solo login/logout)
app.use('/', authRoutes);

// Rutas protegidas
app.get('/dashboard', isAuthenticated, (req, res) => {
    const hoy = new Date().toISOString().split("T")[0];

    const sqlVentasDia = `SELECT IFNULL(SUM(total),0) AS totalVentas FROM ventas WHERE DATE(fecha) = ?`;
    const sqlGastosDia = `SELECT IFNULL(SUM(monto),0) AS totalGastos FROM gastos WHERE DATE(fecha) = ?`;

    db.query(sqlVentasDia, [hoy], (err1, ventasDia) => {
        const totalVentas = ventasDia && ventasDia[0] ? ventasDia[0].totalVentas : 0;

        db.query(sqlGastosDia, [hoy], (err2, gastosDia) => {
            const totalGastos = gastosDia && gastosDia[0] ? gastosDia[0].totalGastos : 0;

            ventaController.obtenerVentas((err, ventas) => {
                if (err) ventas = [];

                db.query(`
                  SELECT p.id, p.nombre, p.precio, c.nombre AS categoria
                  FROM productos p
                  JOIN categorias c ON p.id_categoria = c.id
                `, (err2, productos) => {
                    if (err2) productos = [];

                    ventaController.obtenerUltimaVenta((err3, ultimaVenta) => {
                        if (err3) ultimaVenta = null;

                        res.render('dashboard', {
                            user: req.session.user,
                            ventas,
                            productos,
                            ultimaVenta,
                            totalVentas,
                            totalGastos,
                            mensaje: req.session.mensaje || null,
                            ticketUrl: req.session.ticketUrl || null
                        });

                        req.session.mensaje = null;
                        req.session.ticketUrl = null;
                    });
                });
            });
        });
    });
});

// 👇 Aplica protección a todos los módulos
app.use('/categorias', isAuthenticated, categoriaRoutes);
app.use('/productos', isAuthenticated, productoRoutes);
app.use('/ventas', isAuthenticated, ventaRoutes);
app.use('/gastos', isAuthenticated, gastoRoutes);
app.use('/arqueo', isAuthenticated, arqueoRoutes);

// Inicializar admin automáticamente
initAdminUser();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
