const admin = require('firebase-admin');

const verificarRol = (rolesPermitidos) => {
    return async (req, res, next) => {
        const usuarioId = req.headers['usuarioid']; // Simularemos el ID por ahora

        if (!usuarioId) {
            return res.status(403).json({ mensaje: "No se proporcionó ID de usuario" });
        }

        try {
            const db = admin.firestore();
            const userDoc = await db.collection('usuarios').doc(usuarioId).get();

            if (!userDoc.exists || !rolesPermitidos.includes(userDoc.data().rol)) {
                return res.status(403).json({ mensaje: "Acceso denegado: No tienes permisos suficientes" });
            }

            req.usuario = userDoc.data();
            next();
        } catch (error) {
            res.status(500).json({ mensaje: "Error al verificar permisos" });
        }
    };
};

module.exports = { verificarRol };