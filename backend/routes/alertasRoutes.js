const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const controller = require('../controllers/alertasController');

const router = express.Router();
router.use(protegerRuta);
router.get('/', controller.obtener);

module.exports = router;
