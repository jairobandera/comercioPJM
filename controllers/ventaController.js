const db = require('../config/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.registrarVenta = (req, res) => {
  try {
    const productos = JSON.parse(req.body.productos);

    if (!productos || productos.length === 0) {
      req.session.mensaje = "Debe agregar al menos un producto";
      return res.redirect('/dashboard');
    }

    // Calcular total general
    const totalGeneral = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);

    // 1. Insertar venta
    db.query("INSERT INTO ventas (total) VALUES (?)", [totalGeneral], (err, result) => {
      if (err) {
        console.error("❌ Error insertando venta:", err);
        req.session.mensaje = "Error al registrar venta";
        return res.redirect('/dashboard');
      }

      const idVenta = result.insertId;

      // 2. Insertar detalle
      const values = productos.map(p => [
        idVenta,
        p.id,
        p.tipo_venta,
        p.cantidad,
        p.precio,
        p.cantidad * p.precio
      ]);

      db.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, tipo_venta, cantidad, precio, subtotal) VALUES ?`,
        [values],
        (err2) => {
          if (err2) {
            console.error("❌ Error insertando detalle:", err2);
            req.session.mensaje = "Error al registrar venta";
            return res.redirect('/dashboard');
          }

          console.log(`✅ Venta ${idVenta} registrada con ${productos.length} productos`);

          // 3. Generar ticket PDF estilo ticketera
          const doc = new PDFDocument({
            size: [226.77, 600], // 80mm de ancho ≈ 226.77 puntos, altura ajustable
            margins: { top: 10, left: 10, right: 10, bottom: 10 }
          });

          const pdfPath = path.join(__dirname, `../public/tickets/ticket_${idVenta}.pdf`);

          if (!fs.existsSync(path.dirname(pdfPath))) {
            fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
          }

          const stream = fs.createWriteStream(pdfPath);
          doc.pipe(stream);

          // Encabezado
          doc.fontSize(14).text("Mi Comercio", { align: "center", bold: true });
          doc.moveDown(0.5);
          doc.fontSize(10).text("Gracias por su compra", { align: "center" });
          doc.moveDown(0.5);
          doc.text("------------------------------------------------");
          doc.fontSize(10).text(`Venta N°: ${idVenta}`);
          doc.text(`Fecha: ${new Date().toLocaleString()}`);
          doc.text("------------------------------------------------");

          // Tabla de productos
          productos.forEach(p => {
            doc.fontSize(9).text(`${p.nombre} (${p.tipo_venta})`);
            doc.text(
              ` ${p.cantidad} x $${p.precio.toFixed(2)} = $${(p.cantidad * p.precio).toFixed(2)}`,
              { align: "right" }
            );
            doc.moveDown(0.3);
          });

          doc.text("------------------------------------------------");
          doc.fontSize(12).text(`TOTAL: $${totalGeneral.toFixed(2)}`, { align: "right" });
          doc.moveDown();

          // Footer
          doc.fontSize(9).text("No válido como factura", { align: "center" });
          doc.fontSize(9).text("Software: Mi Comercio POS", { align: "center" });

          doc.end();

          stream.on("finish", () => {
            req.session.mensaje = "Venta registrada con éxito";
            req.session.ticketUrl = `/ventas/ticket/${idVenta}`;
            res.redirect('/dashboard');
          });
        }
      );
    });
  } catch (error) {
    console.error("❌ Error procesando venta:", error);
    req.session.mensaje = "Error procesando la venta";
    res.redirect('/dashboard');
  }
};


exports.obtenerVentas = (callback) => {
  const sql = `
    SELECT v.id, v.fecha, v.total, 
           p.nombre AS producto, dv.tipo_venta, dv.cantidad, dv.precio, dv.subtotal
    FROM ventas v
    JOIN detalle_venta dv ON v.id = dv.id_venta
    JOIN productos p ON dv.id_producto = p.id
    ORDER BY v.fecha DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return callback(err, []);
    callback(null, results);
  });
};

exports.listarVentas = (req, res) => {
  const hoy = new Date().toISOString().split("T")[0];
  const desde = req.query.desde || hoy;
  const hasta = req.query.hasta || hoy;

  const sql = `
    SELECT v.id, v.fecha, v.total,
           GROUP_CONCAT(CONCAT(p.nombre, ' x', dv.cantidad, ' (', dv.tipo_venta, ')') SEPARATOR ', ') AS detalles
    FROM ventas v
    JOIN detalle_venta dv ON v.id = dv.id_venta
    JOIN productos p ON dv.id_producto = p.id
    WHERE DATE(v.fecha) BETWEEN ? AND ?
    GROUP BY v.id
    ORDER BY v.fecha DESC
  `;

  db.query(sql, [desde, hasta], (err, ventas) => {
    if (err) return res.send("Error en DB");

    // Resumen solo con total y cantidad de ventas
    const resumen = {
      totalDia: ventas.reduce((acc, v) => acc + v.total, 0),
      cantidadVentas: ventas.length
    };

    res.render("ventas", { ventas, desde, hasta, resumen });
  });
};


exports.verTicket = (req, res) => {
  const idVenta = req.params.id;
  const pdfPath = path.join(__dirname, `../public/tickets/ticket_${idVenta}.pdf`);

  if (fs.existsSync(pdfPath)) {
    res.sendFile(pdfPath);
  } else {
    res.status(404).send("Ticket no encontrado");
  }
};

exports.exportarPDF = (req, res) => {
  const { desde, hasta } = req.query;

  const sql = `
    SELECT v.id, v.fecha, v.total,
           GROUP_CONCAT(CONCAT(p.nombre, ' x', dv.cantidad, ' (', dv.tipo_venta, ')') SEPARATOR ', ') AS detalles
    FROM ventas v
    JOIN detalle_venta dv ON v.id = dv.id_venta
    JOIN productos p ON dv.id_producto = p.id
    WHERE DATE(v.fecha) BETWEEN ? AND ?
    GROUP BY v.id
    ORDER BY v.fecha DESC
  `;

  db.query(sql, [desde, hasta], (err, ventas) => {
    if (err) return res.send("Error al generar PDF");

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader("Content-Disposition", "attachment; filename=reporte_ventas.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // 🔹 Encabezado con color
    doc.rect(0, 0, doc.page.width, 60).fill("#198754");
    doc.fillColor("#fff").fontSize(20).text("Reporte de Ventas", { align: "center", valign: "center" });
    doc.moveDown(2);

    // 🔹 Info del rango
    doc.fillColor("#000").fontSize(12).text(`Desde: ${desde}  Hasta: ${hasta}`, { align: "left" });
    doc.moveDown(1);

    // 🔹 Encabezados de tabla
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 380;
    const col4 = 500;

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("ID", col1, tableTop);
    doc.text("Fecha", col2, tableTop);
    doc.text("Detalles", col3, tableTop);
    doc.text("Total", col4, tableTop);
    doc.moveDown();

    let totalGeneral = 0;

    // 🔹 Filas de tabla con alternado de color
    let y = tableTop + 20;
    ventas.forEach((v, i) => {
      const fillColor = i % 2 === 0 ? "#f2f2f2" : "#ffffff";
      doc.rect(40, y - 5, doc.page.width - 80, 20).fill(fillColor).stroke();
      doc.fillColor("#000").font("Helvetica").fontSize(10);

      doc.text(v.id, col1, y);
      doc.text(new Date(v.fecha).toLocaleString(), col2, y, { width: 200 });
      doc.text(v.detalles, col3, y, { width: 100 });
      doc.text(`$${v.total.toFixed(2)}`, col4, y);

      totalGeneral += v.total;
      y += 25;
    });

    // 🔹 Total General
    doc.moveDown(2);
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#198754");
    doc.text(`TOTAL GENERAL: $${totalGeneral.toFixed(2)}`, { align: "right" });

    doc.end();
  });
};
