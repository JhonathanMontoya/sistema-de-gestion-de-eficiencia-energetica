const CODIGOS_HTTP = {
  VALIDACION: 400,
  NO_AUTORIZADO: 401,
  NO_ENCONTRADO: 404,
  CONFLICTO: 409,
  TIPO_NO_SOPORTADO: 415,
  TAMANO_EXCEDIDO: 413,
};

function manejarError(res, error, opciones) {
  const { contexto, mensaje, duplicado, validacion } = opciones;
  if (error.codigo && CODIGOS_HTTP[error.codigo]) {
    return res.status(CODIGOS_HTTP[error.codigo]).json({ mensaje: error.message });
  }
  if (error.code === 11000 && duplicado) return res.status(409).json({ mensaje: duplicado });
  if ((error.name === 'ValidationError' || error.name === 'CastError') && validacion) {
    return res.status(400).json({ mensaje: validacion });
  }
  console.error(`[${contexto}]`, error);
  return res.status(500).json({ mensaje });
}

module.exports = manejarError;
