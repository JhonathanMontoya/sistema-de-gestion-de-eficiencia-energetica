const mongoose = require('mongoose');
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');
const { rangoDiaBogota, rangoMesBogota } = require('../domain/energia/fechas');

async function obtenerResumen(usuarioId) {
  const usuarioObjectId = new mongoose.Types.ObjectId(usuarioId);
  const { inicio: inicioDia, fin: finDia } = rangoDiaBogota();
  const { inicio: inicioMes, fin: finMes } = rangoMesBogota();

  const [totalDispositivos, consumoHoy, consumoMes, lecturasRecientes] = await Promise.all([
    Dispositivo.countDocuments({ usuarioId, activo: true }),
    Lectura.aggregate([
      { $match: { usuarioId: usuarioObjectId, fecha: { $gte: inicioDia, $lt: finDia } } },
      { $group: { _id: null, total: { $sum: '$consumoKwh' } } },
    ]),
    Lectura.aggregate([
      { $match: { usuarioId: usuarioObjectId, fecha: { $gte: inicioMes, $lt: finMes } } },
      { $group: { _id: null, total: { $sum: '$consumoKwh' } } },
    ]),
    Lectura.find({ usuarioId })
      .populate('dispositivoId', 'nombre')
      .sort({ fecha: -1 })
      .limit(6)
      .select('consumoKwh fecha dispositivoId'),
  ]);

  return {
    totalDispositivos,
    consumoHoyKwh: consumoHoy[0]?.total || 0,
    consumoMesKwh: consumoMes[0]?.total || 0,
    lecturasRecientes,
  };
}

module.exports = { obtenerResumen };
