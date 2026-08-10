const express = require('express');
const { registrar, login, perfil } = require('../controllers/authController');
const protegerRuta = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registrar);
router.post('/login', login);
router.get('/perfil', protegerRuta, perfil);

module.exports = router;
