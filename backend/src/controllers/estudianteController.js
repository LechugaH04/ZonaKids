const { db, admin } = require('../config/firebase');

exports.obtenerEstudiantes = async (req, res) => {
    try {
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
        return res.status(500).json({ error: error.message });
    }
};

exports.registroIntegral = async (req, res) => {
    try {
        const { estudiante, acudiente } = req.body;
        
        console.log("Iniciando registro integral...");
        
        // 1. Guardar Estudiante
        const docEst = await db.collection('estudiantes').add({
            ...estudiante,
            fechaRegistro: admin.firestore.FieldValue.serverTimestamp()
        });
        const idHijo = docEst.id;

        // 2. Lógica de Acudiente
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
                estudiantes: [idHijo],
                fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
                activo: true
            });
        } else if (acudiente.uid) {
            // Si el acudiente ya existe, vinculamos al nuevo estudiante
            await db.collection('usuarios').doc(acudiente.uid).update({
                estudiantes: admin.firestore.FieldValue.arrayUnion(idHijo)
            });
        }

        return res.status(201).json({ success: true, mensaje: "Registro integral completado" });
    } catch (error) {
        console.error("Error en registro integral:", error.message);
        return res.status(500).json({ error: error.message });
    }
};