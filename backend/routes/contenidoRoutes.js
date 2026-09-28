const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const {
  listarContenidoPublico,
  listarContenidoAdmin,
  crearContenido,
  actualizarContenido,
  eliminarContenido,
} = require('../controllers/contenidoController');

const router = express.Router();

router.get('/', listarContenidoPublico);
router.use(protegerRuta, permitirRoles('administrador'));
router.get('/administrar', listarContenidoAdmin);
router.post('/', crearContenido);
router.put('/:id', actualizarContenido);
router.delete('/:id', eliminarContenido);

module.exports = router;
