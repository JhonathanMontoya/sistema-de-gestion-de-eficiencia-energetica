const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const controller = require('../controllers/preferenciasEnergeticasController');

const router = express.Router();
router.use(protegerRuta);
router.get('/', controller.obtener);
router.put('/', permitirRoles('cliente', 'administrador'), controller.guardar);

module.exports = router;
