const mongoose = require('mongoose');
const LecturaHogar = require('../models/LecturaHogar');
const { ErrorAplicacion } = require('./errores');

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function hoyBogota() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function fechaCalendario(valor, campo) {
  if (typeof valor !== 'string' || !FORMATO_FECHA.test(valor)) {
    throw new ErrorAplicacion('VALIDACION', `${campo} debe tener el formato YYYY-MM-DD`);
  }
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    throw new ErrorAplicacion('VALIDACION', `${campo} no es una fecha válida`);
  }
  return fecha;
}

function validarDatos(datos = {}) {
  const consumoKwh = Number(datos.consumoKwh);
  if (datos.consumoKwh === undefined || datos.consumoKwh === '' || !Number.isFinite(consumoKwh) || consumoKwh < 0 || Math.round(consumoKwh * 1000) !== consumoKwh * 1000) {
    throw new ErrorAplicacion('VALIDACION', 'El consumo debe ser un número no negativo con máximo 3 decimales');
  }
  const periodoInicio = fechaCalendario(datos.periodoInicio, 'periodoInicio');
  const periodoFin = fechaCalendario(datos.periodoFin, 'periodoFin');
  const inicioTexto = periodoInicio.toISOString().slice(0, 10);
  const finTexto = periodoFin.toISOString().slice(0, 10);
  if (finTexto < inicioTexto) throw new ErrorAplicacion('VALIDACION', 'El periodo final no puede ser anterior al inicial');
  if (finTexto > hoyBogota()) throw new ErrorAplicacion('VALIDACION', 'El periodo no puede terminar en una fecha futura');
  if (!['factura', 'medidor', 'otro'].includes(datos.fuente)) {
    throw new ErrorAplicacion('VALIDACION', 'Selecciona una fuente válida');
  }

  let valorFacturaCop = null;
  if (datos.valorFacturaCop !== undefined && datos.valorFacturaCop !== null && datos.valorFacturaCop !== '') {
    valorFacturaCop = Number(datos.valorFacturaCop);
    if (datos.fuente !== 'factura' || !Number.isSafeInteger(valorFacturaCop) || valorFacturaCop < 0) {
      throw new ErrorAplicacion('VALIDACION', 'El valor de factura debe ser un entero no negativo y solo aplica a la fuente factura');
    }
  }
  const nota = datos.nota === undefined || datos.nota === null ? '' : datos.nota;
  if (typeof nota !== 'string' || nota.length > 240) {
    throw new ErrorAplicacion('VALIDACION', 'La nota debe tener máximo 240 caracteres');
  }
  return { consumoKwh, periodoInicio, periodoFin, fuente: datos.fuente, valorFacturaCop, nota: nota.trim() };
}

function validarId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador de lectura no es válido');
}

async function listar(usuarioId, filtros = {}) {
  const filtro = { usuarioId };
  const desde = filtros.desde ? fechaCalendario(filtros.desde, 'desde') : null;
  const hasta = filtros.hasta ? fechaCalendario(filtros.hasta, 'hasta') : null;
  if (desde && hasta && desde > hasta) throw new ErrorAplicacion('VALIDACION', 'desde debe ser anterior o igual a hasta');
  if (desde || hasta) {
    if (desde) filtro.periodoFin = { $gte: desde };
    if (hasta) filtro.periodoInicio = { $lte: hasta };
  }
  return LecturaHogar.find(filtro).sort({ periodoFin: -1, createdAt: -1 }).limit(200);
}

async function crear(usuarioId, datos) {
  return LecturaHogar.create({ usuarioId, ...validarDatos(datos) });
}

async function reemplazar(usuarioId, id, datos) {
  validarId(id);
  const lectura = await LecturaHogar.findOne({ _id: id, usuarioId });
  if (!lectura) throw new ErrorAplicacion('NO_ENCONTRADO', 'No se encontró esa lectura en tu cuenta');
  Object.assign(lectura, validarDatos(datos));
  return lectura.save();
}

async function eliminar(usuarioId, id) {
  validarId(id);
  const lectura = await LecturaHogar.findOneAndDelete({ _id: id, usuarioId });
  if (!lectura) throw new ErrorAplicacion('NO_ENCONTRADO', 'No se encontró esa lectura en tu cuenta');
  return lectura;
}

module.exports = { listar, crear, reemplazar, eliminar };
