const mongoose = require('mongoose');
const Dispositivo = require('../models/Dispositivo');
const { ErrorAplicacion } = require('./errores');
const { esPotenciaValida, esCantidadHorasValida, calcularConsumoKwh } = require('../domain/energia/calculos');

const CAMPOS_EDITABLES = ['nombre', 'tipo', 'consumoEstimadoKwhDia', 'ubicacion', 'categoria', 'potenciaWatts', 'horasUsoDiarias'];

async function listar(usuarioId) {
  return Dispositivo.find({ usuarioId, activo: true }).sort({ createdAt: -1 });
}

async function crear(usuarioId, datos = {}) {
  const { nombre, tipo, ubicacion = '' } = datos;
  const usaCalculoPorPotencia = ['categoria', 'potenciaWatts', 'horasUsoDiarias'].some((campo) => Object.hasOwn(datos, campo));
  const categoria = datos.categoria || 'otro';
  const potenciaWatts = usaCalculoPorPotencia ? Number(datos.potenciaWatts) : 0;
  const horasUsoDiarias = usaCalculoPorPotencia ? Number(datos.horasUsoDiarias) : 0;
  const consumoEstimadoKwhDia = usaCalculoPorPotencia
    ? calcularConsumoKwh(potenciaWatts, horasUsoDiarias)
    : Number(datos.consumoEstimadoKwhDia);

  if (typeof nombre !== 'string' || !nombre.trim() ||
      (usaCalculoPorPotencia && (!esPotenciaValida(potenciaWatts) || !esCantidadHorasValida(horasUsoDiarias))) ||
      (!usaCalculoPorPotencia && (typeof tipo !== 'string' || !tipo.trim() || datos.consumoEstimadoKwhDia === undefined))) {
    throw new ErrorAplicacion('VALIDACION', 'Revisa el nombre, categoría, potencia y horas de uso del dispositivo');
  }
  if (usaCalculoPorPotencia && consumoEstimadoKwhDia === null) {
    throw new ErrorAplicacion('VALIDACION', 'No se pudo calcular el consumo con la potencia y las horas indicadas');
  }

  return Dispositivo.create({
    usuarioId,
    nombre,
    tipo: (typeof tipo === 'string' && tipo.trim()) || categoria,
    consumoEstimadoKwhDia,
    ubicacion,
    categoria,
    potenciaWatts,
    horasUsoDiarias,
  });
}

async function actualizar(usuarioId, id, datos = {}) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador del dispositivo no es válido');
  const cambios = Object.fromEntries(Object.entries(datos).filter(([campo]) => CAMPOS_EDITABLES.includes(campo)));
  if (Object.keys(cambios).length === 0) throw new ErrorAplicacion('VALIDACION', 'No se recibieron datos para actualizar');
  if (cambios.potenciaWatts !== undefined && !esPotenciaValida(cambios.potenciaWatts)) {
    throw new ErrorAplicacion('VALIDACION', 'La potencia del dispositivo debe ser mayor que cero');
  }
  if (cambios.horasUsoDiarias !== undefined && !esCantidadHorasValida(cambios.horasUsoDiarias)) {
    throw new ErrorAplicacion('VALIDACION', 'Las horas habituales deben estar entre 0 y 24');
  }
  if (cambios.potenciaWatts !== undefined || cambios.horasUsoDiarias !== undefined) {
    const actual = await Dispositivo.findOne({ _id: id, usuarioId, activo: true });
    if (!actual) throw new ErrorAplicacion('NO_ENCONTRADO', 'Dispositivo no encontrado');
    cambios.consumoEstimadoKwhDia = calcularConsumoKwh(
      cambios.potenciaWatts ?? actual.potenciaWatts,
      cambios.horasUsoDiarias ?? actual.horasUsoDiarias,
    );
    if (cambios.consumoEstimadoKwhDia === null) {
      throw new ErrorAplicacion('VALIDACION', 'Registra una potencia válida para calcular el consumo estimado');
    }
  }
  const dispositivo = await Dispositivo.findOneAndUpdate({ _id: id, usuarioId, activo: true }, cambios, { new: true, runValidators: true });
  if (!dispositivo) throw new ErrorAplicacion('NO_ENCONTRADO', 'Dispositivo no encontrado');
  return dispositivo;
}

async function archivar(usuarioId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador del dispositivo no es válido');
  const dispositivo = await Dispositivo.findOneAndUpdate(
    { _id: id, usuarioId, activo: true }, { activo: false }, { new: true }
  );
  if (!dispositivo) throw new ErrorAplicacion('NO_ENCONTRADO', 'Dispositivo no encontrado');
  return dispositivo;
}

module.exports = { listar, crear, actualizar, archivar };
