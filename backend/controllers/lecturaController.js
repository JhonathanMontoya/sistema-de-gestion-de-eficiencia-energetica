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
    const { dispositivoId, consumoKwh, fecha, nota = '' } = req.body;
    if (!dispositivoId || consumoKwh === undefined) {
      return res.status(400).json({ mensaje: 'Dispositivo y consumo en kWh son obligatorios' });
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
    const fechaLectura = fecha ? fechaValida(fecha) : new Date();
    if (!fechaLectura || fechaLectura === false || fechaLectura > new Date()) {
      return res.status(400).json({ mensaje: 'La fecha de la lectura no es válida' });
    }
    const lectura = await Lectura.create({
      usuarioId: req.usuarioId,
      dispositivoId,
      consumoKwh,
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

module.exports = { listarLecturas, registrarLectura };
