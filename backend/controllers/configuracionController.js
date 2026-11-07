const configuracionService = require('../services/configuracionService');
const manejarError = require('./manejarError');

async function obtenerConfiguracionPublica(req, res) {
  try {
    return res.json(await configuracionService.obtenerPublica());
  } catch (error) {
    return manejarError(res, error, { contexto: 'configuracionController.obtenerConfiguracionPublica', mensaje: 'No se pudo cargar la configuración' });
  }
}

async function actualizarDominios(req, res) {
  try {
    const dominios = await configuracionService.actualizarDominios(req.body?.dominios);
    return res.json({ mensaje: 'Dominios permitidos actualizados', dominios });
  } catch (error) {
    return manejarError(res, error, { contexto: 'configuracionController.actualizarDominios', mensaje: 'No se pudo guardar la configuración' });
  }
}

module.exports = { obtenerConfiguracionPublica, actualizarDominios };
