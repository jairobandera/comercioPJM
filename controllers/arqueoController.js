const db = require('../config/db');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

exports.verArqueo = (req, res) => {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const sqlVentas = `SELECT IFNULL(SUM(total),0) AS totalVentas, COUNT(*) AS cantidadVentas 
                       FROM ventas WHERE DATE(fecha) = ?`;
    const sqlGastos = `SELECT IFNULL(SUM(monto),0) AS totalGastos, COUNT(*) AS cantidadGastos 
                       FROM gastos WHERE DATE(fecha) = ?`;
    const sqlHistorial = `SELECT * FROM arqueo_caja ORDER BY fecha_apertura DESC LIMIT 20`;

    db.query(sqlVentas, [hoy], (err1, ventas) => {
        if (err1) return res.send("Error consultando ventas");

        db.query(sqlGastos, [hoy], (err2, gastos) => {
            if (err2) return res.send("Error consultando gastos");

            db.query(sqlHistorial, (err3, historial) => {
                if (err3) historial = [];

                const totalVentas = ventas[0].totalVentas || 0;
                const totalGastos = gastos[0].totalGastos || 0;
                const resultado = totalVentas - totalGastos;

                res.render("arqueo", {
                    totalVentas,
                    cantidadVentas: ventas[0].cantidadVentas,
                    totalGastos,
                    cantidadGastos: gastos[0].cantidadGastos,
                    resultado,
                    fecha: hoy,
                    historial,
                    mensaje: req.session.mensaje || null
                });
                req.session.mensaje = null;
            });
        });
    });
};

exports.guardarArqueo = (req, res) => {
    const { totalVentas, totalGastos, resultado } = req.body;
    const hoy = new Date();

    const sql = `INSERT INTO arqueo_caja (apertura, cierre, fecha_apertura, fecha_cierre)
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [totalVentas, resultado, hoy, hoy], (err) => {
        if (err) {
            console.error("❌ Error guardando arqueo:", err);
            req.session.mensaje = "Error al guardar arqueo";
        } else {
            req.session.mensaje = "Arqueo guardado con éxito";
        }
        res.redirect("/arqueo");
    });
};

exports.exportarPDF = (req, res) => {
    const { totalVentas, totalGastos, resultado, fecha } = req.query;

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const pdfPath = path.join(__dirname, `../public/tickets/arqueo_${fecha}.pdf`);

    if (!fs.existsSync(path.dirname(pdfPath))) {
        fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    }

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // === Encabezado verde ===
    doc.rect(0, 0, 595.28, 50).fill('#198754');
    doc.fillColor('white').fontSize(20).text("Arqueo de Caja", 0, 15, { align: "center" });
    doc.moveDown(3);

    // Fecha
    doc.fillColor('black').fontSize(12).text(`Fecha: ${fecha}`, { align: "left" });
    doc.moveDown(1);

    // === Detalle ===
    doc.fontSize(14).fillColor('black').text("Resumen del Día", { underline: true });
    doc.moveDown(1);

    doc.fillColor('#198754').fontSize(12).text(`Ventas del día: $${Number(totalVentas).toFixed(2)}`);
    doc.fillColor('#dc3545').fontSize(12).text(`Gastos del día: $${Number(totalGastos).toFixed(2)}`);
    doc.moveDown(1.5);

    // === Resultado en recuadro oscuro ===
    doc.rect(50, doc.y, 500, 30).fill('#212529');
    doc.fillColor('white').fontSize(16)
        .text(`RESULTADO: $${Number(resultado).toFixed(2)}`, 55, doc.y - 20, { align: "center" });

    doc.end();

    stream.on("finish", () => {
        res.download(pdfPath);
    });
};
