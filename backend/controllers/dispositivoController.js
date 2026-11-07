const dispositivoService = require('../services/dispositivoService');
const manejarError = require('./manejarError');

async function listarDispositivos(req, res) {
  try {
    return res.json({ dispositivos: await dispositivoService.listar(req.usuarioId) });
  } catch (error) {
    return manejarError(res, error, { contexto: 'dispositivoController.listarDispositivos', mensaje: 'No se pudieron cargar los dispositivos' });
  }
}

async function crearDispositivo(req, res) {
  try {
    const dispositivo = await dispositivoService.crear(req.usuarioId, req.body);
    return res.status(201).json({ mensaje: 'Dispositivo registrado', dispositivo });
  } catch (error) {
    return manejarError(res, error, { contexto: 'dispositivoController.crearDispositivo', mensaje: 'No se pudo registrar el dispositivo', validacion: 'Revisa los datos del dispositivo' });
  }
}

async function actualizarDispositivo(req, res) {
  try {
    const dispositivo = await dispositivoService.actualizar(req.usuarioId, req.params.id, req.body);
    return res.json({ mensaje: 'Dispositivo actualizado', dispositivo });
  } catch (error) {
    return manejarError(res, error, { contexto: 'dispositivoController.actualizarDispositivo', mensaje: 'No se pudo actualizar el dispositivo', validacion: 'Revisa los datos del dispositivo' });
  }
}

async function eliminarDispositivo(req, res) {
  try {
    await dispositivoService.archivar(req.usuarioId, req.params.id);
    return res.json({ mensaje: 'Dispositivo eliminado de la lista' });
  } catch (error) {
    return manejarError(res, error, { contexto: 'dispositivoController.eliminarDispositivo', mensaje: 'No se pudo eliminar el dispositivo' });
  }
}

module.exports = { listarDispositivos, crearDispositivo, actualizarDispositivo, eliminarDispositivo };
