const authService = require('../services/authService');
const manejarError = require('./manejarError');

async function listarDominios(req, res) {
  try {
    return res.json(await authService.listarDominios());
  } catch (error) {
    return manejarError(res, error, { contexto: 'authController.listarDominios', mensaje: 'No se pudieron cargar los dominios permitidos' });
  }
}

async function registrar(req, res) {
  try {
    const resultado = await authService.registrar(req.body);
    return res.status(201).json(resultado);
  } catch (error) {
    return manejarError(res, error, {
      contexto: 'authController.registrar',
      mensaje: 'Error interno al registrar el usuario',
      duplicado: 'Ya existe un usuario registrado con ese correo',
      validacion: 'Revisa el nombre, correo y contraseña',
    });
  }
}

async function login(req, res) {
  try {
    return res.status(200).json(await authService.login(req.body));
  } catch (error) {
    return manejarError(res, error, { contexto: 'authController.login', mensaje: 'Error interno al iniciar sesion' });
  }
}

async function perfil(req, res) {
  try {
    return res.status(200).json(await authService.perfil(req.usuarioId));
  } catch (error) {
    return manejarError(res, error, { contexto: 'authController.perfil', mensaje: 'Error interno al obtener sesion' });
  }
}

module.exports = { registrar, login, perfil, listarDominios };
