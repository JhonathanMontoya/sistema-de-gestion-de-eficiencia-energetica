const preferenciasService = require('../services/preferenciasEnergeticasService');
const manejarError = require('./manejarError');

async function obtener(req, res) {
  try {
    return res.json({ preferencias: await preferenciasService.obtener(req.usuarioId) });
  } catch (error) {
    return manejarError(res, error, { contexto: 'preferenciasEnergeticasController.obtener', mensaje: 'No se pudieron cargar tus preferencias' });
  }
}

async function guardar(req, res) {
  try {
    const preferencias = await preferenciasService.guardar(req.usuarioId, req.body);
    return res.json({ mensaje: 'Preferencias energéticas guardadas', preferencias });
  } catch (error) {
    return manejarError(res, error, { contexto: 'preferenciasEnergeticasController.guardar', mensaje: 'No se pudieron guardar tus preferencias', validacion: 'Revisa la tarifa y los límites indicados' });
  }
}

module.exports = { obtener, guardar };
