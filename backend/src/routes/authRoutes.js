const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authController = require('../controllers/authController');

router.post('/registro', authController.registrarUsuario);


module.exports = router;