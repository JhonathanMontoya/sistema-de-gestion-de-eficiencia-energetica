const imagenService = require('../services/imagenService');
const manejarError = require('./manejarError');

async function subirImagen(req, res) {
  try {
    const imagenUrl = imagenService.guardarImagen(req.headers['content-type'], req.body);
    return res.status(201).json({ imagenUrl });
  } catch (error) {
    return manejarError(res, error, { contexto: 'imagenController.subirImagen', mensaje: 'No se pudo guardar la imagen en el servidor' });
  }
}

module.exports = { subirImagen };
