const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');

async function obtenerResumen(req, res) {
  try {
    const ahora = new Date();
    const inicioDia = new Date(ahora);
    inicioDia.setHours(0, 0, 0, 0);
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [totalDispositivos, consumoHoy, consumoMes, lecturasRecientes] = await Promise.all([
      Dispositivo.countDocuments({ usuarioId: req.usuarioId, activo: true }),
      Lectura.aggregate([
        { $match: { usuarioId: req.usuarioId, fecha: { $gte: inicioDia } } },
        { $group: { _id: null, total: { $sum: '$consumoKwh' } } },
      ]),
      Lectura.aggregate([
        { $match: { usuarioId: req.usuarioId, fecha: { $gte: inicioMes } } },
        { $group: { _id: null, total: { $sum: '$consumoKwh' } } },
      ]),
      Lectura.find({ usuarioId: req.usuarioId })
        .populate('dispositivoId', 'nombre')
        .sort({ fecha: -1 })
        .limit(6)
        .select('consumoKwh fecha dispositivoId'),
    ]);

    return res.json({
      resumen: {
        totalDispositivos,
        consumoHoyKwh: consumoHoy[0]?.total || 0,
        consumoMesKwh: consumoMes[0]?.total || 0,
        lecturasRecientes,
      },
    });
  } catch (error) {
    console.error('[dashboardController.obtenerResumen]', error);
    return res.status(500).json({ mensaje: 'No se pudo cargar el resumen' });
  }
}

module.exports = { obtenerResumen };
