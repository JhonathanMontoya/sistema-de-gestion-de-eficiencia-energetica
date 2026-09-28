const express = require('express');
const {
  crearDispositivo,
  listarDispositivos,
  editarDispositivo,
  eliminarDispositivo,
} = require('../controllers/deviceController');
const protegerRuta = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de dispositivos exigen haber iniciado sesion.
router.use(protegerRuta);

router.get('/', listarDispositivos);
router.post('/', crearDispositivo);
router.put('/:id', editarDispositivo);
router.delete('/:id', eliminarDispositivo);

module.exports = router;