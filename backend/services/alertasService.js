const Dispositivo = require('../models/Dispositivo');
const LecturaHogar = require('../models/LecturaHogar');
const PreferenciasEnergeticas = require('../models/PreferenciasEnergeticas');
const { generarAlertas } = require('../domain/energia/alertas');

function fechaActualBogota() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

async function obtener(usuarioId) {
  const [preferencias, dispositivos, lecturaHogar] = await Promise.all([
    PreferenciasEnergeticas.findOne({ usuarioId }).lean(),
    Dispositivo.find({ usuarioId, activo: true }).select('_id nombre consumoEstimadoKwhDia').lean(),
    LecturaHogar.findOne({ usuarioId }).sort({ periodoFin: -1, createdAt: -1 }).lean(),
  ]);
  const idsActivos = new Set(dispositivos.map((dispositivo) => String(dispositivo._id)));
  const preferenciasActivas = {
    ...(preferencias || {}),
    limitesDispositivos: (preferencias?.limitesDispositivos || [])
      .filter((limite) => idsActivos.has(String(limite.dispositivoId))),
  };
  return generarAlertas({
    dispositivos,
    lecturaHogar,
    preferencias: preferenciasActivas,
    fechaActual: fechaActualBogota(),
  });
}

module.exports = { obtener };
