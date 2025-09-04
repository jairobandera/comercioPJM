const db = require('../config/db');
const PDFDocument = require('pdfkit');

exports.listarGastos = (req, res) => {
  let { desde, hasta } = req.query;

  // Si no hay fechas, usar HOY
  const hoy = new Date().toISOString().split("T")[0];
  if (!desde) desde = hoy;
  if (!hasta) hasta = hoy;

  const sql = `SELECT * FROM gastos WHERE DATE(fecha) BETWEEN ? AND ? ORDER BY fecha DESC`;
  db.query(sql, [desde, hasta], (err, results) => {
    if (err) {
      console.error("❌ Error al listar gastos:", err);
      return res.render('gastos', { gastos: [], total: 0, cantidad: 0, desde, hasta, mensaje: null });
    }

    const total = results.reduce((acc, g) => acc + parseFloat(g.monto), 0);
    const cantidad = results.length;

    res.render('gastos', {
      gastos: results,
      total,
      cantidad,
      desde,
      hasta,
      mensaje: req.session.mensaje || null
    });

    req.session.mensaje = null;
  });
};

// Guardar nuevo gasto
exports.crearGasto = (req, res) => {
  const { concepto, monto } = req.body;

  if (!concepto || !monto) {
    req.session.mensaje = "Todos los campos son obligatorios";
    return res.redirect('/gastos');
  }

  // 👇 Cambiar "concepto" por "descripcion"
  const sql = "INSERT INTO gastos (descripcion, monto) VALUES (?, ?)";

  db.query(sql, [concepto, monto], (err) => {
    if (err) {
      console.error("❌ Error al crear gasto:", err.sqlMessage || err);
      req.session.mensaje = "Error al registrar gasto";
      return res.redirect('/gastos');
    }

    req.session.mensaje = "✅ Gasto registrado con éxito";
    res.redirect('/gastos');
  });
};

exports.exportarPDF = (req, res) => {
  const { totalVentas, totalGastos, resultado, fecha } = req.query;

  const doc = new PDFDocument({ margin: 50 }); // 👈 margen más amplio
  res.setHeader("Content-Disposition", `attachment; filename=arqueo_${fecha}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // 🔹 Encabezado verde
  doc.rect(0, 0, doc.page.width, 60).fill("#198754");
  doc.fillColor("#fff").fontSize(20).text("Arqueo de Caja", 0, 20, { align: "center" });
  doc.moveDown(3);

  // 🔹 Fecha
  doc.fillColor("#000").fontSize(12).text(`Fecha: ${fecha}`, { align: "right" });
  doc.moveDown(2);

  // 🔹 Resumen del día
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#000")
    .text("Resumen del Día", { align: "center", underline: true });
  doc.moveDown(2);

  // 🔹 Totales (alineados con margen)
  doc.font("Helvetica").fontSize(12).fillColor("#198754")
    .text(`Ventas del día: $${Number(totalVentas).toFixed(2)}`, { align: "left", indent: 40 });
  
  doc.fillColor("#dc3545")
    .text(`Gastos del día: $${Number(totalGastos).toFixed(2)}`, { align: "left", indent: 40 });

  doc.moveDown(2);

  // 🔹 Resultado final en una caja
  doc.rect(50, doc.y, doc.page.width - 100, 30).fill("#212529"); // caja gris oscuro
  doc.fillColor("white").font("Helvetica-Bold").fontSize(14)
    .text(`RESULTADO: $${Number(resultado).toFixed(2)}`, 55, doc.y - 22, {
      align: "center",
      width: doc.page.width - 110
    });

  doc.end();
};

