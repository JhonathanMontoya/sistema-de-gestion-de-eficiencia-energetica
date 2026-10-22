const mongoose = require('mongoose');
const Dispositivo = require('../models/Dispositivo');
const User = require('../models/User');

function idValido(id) {
  return mongoose.isValidObjectId(id);
}

async function inicializarEjemplos(req, res) {
  const usuarioId = req.usuarioId;
  try {
    const usuario = await User.findOneAndUpdate({ _id: usuarioId, ejemplosDispositivosCreados: { $ne: true } }, { $set: { ejemplosDispositivosCreados: true } }, { new: true });
    if (!usuario) return res.json({ creados: 0, mensaje: 'Los ejemplos ya fueron inicializados.' });
    const existentes = await Dispositivo.find({ usuarioId, activo: true }).select('categoria');
    const categorias = new Set(existentes.map((item) => item.categoria));
    const ejemplos = [
      { nombre: 'Bombillo LED de referencia', tipo: 'Iluminación', categoria: 'iluminacion', potenciaWatts: 10, horasUsoDiarias: 5, ubicacion: 'Ejemplo' },
      { nombre: 'Nevera de referencia', tipo: 'Nevera', categoria: 'nevera', potenciaWatts: 200, horasUsoDiarias: 8, ubicacion: 'Ejemplo' },
      { nombre: 'Aire acondicionado de referencia', tipo: 'Aire acondicionado', categoria: 'aire_acondicionado', potenciaWatts: 1200, horasUsoDiarias: 4, ubicacion: 'Ejemplo' },
    ];
    const faltantes = ejemplos.filter((item) => !categorias.has(item.categoria)).slice(0, Math.max(0, 3 - existentes.length));
    if (faltantes.length) await Dispositivo.insertMany(faltantes.map((item) => ({ ...item, usuarioId, consumoEstimadoKwhDia: item.potenciaWatts * item.horasUsoDiarias / 1000, activo: true })));
    return res.status(201).json({ creados: faltantes.length, mensaje: faltantes.length ? 'Se agregaron dispositivos de ejemplo para guiarte.' : 'Tu inventario ya tiene tres o más dispositivos.' });
  } catch (error) {
    await User.updateOne({ _id: usuarioId }, { $set: { ejemplosDispositivosCreados: false } }).catch(() => {});
    console.error('[dispositivoController.inicializarEjemplos]', error);
    return res.status(500).json({ mensaje: 'No se pudieron preparar los dispositivos de ejemplo.' });
  }
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
    const { nombre, tipo, ubicacion = '' } = req.body;
    const usaCalculoPorPotencia = ['categoria', 'potenciaWatts', 'horasUsoDiarias']
      .some((campo) => Object.hasOwn(req.body, campo));
    const categoria = req.body.categoria || 'otro';
    const potenciaWatts = usaCalculoPorPotencia ? Number(req.body.potenciaWatts) : 0;
    const horasUsoDiarias = usaCalculoPorPotencia ? Number(req.body.horasUsoDiarias) : 0;
    const consumoEstimadoKwhDia = req.body.consumoEstimadoKwhDia === undefined
      ? (potenciaWatts * horasUsoDiarias) / 1000
      : Number(req.body.consumoEstimadoKwhDia);
    if (typeof nombre !== 'string' || !nombre.trim() ||
        (usaCalculoPorPotencia && (!Number.isFinite(potenciaWatts) || potenciaWatts <= 0 || !Number.isFinite(horasUsoDiarias))) ||
        (!usaCalculoPorPotencia && (typeof tipo !== 'string' || !tipo.trim() || req.body.consumoEstimadoKwhDia === undefined))) {
      return res.status(400).json({ mensaje: 'Revisa el nombre, categoría, potencia y horas de uso del dispositivo' });
    }
    const dispositivo = await Dispositivo.create({
      usuarioId: req.usuarioId,
      nombre,
      tipo: (typeof tipo === 'string' && tipo.trim()) || categoria,
      consumoEstimadoKwhDia,
      ubicacion,
      categoria,
      potenciaWatts,
      horasUsoDiarias,
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
    const camposPermitidos = [
      'nombre', 'tipo', 'consumoEstimadoKwhDia', 'ubicacion',
      'categoria', 'potenciaWatts', 'horasUsoDiarias',
    ];
    const cambios = Object.fromEntries(
      Object.entries(req.body).filter(([campo]) => camposPermitidos.includes(campo))
    );
    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ mensaje: 'No se recibieron datos para actualizar' });
    }
    if (cambios.potenciaWatts !== undefined && (!Number.isFinite(Number(cambios.potenciaWatts)) || Number(cambios.potenciaWatts) <= 0)) {
      return res.status(400).json({ mensaje: 'La potencia del dispositivo debe ser mayor que cero' });
    }
    if (cambios.consumoEstimadoKwhDia === undefined &&
        (cambios.potenciaWatts !== undefined || cambios.horasUsoDiarias !== undefined)) {
      const actual = await Dispositivo.findOne({
        _id: req.params.id,
        usuarioId: req.usuarioId,
        activo: true,
      });
      if (!actual) return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
      const potencia = cambios.potenciaWatts ?? actual.potenciaWatts;
      const horas = cambios.horasUsoDiarias ?? actual.horasUsoDiarias;
      cambios.consumoEstimadoKwhDia = (Number(potencia) * Number(horas)) / 1000;
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

module.exports = { listarDispositivos, crearDispositivo, actualizarDispositivo, eliminarDispositivo, inicializarEjemplos };
