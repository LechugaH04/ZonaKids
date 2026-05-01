const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const { verificarRol } = require('../middlewares/authMiddleware');

// Solo admin y profesores pueden ver/registrar estudiantes
router.get('/todos', verificarRol(['admin', 'profesor']), estudianteController.obtenerEstudiantes);
router.post('/registro-integral', verificarRol(['admin', 'profesor']), estudianteController.registroIntegral);

module.exports = router;