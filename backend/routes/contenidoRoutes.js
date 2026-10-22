const express = require('express');
const { subirImagen } = require('../controllers/imagenController');
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
router.post('/imagenes', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }), subirImagen);
router.post('/', crearContenido);
router.put('/:id', actualizarContenido);
router.delete('/:id', eliminarContenido);

module.exports = router;
