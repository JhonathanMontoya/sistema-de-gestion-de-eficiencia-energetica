const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const { listarLecturas, registrarLectura, resumenSemanal } = require('../controllers/lecturaController');

const router = express.Router();

router.use(protegerRuta);
router.get('/resumen-semanal', resumenSemanal);
router.get('/', listarLecturas);
router.post('/', permitirRoles('cliente', 'administrador'), registrarLectura);

module.exports = router;
