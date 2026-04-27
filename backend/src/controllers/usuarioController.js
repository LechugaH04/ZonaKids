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