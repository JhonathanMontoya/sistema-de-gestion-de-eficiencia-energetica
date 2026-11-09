const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { permitirRoles } = require('../middleware/authMiddleware');
const controller = require('../controllers/lecturaHogarController');

const router = express.Router();
router.use(protegerRuta);
router.get('/', controller.listar);
router.post('/', permitirRoles('cliente', 'administrador'), controller.crear);
router.put('/:id', permitirRoles('cliente', 'administrador'), controller.reemplazar);
router.delete('/:id', permitirRoles('cliente', 'administrador'), controller.eliminar);

module.exports = router;
