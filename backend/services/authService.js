const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const configuracionService = require('./configuracionService');
const { ErrorAplicacion } = require('./errores');

function usuarioPublico(usuario) {
  return { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

async function obtenerDominiosPermitidos() {
  return (await configuracionService.obtenerPublica()).dominios;
}

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

async function listarDominios() {
  return { dominios: await obtenerDominiosPermitidos() };
}

async function registrar(datos = {}) {
  const { nombre, email, password } = datos;
  if (typeof nombre !== 'string' || !nombre.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
    throw new ErrorAplicacion('VALIDACION', 'Nombre, correo y contraseña son obligatorios');
  }
  if (password.length < 6) throw new ErrorAplicacion('VALIDACION', 'La contraseña debe tener al menos 6 caracteres');

  const correoNormalizado = email.trim().toLowerCase();
  const partesCorreo = correoNormalizado.split('@');
  const dominiosPermitidos = await obtenerDominiosPermitidos();
  if (partesCorreo.length !== 2 || !dominiosPermitidos.includes(partesCorreo[1])) {
    throw new ErrorAplicacion('VALIDACION', `Usa un correo de estos dominios: ${dominiosPermitidos.map((dominio) => `@${dominio}`).join(', ')}`);
  }
  if (await User.findOne({ email: correoNormalizado })) {
    throw new ErrorAplicacion('CONFLICTO', 'Ya existe un usuario registrado con ese correo');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHasheado = await bcrypt.hash(password, salt);
  const usuario = await User.create({ nombre: nombre.trim(), email: correoNormalizado, password: passwordHasheado, rol: 'cliente' });
  return { mensaje: 'Usuario registrado correctamente', token: generarToken(usuario), usuario: usuarioPublico(usuario) };
}

async function login(datos = {}) {
  const { email, password } = datos;
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    throw new ErrorAplicacion('VALIDACION', 'Correo y contraseña son obligatorios');
  }
  const usuario = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw new ErrorAplicacion('NO_AUTORIZADO', 'Credenciales invalidas');
  }
  return { mensaje: 'Inicio de sesion exitoso', token: generarToken(usuario), usuario: usuarioPublico(usuario) };
}

async function perfil(usuarioId) {
  const usuario = await User.findById(usuarioId);
  if (!usuario) throw new ErrorAplicacion('NO_ENCONTRADO', 'Usuario no encontrado');
  return { usuario: usuarioPublico(usuario) };
}

module.exports = { listarDominios, registrar, login, perfil };
