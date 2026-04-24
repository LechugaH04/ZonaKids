const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { registrarAsistencia } = require('../controllers/asistenciaController');
const { verificarRol } = require('../middlewares/authMiddleware');

// Solo personal autorizado
router.post('/marcar', verificarRol(['admin', 'profesor']), registrarAsistencia);

module.exports = router;