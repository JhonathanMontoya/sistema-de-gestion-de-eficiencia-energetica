const lecturaService = require('../services/lecturaService');
const manejarError = require('./manejarError');

async function listarLecturas(req, res) {
  try {
    return res.json({ lecturas: await lecturaService.listar(req.usuarioId, req.query) });
  } catch (error) {
    return manejarError(res, error, { contexto: 'lecturaController.listarLecturas', mensaje: 'No se pudieron cargar las lecturas' });
  }
}

async function registrarLectura(req, res) {
  try {
    const lectura = await lecturaService.registrar(req.usuarioId, req.body);
    return res.status(201).json({ mensaje: 'Lectura registrada', lectura });
  } catch (error) {
    return manejarError(res, error, { contexto: 'lecturaController.registrarLectura', mensaje: 'No se pudo registrar la lectura', validacion: 'Revisa el valor de consumo, la fecha y la nota' });
  }
}

async function eliminarLectura(req, res) {
  try {
    await lecturaService.eliminar(req.usuarioId, req.params.id);
    return res.json({ mensaje: 'Registro eliminado' });
  } catch (error) {
    return manejarError(res, error, { contexto: 'lecturaController.eliminarLectura', mensaje: 'No se pudo eliminar el registro' });
  }
}

async function resumenSemanal(req, res) {
  try {
    return res.json(await lecturaService.resumenSemanal(req.usuarioId));
  } catch (error) {
    return manejarError(res, error, { contexto: 'lecturaController.resumenSemanal', mensaje: 'No se pudo calcular el consumo de los últimos siete días' });
  }
}

module.exports = { listarLecturas, registrarLectura, resumenSemanal, eliminarLectura };
