const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

// POST /api/auth/register
// Este endpoint no ira en el login final del sprint 1 (que solo pide login),
// pero se necesita para poder CREAR el primer usuario de prueba en la BD.
async function registrar(req, res) {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
    }

    const existente = await User.findOne({ email });
    if (existente) {
      return res.status(409).json({ mensaje: 'Ya existe un usuario registrado con ese correo' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheado = await bcrypt.hash(password, salt);

    const nuevoUsuario = await User.create({
      nombre,
      email,
      password: passwordHasheado,
      rol,
    });

    const token = generarToken(nuevoUsuario);

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error('[authController.registrar]', error);
    return res.status(500).json({ mensaje: 'Error interno al registrar el usuario' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    // .select('+password') porque en el modelo lo marcamos como select:false
    const usuario = await User.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      mensaje: 'Inicio de sesion exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('[authController.login]', error);
    return res.status(500).json({ mensaje: 'Error interno al iniciar sesion' });
  }
}

// GET /api/auth/perfil (ruta protegida, sirve para validar el token en la pagina principal)
async function perfil(req, res) {
  try {
    const usuario = await User.findById(req.usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    return res.status(200).json({ usuario });
  } catch (error) {
    console.error('[authController.perfil]', error);
    return res.status(500).json({ mensaje: 'Error interno al obtener el perfil' });
  }
}

module.exports = { registrar, login, perfil };
