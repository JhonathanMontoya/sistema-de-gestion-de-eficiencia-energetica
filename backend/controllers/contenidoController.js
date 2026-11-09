const contenidoService = require('../services/contenidoService');
const manejarError = require('./manejarError');

async function listarContenidoPublico(req, res) {
  try {
    return res.json({ contenidos: await contenidoService.listarPublico() });
  } catch (error) {
    return manejarError(res, error, { contexto: 'contenidoController.listarContenidoPublico', mensaje: 'No se pudo cargar el contenido' });
  }
}

async function listarContenidoAdmin(req, res) {
  try {
    return res.json({ contenidos: await contenidoService.listarAdministracion() });
  } catch (error) {
    return manejarError(res, error, { contexto: 'contenidoController.listarContenidoAdmin', mensaje: 'No se pudo cargar el contenido' });
  }
}

async function crearContenido(req, res) {
  try {
    const contenido = await contenidoService.crear(req.body);
    return res.status(201).json({ mensaje: 'Contenido creado', contenido });
  } catch (error) {
    return manejarError(res, error, {
      contexto: 'contenidoController.crearContenido',
      mensaje: 'No se pudo crear el contenido',
      duplicado: 'Ese identificador de contenido ya existe',
      validacion: 'Revisa los campos del contenido',
    });
  }
}

async function actualizarContenido(req, res) {
  try {
    const contenido = await contenidoService.actualizar(req.params.id, req.body);
    return res.json({ mensaje: 'Contenido actualizado', contenido });
  } catch (error) {
    return manejarError(res, error, {
      contexto: 'contenidoController.actualizarContenido',
      mensaje: 'No se pudo actualizar el contenido',
      duplicado: 'Ese identificador de contenido ya existe',
      validacion: 'Revisa los campos del contenido',
    });
  }
}

async function eliminarContenido(req, res) {
  try {
    await contenidoService.eliminar(req.params.id);
    return res.json({ mensaje: 'Contenido eliminado' });
  } catch (error) {
    return manejarError(res, error, { contexto: 'contenidoController.eliminarContenido', mensaje: 'No se pudo eliminar el contenido' });
  }
}

module.exports = { listarContenidoPublico, listarContenidoAdmin, crearContenido, actualizarContenido, eliminarContenido };
