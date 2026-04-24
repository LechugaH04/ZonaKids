const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');

// Línea 7 aprox
router.get('/todos', estudianteController.obtenerEstudiantes);

// Línea 12 (LA DEL ERROR): Asegúrate de que el nombre sea IDÉNTICO al del controlador
router.post('/registro-integral', estudianteController.registroIntegral);

module.exports = router;