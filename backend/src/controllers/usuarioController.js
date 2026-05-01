const { db, admin } = require('../config/firebase');

// Obtener los usuarios
exports.listarUsuarios = async (req, res) => {
    try {
        const snapshot = await db.collection('usuarios').get();
        const usuarios = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "No se pudo cargar la lista de usuarios" });
    }
};

// Registro usuario + auth
exports.registrarUsuario = async (req, res) => {
    const { email, password, nombre, rol, cedula, estudianteId } = req.body;
    
    try {
        if (cedula) {
            const checkCedula = await db.collection('usuarios').where('cedula', '==', cedula).get();
            if (!checkCedula.empty) {
                return res.status(400).json({ error: "La cédula ya está registrada" });
            }
        }

        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: nombre
        });
        const nuevoUsuario = {
            nombre,
            email,
            cedula: cedula || null,
            rol: rol || 'padre', 
            activo: true,
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        };

        if (rol === 'padre' && estudianteId) {
            nuevoUsuario.estudianteId = estudianteId;
        }

        await db.collection('usuarios').doc(userRecord.uid).set(nuevoUsuario);

        res.status(201).json({ 
            mensaje: "Usuario creado exitosamente", 
            uid: userRecord.uid 
        });
    } catch (error) {
        console.error("Error al registrar:", error);
        res.status(400).json({ error: error.message });
    }
};

// Actualizar rol
exports.asignarRol = async (req, res) => {
    const { uid, rol } = req.body; 
    try {
        const rolesPermitidos = ['admin', 'profesor', 'padre'];
        if (!rolesPermitidos.includes(rol)) {
            return res.status(400).json({ error: "Rol no válido" });
        }

        await db.collection('usuarios').doc(uid).update({
            rol,
            ultimaModificacion: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ mensaje: "Rol actualizado correctamente" });
    } catch (error) {
        console.error("Error al asignar rol:", error);
        res.status(500).json({ error: "Error al actualizar el rol. Verifica el UID." });
    }
};

// Busqueda x CC
exports.buscarPorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const snapshot = await db.collection('usuarios')
            .where('cedula', '==', cedula)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const usuarioDoc = snapshot.docs[0];
        const usuarioData = usuarioDoc.data();

        return res.status(200).json({
            id: usuarioDoc.id,
            ...usuarioData
        });

    } catch (error) {
        console.error("Error al buscar cédula:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
    const { uid } = req.params;
    const updateData = req.body;
    
    try {
        delete updateData.password; 
        delete updateData.email; 

        await db.collection('usuarios').doc(uid).update({
            ...updateData,
            ultimaModificacion: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error al actualizar el usuario" });
    }
};

// ELIMINAR
exports.eliminarUsuario = async (req, res) => {
    const { uid } = req.params;
    try {
        // 1. Eliminar de Firebase Auth
        await admin.auth().deleteUser(uid);
        
        // 2. Eliminar de Firestore
        await db.collection('usuarios').doc(uid).delete();
        
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
};