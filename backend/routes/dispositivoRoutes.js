const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const {
  listarDispositivos,
  crearDispositivo,
  actualizarDispositivo,
  eliminarDispositivo,
} = require('../controllers/dispositivoController');

const router = express.Router();

router.use(protegerRuta);
router.get('/', listarDispositivos);
router.post('/', permitirRoles('cliente', 'administrador'), crearDispositivo);
router.put('/:id', permitirRoles('cliente', 'administrador'), actualizarDispositivo);
router.delete('/:id', permitirRoles('cliente', 'administrador'), eliminarDispositivo);

module.exports = router;
