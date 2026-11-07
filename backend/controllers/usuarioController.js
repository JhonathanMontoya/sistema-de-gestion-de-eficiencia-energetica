const usuarioService = require('../services/usuarioService');
const manejarError = require('./manejarError');

async function listarUsuarios(req, res) {
  try {
    return res.json({ usuarios: await usuarioService.listar() });
  } catch (error) {
    return manejarError(res, error, { contexto: 'usuarioController.listarUsuarios', mensaje: 'No se pudieron cargar los usuarios' });
  }
}

async function cambiarRol(req, res) {
  try {
    const usuario = await usuarioService.cambiarRol(req.usuarioId, req.params.id, req.body?.rol);
    return res.json({ mensaje: 'Rol actualizado', usuario });
  } catch (error) {
    return manejarError(res, error, { contexto: 'usuarioController.cambiarRol', mensaje: 'No se pudo actualizar el rol' });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const usuario = await usuarioService.actualizar(req.params.id, req.body);
    return res.json({ mensaje: 'Datos de usuario actualizados', usuario });
  } catch (error) {
    return manejarError(res, error, {
      contexto: 'usuarioController.actualizarUsuario',
      mensaje: 'No se pudieron actualizar los datos del usuario',
      duplicado: 'Ese correo ya está asociado a otra cuenta',
      validacion: 'Revisa los datos del usuario',
    });
  }
}

async function eliminarUsuario(req, res) {
  try {
    await usuarioService.eliminar(req.usuarioId, req.params.id);
    return res.json({ mensaje: 'Usuario y sus datos personales fueron eliminados' });
  } catch (error) {
    return manejarError(res, error, { contexto: 'usuarioController.eliminarUsuario', mensaje: 'No se pudo eliminar el usuario y sus datos' });
  }
}

async function listarAuditoria(req, res) {
  try {
    const eventos = await usuarioService.listarAuditoria(req.query.limite);
    return res.json({ eventos });
  } catch (error) {
    return manejarError(res, error, { contexto: 'usuarioController.listarAuditoria', mensaje: 'No se pudo cargar la actividad administrativa' });
  }
}

module.exports = { listarUsuarios, cambiarRol, actualizarUsuario, eliminarUsuario, listarAuditoria };
