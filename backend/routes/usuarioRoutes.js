const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const { listarUsuarios, cambiarRol } = require('../controllers/usuarioController');

const router = express.Router();

router.use(protegerRuta, permitirRoles('administrador'));
router.get('/', listarUsuarios);
router.patch('/:id/rol', cambiarRol);

module.exports = router;
