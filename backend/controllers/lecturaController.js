const mongoose = require('mongoose');
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');

function fechaValida(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? false : fecha;
}

async function listarLecturas(req, res) {
  try {
    const filtro = { usuarioId: req.usuarioId };
    if (req.query.dispositivoId) {
      if (!mongoose.isValidObjectId(req.query.dispositivoId)) {
        return res.status(400).json({ mensaje: 'El identificador del dispositivo no es válido' });
      }
      filtro.dispositivoId = req.query.dispositivoId;
    }
    const desde = fechaValida(req.query.desde);
    const hasta = fechaValida(req.query.hasta);
    if (desde === false || hasta === false) {
      return res.status(400).json({ mensaje: 'El rango de fechas no es válido' });
    }
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = desde;
      if (hasta) filtro.fecha.$lte = hasta;
    }
    const lecturas = await Lectura.find(filtro)
      .populate('dispositivoId', 'nombre tipo')
      .sort({ fecha: -1 })
      .limit(200);
    return res.json({ lecturas });
  } catch (error) {
    console.error('[lecturaController.listarLecturas]', error);
    return res.status(500).json({ mensaje: 'No se pudieron cargar las lecturas' });
  }
}

async function registrarLectura(req, res) {
  try {
    const { dispositivoId, consumoKwh, horasUso, fecha, nota = '' } = req.body;
    const registrarPorHoras = horasUso !== undefined && horasUso !== null && horasUso !== '';
    if (!dispositivoId || (!registrarPorHoras && consumoKwh === undefined)) {
      return res.status(400).json({ mensaje: 'Selecciona un dispositivo e indica las horas de uso o el consumo en kWh' });
    }
    if (!mongoose.isValidObjectId(dispositivoId)) {
      return res.status(400).json({ mensaje: 'El identificador del dispositivo no es válido' });
    }
    const dispositivo = await Dispositivo.findOne({
      _id: dispositivoId,
      usuarioId: req.usuarioId,
      activo: true,
    });
    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'No se encontró un dispositivo activo de tu cuenta' });
    }
    let consumoCalculado = Number(consumoKwh);
    let horasRegistradas = null;
    if (registrarPorHoras) {
      horasRegistradas = Number(horasUso);
      if (!Number.isFinite(horasRegistradas) || horasRegistradas < 0 || horasRegistradas > 24) {
        return res.status(400).json({ mensaje: 'Las horas de uso deben estar entre 0 y 24' });
      }
      if (!Number.isFinite(dispositivo.potenciaWatts) || dispositivo.potenciaWatts <= 0) {
        return res.status(400).json({ mensaje: 'Registra una potencia válida para este dispositivo antes de calcular su consumo' });
      }
      consumoCalculado = Math.round(((dispositivo.potenciaWatts * horasRegistradas) / 1000) * 1000) / 1000;
    }
    const fechaLectura = fecha ? fechaValida(fecha) : new Date();
    if (!fechaLectura || fechaLectura === false || fechaLectura > new Date()) {
      return res.status(400).json({ mensaje: 'La fecha de la lectura no es válida' });
    }
    const lectura = await Lectura.create({
      usuarioId: req.usuarioId,
      dispositivoId,
      consumoKwh: consumoCalculado,
      horasUso: horasRegistradas,
      fecha: fechaLectura,
      nota,
    });
    await lectura.populate('dispositivoId', 'nombre tipo');
    return res.status(201).json({ mensaje: 'Lectura registrada', lectura });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'Revisa el valor de consumo, la fecha y la nota' });
    }
    console.error('[lecturaController.registrarLectura]', error);
    return res.status(500).json({ mensaje: 'No se pudo registrar la lectura' });
  }
}

async function eliminarLectura(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ mensaje: 'El identificador de lectura no es válido' });
    const lectura = await Lectura.findOneAndDelete({ _id: req.params.id, usuarioId: req.usuarioId });
    if (!lectura) return res.status(404).json({ mensaje: 'No se encontró ese registro en tu cuenta' });
    return res.json({ mensaje: 'Registro eliminado' });
  } catch (error) {
    console.error('[lecturaController.eliminarLectura]', error);
    return res.status(500).json({ mensaje: 'No se pudo eliminar el registro' });
  }
}

async function resumenSemanal(req, res) {
  try {
    const hasta = new Date();
    const desde = new Date(hasta.getTime() - (7 * 24 * 60 * 60 * 1000));
    const grupos = await Lectura.aggregate([
      { $match: { usuarioId: new mongoose.Types.ObjectId(req.usuarioId), fecha: { $gte: desde, $lte: hasta } } },
      { $group: { _id: '$dispositivoId', consumoKwh: { $sum: '$consumoKwh' }, cantidadLecturas: { $sum: 1 } } },
      { $lookup: { from: Dispositivo.collection.name, localField: '_id', foreignField: '_id', as: 'dispositivo' } },
      { $unwind: { path: '$dispositivo', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, dispositivoId: '$_id', nombre: { $ifNull: ['$dispositivo.nombre', 'Dispositivo archivado'] }, consumoKwh: 1, cantidadLecturas: 1 } },
      { $sort: { consumoKwh: -1 } },
    ]);
    const consumoTotalKwh = Math.round(grupos.reduce((total, item) => total + item.consumoKwh, 0) * 1000) / 1000;
    return res.json({ desde, hasta, consumoTotalKwh, porDispositivo: grupos });
  } catch (error) {
    console.error('[lecturaController.resumenSemanal]', error);
    return res.status(500).json({ mensaje: 'No se pudo calcular el consumo de los últimos siete días' });
  }
}

module.exports = { listarLecturas, registrarLectura, resumenSemanal, eliminarLectura };
