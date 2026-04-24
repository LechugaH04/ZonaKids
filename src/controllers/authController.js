const admin = require('firebase-admin');

const crearUsuario = async (req, res) => {
    try {
        const db = admin.firestore();
        const { email, nombre, rol } = req.body;

        // Validamos que el rol sea uno de los permitidos
        const rolesPermitidos = ['admin', 'profesor', 'padre'];
        if (!rolesPermitidos.includes(rol)) {
            return res.status(400).json({ error: "Rol no válido" });
        }

        const nuevoUsuario = await db.collection('usuarios').add({
            nombre,
            email,
            rol,
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
            activo: true
        });

        res.status(201).json({ mensaje: "Usuario creado con rol: " + rol, id: nuevoUsuario.id });
    } catch (error) {
        res.status(500).json({ error: "Error al crear usuario" });
    }
};
const admin = require('firebase-admin');

// Registrar un usuario (Admin, Profesor o Padre)
const registrarUsuario = async (req, res) => {
    const { email, password, nombre, rol, estudianteId } = req.body;
    try {
        // 1. Crear en Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: nombre
        });

        // 2. Guardar perfil en Firestore
        const perfil = {
            nombre,
            email,
            rol,
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        };

        // Si es padre, lo vinculamos a su hijo
        if (rol === 'padre' && estudianteId) {
            perfil.estudianteId = estudianteId;
        }

        await admin.firestore().collection('usuarios').doc(userRecord.uid).set(perfil);

        res.status(201).json({ mensaje: "Usuario creado", uid: userRecord.uid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { registrarUsuario };

module.exports = { crearUsuario };