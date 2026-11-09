const alertasService = require('../services/alertasService');
const manejarError = require('./manejarError');

async function obtener(req, res) {
  try {
    const resultado = await alertasService.obtener(req.usuarioId);
    return res.json(resultado);
  } catch (error) {
    return manejarError(res, error, { contexto: 'alertasController.obtener', mensaje: 'No se pudieron consultar los avisos de consumo' });
  }
}

module.exports = { obtener };
