const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const { listarLecturas, registrarLectura, resumenSemanal, eliminarLectura } = require('../controllers/lecturaController');

const router = express.Router();

router.use(protegerRuta);
router.get('/resumen-semanal', resumenSemanal);
router.get('/', listarLecturas);
router.post('/', permitirRoles('cliente', 'administrador'), registrarLectura);
router.delete('/:id', permitirRoles('cliente', 'administrador'), eliminarLectura);

module.exports = router;
