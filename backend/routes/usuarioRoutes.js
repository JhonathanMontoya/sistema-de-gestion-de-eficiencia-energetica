const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const {
  listarUsuarios,
  cambiarRol,
  actualizarUsuario,
  eliminarUsuario,
  listarAuditoria,
} = require('../controllers/usuarioController');

const router = express.Router();

router.use(protegerRuta, permitirRoles('administrador'));
router.get('/', listarUsuarios);
router.get('/auditoria', listarAuditoria);
router.patch('/:id', actualizarUsuario);
router.patch('/:id/rol', cambiarRol);
router.delete('/:id', eliminarUsuario);

module.exports = router;
