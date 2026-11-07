const mongoose = require('mongoose');
const Dispositivo = require('../models/Dispositivo');
const PreferenciasEnergeticas = require('../models/PreferenciasEnergeticas');
const { ErrorAplicacion } = require('./errores');

const TARIFA_PREDETERMINADA = 1000;

function numeroNoNegativo(valor, campo, maximo, decimales = 3) {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor !== 'number') throw new ErrorAplicacion('VALIDACION', `${campo} debe ser un valor numérico`);
  const numero = Number(valor);
  const redondeado = Math.round(numero * (10 ** decimales)) / (10 ** decimales);
  if (!Number.isFinite(numero) || numero < 0 || numero > maximo || Math.abs(numero - redondeado) > 1e-9) {
    throw new ErrorAplicacion('VALIDACION', `${campo} debe ser un número entre 0 y ${maximo} con máximo ${decimales} decimales`);
  }
  return numero;
}

function validarLimite(limite = {}, campo) {
  if (!limite || typeof limite !== 'object' || Array.isArray(limite)) {
    throw new ErrorAplicacion('VALIDACION', `${campo} debe contener límites diario y mensual`);
  }
  return {
    diarioKwh: numeroNoNegativo(limite.diarioKwh, `${campo}.diarioKwh`, 10000000),
    mensualKwh: numeroNoNegativo(limite.mensualKwh, `${campo}.mensualKwh`, 10000000),
  };
}

function validarCuerpo(datos = {}) {
  const tarifaCopKwh = numeroNoNegativo(datos.tarifaCopKwh, 'tarifaCopKwh', 1000000, 0);
  if (tarifaCopKwh === null) throw new ErrorAplicacion('VALIDACION', 'Indica una tarifa en COP por kWh');
  const limiteHogar = validarLimite(datos.limiteHogar, 'limiteHogar');
  if (!Array.isArray(datos.limitesDispositivos)) {
    throw new ErrorAplicacion('VALIDACION', 'limitesDispositivos debe ser una lista');
  }
  const vistos = new Set();
  const limitesDispositivos = datos.limitesDispositivos.map((limite) => {
    if (!limite || typeof limite !== 'object' || !mongoose.isValidObjectId(limite.dispositivoId)) {
      throw new ErrorAplicacion('VALIDACION', 'Cada límite debe indicar un dispositivo válido');
    }
    const dispositivoId = String(limite.dispositivoId);
    const clave = dispositivoId.toLowerCase();
    if (vistos.has(clave)) throw new ErrorAplicacion('VALIDACION', 'No repitas un dispositivo en los límites');
    vistos.add(clave);
    const valores = validarLimite(limite, `limitesDispositivos.${dispositivoId}`);
    return { dispositivoId, ...valores };
  }).filter(({ diarioKwh, mensualKwh }) => diarioKwh !== null || mensualKwh !== null);
  return { tarifaCopKwh, limiteHogar, limitesDispositivos };
}

async function obtener(usuarioId) {
  const [preferencias, dispositivos] = await Promise.all([
    PreferenciasEnergeticas.findOne({ usuarioId }).lean(),
    Dispositivo.find({ usuarioId, activo: true }).select('_id').lean(),
  ]);
  const idsActivos = new Set(dispositivos.map((dispositivo) => String(dispositivo._id)));
  const limitesDispositivos = (preferencias?.limitesDispositivos || [])
    .filter((limite) => idsActivos.has(String(limite.dispositivoId)))
    .map((limite) => ({ dispositivoId: String(limite.dispositivoId), diarioKwh: limite.diarioKwh ?? null, mensualKwh: limite.mensualKwh ?? null }));
  return {
    tarifaCopKwh: preferencias?.tarifaCopKwh ?? TARIFA_PREDETERMINADA,
    limiteHogar: {
      diarioKwh: preferencias?.limiteHogar?.diarioKwh ?? null,
      mensualKwh: preferencias?.limiteHogar?.mensualKwh ?? null,
    },
    limitesDispositivos,
  };
}

async function guardar(usuarioId, datos = {}) {
  const cambios = validarCuerpo(datos);
  const ids = cambios.limitesDispositivos.map((limite) => limite.dispositivoId);
  if (ids.length) {
    const propiosActivos = await Dispositivo.find({ _id: { $in: ids }, usuarioId, activo: true }).select('_id').lean();
    if (propiosActivos.length !== ids.length) {
      throw new ErrorAplicacion('VALIDACION', 'Solo puedes configurar límites para tus dispositivos activos');
    }
  }
  const preferencias = await PreferenciasEnergeticas.findOneAndUpdate(
    { usuarioId }, { $set: cambios }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
  return {
    tarifaCopKwh: preferencias.tarifaCopKwh,
    limiteHogar: {
      diarioKwh: preferencias.limiteHogar?.diarioKwh ?? null,
      mensualKwh: preferencias.limiteHogar?.mensualKwh ?? null,
    },
    limitesDispositivos: (preferencias.limitesDispositivos || []).map((limite) => ({
      dispositivoId: String(limite.dispositivoId), diarioKwh: limite.diarioKwh ?? null, mensualKwh: limite.mensualKwh ?? null,
    })),
  };
}

module.exports = { obtener, guardar };
