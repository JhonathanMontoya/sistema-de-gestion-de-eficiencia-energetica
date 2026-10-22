const express = require('express');
const { registrar, login, perfil, listarDominios } = require('../controllers/authController');
const protegerRuta = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dominios', listarDominios);
router.post('/register', registrar);
router.post('/login', login);
router.get('/perfil', protegerRuta, perfil);

module.exports = router;
