const Dispositivo = require('../models/Dispositivo');
const Contenido = require('../models/Contenido');
const { generarRecomendaciones } = require('../domain/energia/recomendaciones');

async function listar(usuarioId) {
  const [dispositivos, consejos] = await Promise.all([
    Dispositivo.find({ usuarioId, activo: true })
      .select('_id nombre categoria consumoEstimadoKwhDia activo')
      .lean(),
    Contenido.find({ categoria: 'consejo', categoriaDispositivo: { $ne: null }, publicado: true })
      .select('categoriaDispositivo titulo resumen texto imagenUrl imagenAlt fuente fuenteUrl orden')
      .sort({ orden: 1, createdAt: 1 })
      .lean(),
  ]);

  return generarRecomendaciones(dispositivos, consejos);
}

module.exports = { listar };
