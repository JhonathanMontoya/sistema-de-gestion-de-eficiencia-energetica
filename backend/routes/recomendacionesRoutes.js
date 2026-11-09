const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { listarRecomendaciones } = require('../controllers/recomendacionesController');

const router = express.Router();
router.use(protegerRuta);
router.get('/', listarRecomendaciones);

module.exports = router;
