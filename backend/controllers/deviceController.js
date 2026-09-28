const mongoose = require('mongoose');
const Device = require('../models/Device');

// Valida y limpia los datos que llegan del formulario.
// Devuelve { datos } si todo esta bien o { error } con el mensaje a mostrar.
function extraerDatos(body) {
  const { nombre, categoria, potenciaWatts } = body;

  if (!nombre || !categoria || potenciaWatts === undefined || potenciaWatts === null || potenciaWatts === '') {
    return { error: 'Nombre, categoría y potencia son obligatorios' };
  }

  const watts = Number(potenciaWatts);
  if (!Number.isFinite(watts)) {
    return { error: 'La potencia debe ser un número' };
  }

  return { datos: { nombre, categoria, potenciaWatts: watts } };
}

// Convierte los errores de Mongoose en un mensaje entendible para el usuario.
function mensajeDeValidacion(error) {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors)[0].message;
  }
  if (error.name === 'CastError') {
    return 'Alguno de los datos enviados no tiene un formato válido';
  }
  return null;
}

// POST /api/devices
async function crearDispositivo(req, res) {
  try {
    const { datos, error } = extraerDatos(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error });
    }

    const dispositivo = await Device.create({ ...datos, usuario: req.usuarioId });

    return res.status(201).json({
      mensaje: 'Dispositivo registrado correctamente',
      dispositivo,
    });
  } catch (error) {
    const mensaje = mensajeDeValidacion(error);
    if (mensaje) {
      return res.status(400).json({ mensaje });
    }
    console.error('[deviceController.crearDispositivo]', error);
    return res.status(500).json({ mensaje: 'Error interno al registrar el dispositivo' });
  }
}

// GET /api/devices  (solo devuelve los dispositivos del usuario que hace la peticion)
async function listarDispositivos(req, res) {
  try {
    const dispositivos = await Device.find({ usuario: req.usuarioId }).sort({ createdAt: -1 });
    return res.status(200).json({ dispositivos });
  } catch (error) {
    console.error('[deviceController.listarDispositivos]', error);
    return res.status(500).json({ mensaje: 'Error interno al obtener los dispositivos' });
  }
}

// PUT /api/devices/:id
async function editarDispositivo(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: 'Identificador de dispositivo inválido' });
    }

    const { datos, error } = extraerDatos(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error });
    }

    // Filtramos tambien por usuario: nadie puede editar dispositivos ajenos.
    const dispositivo = await Device.findOneAndUpdate(
      { _id: id, usuario: req.usuarioId },
      datos,
      { new: true, runValidators: true }
    );

    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    }

    return res.status(200).json({
      mensaje: 'Dispositivo actualizado correctamente',
      dispositivo,
    });
  } catch (error) {
    const mensaje = mensajeDeValidacion(error);
    if (mensaje) {
      return res.status(400).json({ mensaje });
    }
    console.error('[deviceController.editarDispositivo]', error);
    return res.status(500).json({ mensaje: 'Error interno al actualizar el dispositivo' });
  }
}

// DELETE /api/devices/:id
async function eliminarDispositivo(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: 'Identificador de dispositivo inválido' });
    }

    const dispositivo = await Device.findOneAndDelete({ _id: id, usuario: req.usuarioId });

    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    }

    return res.status(200).json({ mensaje: 'Dispositivo eliminado correctamente' });
  } catch (error) {
    console.error('[deviceController.eliminarDispositivo]', error);
    return res.status(500).json({ mensaje: 'Error interno al eliminar el dispositivo' });
  }
}

// PATCH /api/devices/:id/horas  (HU-09: guarda las horas de uso del dispositivo)
async function actualizarHoras(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: 'Identificador de dispositivo inválido' });
    }

    const { horasUso } = req.body;
    if (horasUso === undefined || horasUso === null || horasUso === '') {
      return res.status(400).json({ mensaje: 'Las horas de uso son obligatorias' });
    }

    const horas = Number(horasUso);
    if (!Number.isFinite(horas)) {
      return res.status(400).json({ mensaje: 'Las horas de uso deben ser un número' });
    }

    const dispositivo = await Device.findOneAndUpdate(
      { _id: id, usuario: req.usuarioId },
      { horasUso: horas },
      { new: true, runValidators: true }
    );

    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    }

    return res.status(200).json({
      mensaje: 'Horas de uso guardadas correctamente',
      dispositivo,
    });
  } catch (error) {
    const mensaje = mensajeDeValidacion(error);
    if (mensaje) {
      return res.status(400).json({ mensaje });
    }
    console.error('[deviceController.actualizarHoras]', error);
    return res.status(500).json({ mensaje: 'Error interno al guardar las horas de uso' });
  }
}

module.exports = {
  crearDispositivo,
  listarDispositivos,
  editarDispositivo,
  eliminarDispositivo,
  actualizarHoras,
};