// Usamos el archivo central de configuración para no repetir la inicialización
const { db, admin } = require('../config/firebase');

const registrarAsistencia = async (req, res) => {
    try {
        const { estudianteId, estado, observaciones } = req.body;

        // Validación básica: que no manden datos vacíos
        if (!estudianteId || !estado) {
            return res.status(400).json({ error: "Faltan datos (estudianteId o estado)" });
        }

        const registro = await db.collection('asistencia').add({
            estudianteId,
            estado,
            observaciones: observaciones || "",
            // Usamos la fecha del servidor para que nadie "haga trampa" con la hora del PC
            fecha: admin.firestore.FieldValue.serverTimestamp(),
            // Capturamos quién registró, si no hay ID, ponemos 'sistema' o 'maestro'
            registradoPor: req.headers.usuarioid || "maestro-general"
        });

        console.log(`✅ Asistencia guardada para estudiante: ${estudianteId}`);
        
        res.status(201).json({ 
            success: true, 
            mensaje: "Asistencia registrada correctamente", 
            id: registro.id 
        });

    } catch (error) {
        console.error("ERROR EN ASISTENCIA CONTROLLER:", error);
        res.status(500).json({ 
            success: false,
            error: "Error al registrar asistencia en la base de datos" 
        });
    }
};

module.exports = { registrarAsistencia };