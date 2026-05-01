const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarRol } = require('../middlewares/authMiddleware');

//Obtener
router.get('/todos', verificarRol(['admin']), usuarioController.listarUsuarios);

// Registrar
router.post('/registrar', verificarRol(['admin']), usuarioController.registrarUsuario);

// Actualizar
router.post('/asignar-rol', verificarRol(['admin']), usuarioController.asignarRol);

// Bucar x CC
router.get('/buscar-por-cedula/:cedula', verificarRol(['admin', 'profesor']), usuarioController.buscarPorCedula);

// Actualizar registro
router.put('/:uid', verificarRol(['admin']), usuarioController.actualizarUsuario);

// ELIMINAR
router.delete('/:uid', verificarRol(['admin']), usuarioController.eliminarUsuario);

module.exports = router;