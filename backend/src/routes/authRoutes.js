const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarRol } = require('../middlewares/authMiddleware');

router.post('/registro', verificarRol(['admin']), authController.registrarUsuario);
router.get('/verificar', authController.verificarSesion);

module.exports = router;