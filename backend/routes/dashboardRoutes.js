const express = require('express');
const protegerRuta = require('../middleware/authMiddleware');
const { obtenerResumen } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/resumen', protegerRuta, obtenerResumen);

module.exports = router;
