const { admin, db } = require('../config/firebase');

// Registrar usuario
exports.registrarUsuario = async (req, res) => {
    const { email, password, nombre, rol, estudianteId } = req.body;
    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: nombre
        });

        const perfil = {
            nombre,
            email,
            rol: rol || 'padre',
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
            activo: true
        };

        if (rol === 'padre' && estudianteId) {
            perfil.estudianteId = estudianteId;
        }

        await db.collection('usuarios').doc(userRecord.uid).set(perfil);

        res.status(201).json({ mensaje: "Usuario registrado exitosamente", uid: userRecord.uid });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(400).json({ error: error.message });
    }
};

// Login
exports.verificarSesion = async (req, res) => {
    res.status(200).json({ mensaje: "Sesión válida" });
};