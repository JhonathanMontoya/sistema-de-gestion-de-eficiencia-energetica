const mongoose = require('mongoose');
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');
const { ErrorAplicacion } = require('./errores');
const { esCantidadHorasValida, calcularConsumoKwh } = require('../domain/energia/calculos');
const { fechaValida } = require('../domain/energia/fechas');

async function listar(usuarioId, filtros = {}) {
  const filtro = { usuarioId };
  if (filtros.dispositivoId) {
    if (!mongoose.isValidObjectId(filtros.dispositivoId)) {
      throw new ErrorAplicacion('VALIDACION', 'El identificador del dispositivo no es válido');
    }
    filtro.dispositivoId = filtros.dispositivoId;
  }
  const desde = fechaValida(filtros.desde);
  const hasta = fechaValida(filtros.hasta);
  if (desde === false || hasta === false) throw new ErrorAplicacion('VALIDACION', 'El rango de fechas no es válido');
  if (desde || hasta) {
    filtro.fecha = {};
    if (desde) filtro.fecha.$gte = desde;
    if (hasta) filtro.fecha.$lte = hasta;
  }
  return Lectura.find(filtro).populate('dispositivoId', 'nombre tipo').sort({ fecha: -1 }).limit(200);
}

async function registrar(usuarioId, datos = {}) {
  const { dispositivoId, consumoKwh, horasUso, fecha, nota = '' } = datos;
  const registrarPorHoras = horasUso !== undefined && horasUso !== null && horasUso !== '';
  if (!dispositivoId || (!registrarPorHoras && (consumoKwh === undefined || consumoKwh === null || (typeof consumoKwh === 'string' && !consumoKwh.trim())))) {
    throw new ErrorAplicacion('VALIDACION', 'Selecciona un dispositivo e indica las horas de uso o el consumo en kWh');
  }
  if (!mongoose.isValidObjectId(dispositivoId)) throw new ErrorAplicacion('VALIDACION', 'El identificador del dispositivo no es válido');
  const dispositivo = await Dispositivo.findOne({ _id: dispositivoId, usuarioId, activo: true });
  if (!dispositivo) throw new ErrorAplicacion('NO_ENCONTRADO', 'No se encontró un dispositivo activo de tu cuenta');

  let consumoCalculado = Number(consumoKwh);
  let horasRegistradas = null;
  if (registrarPorHoras) {
    horasRegistradas = Number(horasUso);
    if (!esCantidadHorasValida(horasRegistradas)) throw new ErrorAplicacion('VALIDACION', 'Las horas de uso deben estar entre 0 y 24');
    if (!Number.isFinite(dispositivo.potenciaWatts) || dispositivo.potenciaWatts <= 0) {
      throw new ErrorAplicacion('VALIDACION', 'Registra una potencia válida para este dispositivo antes de calcular su consumo');
    }
    consumoCalculado = calcularConsumoKwh(dispositivo.potenciaWatts, horasRegistradas);
    if (consumoCalculado === null) throw new ErrorAplicacion('VALIDACION', 'No se pudo calcular el consumo con la potencia registrada');
  } else if (!Number.isFinite(consumoCalculado) || consumoCalculado < 0) {
    throw new ErrorAplicacion('VALIDACION', 'El consumo debe ser un número igual o mayor que cero');
  }
  const fechaLectura = fecha ? fechaValida(fecha) : new Date();
  if (!fechaLectura || fechaLectura === false || fechaLectura > new Date()) {
    throw new ErrorAplicacion('VALIDACION', 'La fecha de la lectura no es válida');
  }
  const lectura = await Lectura.create({ usuarioId, dispositivoId, consumoKwh: consumoCalculado, horasUso: horasRegistradas, fecha: fechaLectura, nota });
  await lectura.populate('dispositivoId', 'nombre tipo');
  return lectura;
}

async function eliminar(usuarioId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador de lectura no es válido');
  const lectura = await Lectura.findOneAndDelete({ _id: id, usuarioId });
  if (!lectura) throw new ErrorAplicacion('NO_ENCONTRADO', 'No se encontró ese registro en tu cuenta');
  return lectura;
}

async function resumenSemanal(usuarioId) {
  const hasta = new Date();
  const desde = new Date(hasta.getTime() - (7 * 24 * 60 * 60 * 1000));
  const grupos = await Lectura.aggregate([
    { $match: { usuarioId: new mongoose.Types.ObjectId(usuarioId), fecha: { $gte: desde, $lte: hasta } } },
    { $group: { _id: '$dispositivoId', consumoKwh: { $sum: '$consumoKwh' }, cantidadLecturas: { $sum: 1 } } },
    { $lookup: { from: Dispositivo.collection.name, localField: '_id', foreignField: '_id', as: 'dispositivo' } },
    { $unwind: { path: '$dispositivo', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, dispositivoId: '$_id', nombre: { $ifNull: ['$dispositivo.nombre', 'Dispositivo archivado'] }, consumoKwh: 1, cantidadLecturas: 1 } },
    { $sort: { consumoKwh: -1 } },
  ]);
  const consumoTotalKwh = Math.round(grupos.reduce((total, item) => total + item.consumoKwh, 0) * 1000) / 1000;
  return { desde, hasta, consumoTotalKwh, porDispositivo: grupos };
}

module.exports = { listar, registrar, eliminar, resumenSemanal };
