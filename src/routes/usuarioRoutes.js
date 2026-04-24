const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// --- 1. OBTENER TODOS LOS USUARIOS ---
// Esta es la que llena la tabla en "Gestión de Roles"
const usuarioController = require('../controllers/usuarioController');
router.get('/todos', async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection('usuarios').get();
        const usuarios = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "No se pudo cargar la lista" });
    }
});

// --- 2. REGISTRO UNIVERSAL (Personal y Padres) ---
router.post('/registrar', async (req, res) => {
    const { email, password, nombre, rol, estudianteId } = req.body;
    
    try {
        // Crear la cuenta en Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: nombre
        });

        // Crear el perfil en Firestore
        const nuevoUsuario = {
            nombre,
            email,
            rol: rol || 'padre', 
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        };

        // Si es padre, vinculamos al hijo
        if (rol === 'padre' && estudianteId) {
            nuevoUsuario.estudianteId = estudianteId;
        }

        await admin.firestore().collection('usuarios').doc(userRecord.uid).set(nuevoUsuario);

        res.status(201).json({ 
            mensaje: "Usuario creado exitosamente", 
            uid: userRecord.uid 
        });
    } catch (error) {
        console.error("Error al registrar:", error);
        res.status(400).json({ error: error.message });
    }
});

// --- 3. ACTUALIZAR ROL ---
router.post('/asignar-rol', async (req, res) => {
    const { uid, rol } = req.body; 
    try {
        await admin.firestore().collection('usuarios').doc(uid).update({
            rol,
            ultimaModificacion: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ mensaje: "Rol actualizado correctamente" });
    } catch (e) {
        res.status(500).json({ error: "Error al actualizar. Verifica el UID." });
    }
});



// Definimos la ruta con el parámetro :cedula
router.get('/buscar-por-cedula/:cedula', usuarioController.buscarPorCedula);

module.exports = router;