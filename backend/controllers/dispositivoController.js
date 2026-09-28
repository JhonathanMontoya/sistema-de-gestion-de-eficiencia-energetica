const mongoose = require('mongoose');
const Dispositivo = require('../models/Dispositivo');

function idValido(id) {
  return mongoose.isValidObjectId(id);
}

async function listarDispositivos(req, res) {
  try {
    const dispositivos = await Dispositivo.find({ usuarioId: req.usuarioId, activo: true })
      .sort({ createdAt: -1 });
    return res.json({ dispositivos });
  } catch (error) {
    console.error('[dispositivoController.listarDispositivos]', error);
    return res.status(500).json({ mensaje: 'No se pudieron cargar los dispositivos' });
  }
}

async function crearDispositivo(req, res) {
  try {
    const { nombre, tipo, consumoEstimadoKwhDia, ubicacion = '' } = req.body;
    if (!nombre?.trim() || !tipo?.trim() || consumoEstimadoKwhDia === undefined) {
      return res.status(400).json({ mensaje: 'Nombre, tipo y consumo estimado son obligatorios' });
    }
    const dispositivo = await Dispositivo.create({
      usuarioId: req.usuarioId,
      nombre,
      tipo,
      consumoEstimadoKwhDia,
      ubicacion,
    });
    return res.status(201).json({ mensaje: 'Dispositivo registrado', dispositivo });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'Revisa los datos del dispositivo' });
    }
    console.error('[dispositivoController.crearDispositivo]', error);
    return res.status(500).json({ mensaje: 'No se pudo registrar el dispositivo' });
  }
}

async function actualizarDispositivo(req, res) {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador del dispositivo no es válido' });
    }
    const camposPermitidos = ['nombre', 'tipo', 'consumoEstimadoKwhDia', 'ubicacion'];
    const cambios = Object.fromEntries(
      Object.entries(req.body).filter(([campo]) => camposPermitidos.includes(campo))
    );
    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ mensaje: 'No se recibieron datos para actualizar' });
    }
    const dispositivo = await Dispositivo.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId, activo: true },
      cambios,
      { new: true, runValidators: true }
    );
    if (!dispositivo) return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    return res.json({ mensaje: 'Dispositivo actualizado', dispositivo });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'Revisa los datos del dispositivo' });
    }
    console.error('[dispositivoController.actualizarDispositivo]', error);
    return res.status(500).json({ mensaje: 'No se pudo actualizar el dispositivo' });
  }
}

// Se conserva el historial: eliminar equivale a archivar el dispositivo.
async function eliminarDispositivo(req, res) {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador del dispositivo no es válido' });
    }
    const dispositivo = await Dispositivo.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId, activo: true },
      { activo: false },
      { new: true }
    );
    if (!dispositivo) return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    return res.json({ mensaje: 'Dispositivo eliminado de la lista' });
  } catch (error) {
    console.error('[dispositivoController.eliminarDispositivo]', error);
    return res.status(500).json({ mensaje: 'No se pudo eliminar el dispositivo' });
  }
}

module.exports = { listarDispositivos, crearDispositivo, actualizarDispositivo, eliminarDispositivo };
