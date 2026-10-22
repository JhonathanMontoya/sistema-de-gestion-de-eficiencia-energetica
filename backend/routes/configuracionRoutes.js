const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const { obtenerConfiguracionPublica, actualizarDominios } = require('../controllers/configuracionController');
const router = express.Router();
router.get('/publica', obtenerConfiguracionPublica);
router.put('/dominios', protegerRuta, permitirRoles('administrador'), actualizarDominios);
module.exports = router;
