# 🛒 Mi Comercio - Sistema de Gestión

Aplicación web desarrollada en **Node.js + Express + MySQL** con vistas en **EJS** y **Bootstrap 5**.  
Permite gestionar **ventas, gastos, productos, categorías y arqueo de caja**, con generación de **PDFs automáticos** para reportes y tickets.

---

## 🚀 Funcionalidades

✅ Login con sesión de administrador  
✅ Gestión de productos y categorías  
✅ Registro de ventas con tickets en PDF  
✅ Registro de gastos y exportación en PDF  
✅ Reporte de arqueo de caja (ventas - gastos)  
✅ Dashboard con buscador de productos y totales del día  
✅ Exportaciones en PDF con diseño adaptado  

---

## 🛠️ Requisitos

- Node.js **>= 16**
- MySQL **>= 5.7**
- Git
- [Nodemon](https://www.npmjs.com/package/nodemon) (para desarrollo)

---

## ⚙️ Instalación

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/jairobandera/comercioPJM.git
   cd comercioPJM
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**

   Editar el archivo `config/db.js` con tus credenciales de MySQL:

   ```js
   const mysql = require('mysql2');
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'tu_usuario',
     password: 'tu_password',
     database: 'comercio'
   });
   module.exports = db;
   ```

   Crear la base de datos con las tablas necesarias (`usuarios`, `productos`, `categorias`, `ventas`, `detalle_venta`, `gastos`, `arqueo_caja`).

4. **Crear usuario administrador automático**

   El sistema crea un usuario admin al iniciar:
   ```
   usuario: admin
   contraseña: admin123
   ```

---

## ▶️ Ejecución

- **Modo normal**
  ```bash
  node app.js
  ```

- **Modo desarrollo con Nodemon**
  ```bash
  npx nodemon app.js
  ```

Por defecto, el servidor corre en:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 📂 Estructura del Proyecto

```
comercioPJM/
│── app.js              # Configuración principal
│── config/
│   ├── db.js           # Conexión MySQL
│   └── initAdmin.js    # Usuario admin inicial
│── controllers/        # Lógica de negocio
│── models/             # Modelos de datos
│── routes/             # Rutas Express
│── views/              # Vistas EJS
│── public/             # Archivos estáticos (CSS, JS, tickets PDF)
│── package.json
```

---

## 📑 Dependencias principales

- **express** - Framework web
- **mysql2** - Conector MySQL
- **express-session** - Manejo de sesiones
- **bcryptjs** - Hash de contraseñas
- **pdfkit** - Generación de PDFs
- **ejs** - Motor de plantillas
- **nodemon** - Reinicio automático en desarrollo

---

## 👨‍💻 Autor

Desarrollado por [**Jairo Bandera**](https://github.com/jairobandera).  
Proyecto académico y práctico de sistema de gestión de comercio.

---
