const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// 1. IMPORTAR RUTAS
const estudianteRoutes = require('./routes/estudianteRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();



// 2. CONFIGURACIÓN DE FIREBASE (Instancia única)
const serviceAccount = require('./config/serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// 3. MIDDLEWARES
app.use(cors());
app.use(express.json()); // Vital para leer req.body

// 4. RUTAS DE LA API
// Importante: Van antes de los archivos estáticos para que no se confundan
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// 5. SERVIR ARCHIVOS ESTÁTICOS
// asumiendo que tu estructura es: 
// /proyecto
//    /public (index.html, js, css)
//    /src (app.js, routes, etc)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/usuarios', usuarioRoutes);

// 6. MANEJO DE RUTAS DEL FRONTEND (Para evitar errores 404 al recargar)
// --- 3. MANEJO DE RUTAS DEL FRONTEND (Sintaxis para versiones nuevas) ---
// --- 3. MANEJO DE RUTAS DEL FRONTEND (Sintaxis Universal) ---
// Usamos /.*/ para capturar absolutamente todo sin importar la versión de express
app.get(/.*/, (req, res) => {
    // Si la ruta empieza con /api y llegó aquí, es que no existe esa ruta de API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: "Ruta de API no encontrada" });
    }
    
    // Para cualquier otra cosa (navegación del usuario), enviamos el index.html
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 7. ARRANQUE DEL SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    🚀 ZONA KIDS: SISTEMA INICIADO
    ------------------------------
    📍 Servidor: http://localhost:${PORT}
    📂 Estáticos: ${path.join(__dirname, '..', 'public')}
    ------------------------------
    `);
});