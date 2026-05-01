const { db } = require('../config/firebase');
const verificarRol = (rolesPermitidos) => {
    return async (req, res, next) => {
        const usuarioId = req.headers['usuarioid']; 

        if (!usuarioId) {
            return res.status(403).json({ mensaje: "No se proporcionó ID de usuario (usuarioid)" });
        }

        try {
            const userDoc = await db.collection('usuarios').doc(usuarioId).get();

            if (!userDoc.exists) {
                return res.status(404).json({ mensaje: "Usuario no encontrado en la base de datos" });
            }

            const userData = userDoc.data();
            
            if (!rolesPermitidos.includes(userData.rol)) {
                return res.status(403).json({ 
                    mensaje: `Acceso denegado: El rol '${userData.rol}' no tiene permisos suficientes.` 
                });
            }

            // Adjuntar datos del usuario al objeto request
            req.usuario = { uid: userDoc.id, ...userData };
            next();
        } catch (error) {
            console.error("Error en verificarRol:", error);
            res.status(500).json({ mensaje: "Error interno al verificar permisos" });
        }
    };
};

module.exports = { verificarRol };