const recomendacionesService = require('../services/recomendacionesService');
const manejarError = require('./manejarError');

async function listarRecomendaciones(req, res) {
  try {
    const recomendaciones = await recomendacionesService.listar(req.usuarioId);
    return res.json(recomendaciones);
  } catch (error) {
    return manejarError(res, error, {
      contexto: 'recomendacionesController.listarRecomendaciones',
      mensaje: 'No se pudieron cargar las recomendaciones',
    });
  }
}

module.exports = { listarRecomendaciones };
