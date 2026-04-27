// src/controllers/estudianteController.js
const admin = require('firebase-admin');

exports.obtenerEstudiantes = async (req, res) => {
    try {
        // Obtenemos la instancia de la base de datos
        const db = admin.firestore();
        
        console.log("Consultando estudiantes en Firestore...");
        const snapshot = await db.collection('estudiantes').get();
        
        if (snapshot.empty) {
            console.log("No hay estudiantes en la base de datos.");
            return res.status(200).json([]);
        }

        const estudiantes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Se encontraron ${estudiantes.length} estudiantes.`);
        return res.status(200).json(estudiantes);

    } catch (error) {
        console.error("ERROR EN FIREBASE:", error.message);
        // Enviamos el detalle para saber POR QUÉ falló (permisos, conexión, etc.)
        return res.status(500).json({ error: error.message });
    }
};

exports.registroIntegral = async (req, res) => {
    try {
        const db = admin.firestore();
        const { estudiante, acudiente } = req.body;
        
        console.log("Iniciando registro integral...");
        
        // 1. Guardar Estudiante
        const docEst = await db.collection('estudiantes').add(estudiante);
        const idHijo = docEst.id;

        // 2. Lógica de Acudiente (Simplificada para que no falle)
        if (acudiente.esNuevo) {
            const userRecord = await admin.auth().createUser({
                email: acudiente.email,
                password: acudiente.password || "ZonaKids2026*",
                displayName: acudiente.nombre
            });

            await db.collection('usuarios').doc(userRecord.uid).set({
                nombre: acudiente.nombre,
                cedula: acudiente.cedula,
                email: acudiente.email,
                rol: 'padre',
                estudiantes: [idHijo]
            });
        }

        return res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error en registro integral:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

const { db } = require('../config/firebase');

exports.buscarPorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        console.log(`Buscando acudiente con cédula: ${cedula}`);

        // Buscamos en la colección 'usuarios' donde la cédula coincida
        const snapshot = await db.collection('usuarios')
            .where('cedula', '==', cedula)
            .limit(1) // Solo necesitamos uno
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Extraemos los datos del primer (y único) resultado
        const usuarioDoc = snapshot.docs[0];
        const usuarioData = usuarioDoc.data();

        // Enviamos los datos necesarios al frontend
        return res.status(200).json({
            id: usuarioDoc.id,
            nombre: usuarioData.nombre,
            email: usuarioData.email,
            rol: usuarioData.rol
        });

    } catch (error) {
        console.error("Error al buscar cédula:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};