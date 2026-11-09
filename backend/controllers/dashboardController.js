const dashboardService = require('../services/dashboardService');
const manejarError = require('./manejarError');

async function obtenerResumen(req, res) {
  try {
    return res.json({ resumen: await dashboardService.obtenerResumen(req.usuarioId) });
  } catch (error) {
    return manejarError(res, error, { contexto: 'dashboardController.obtenerResumen', mensaje: 'No se pudo cargar el resumen' });
  }
}

module.exports = { obtenerResumen };
