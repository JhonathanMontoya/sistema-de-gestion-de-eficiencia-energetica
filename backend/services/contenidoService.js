const mongoose = require('mongoose');
const Contenido = require('../models/Contenido');
const { ErrorAplicacion } = require('./errores');

const CAMPOS_EDITABLES = ['slug', 'categoria', 'etiqueta', 'titulo', 'resumen', 'texto', 'imagenUrl', 'imagenAlt', 'textoBoton', 'categoriaDispositivo', 'fuente', 'fuenteUrl', 'orden', 'publicado'];
const CATEGORIAS_DISPOSITIVO = ['aire_acondicionado', 'nevera', 'iluminacion', 'computador', 'televisor', 'lavadora', 'otro'];

function validarUrl(valor, campo, permitirImagenLocal = false) {
  if (!valor) return '';
  if (typeof valor !== 'string') throw new ErrorAplicacion('VALIDACION', `${campo} no tiene un formato válido`);
  if (permitirImagenLocal && /^\/uploads\/[\w-]+\.(?:jpg|png|webp)$/i.test(valor)) return valor;
  try {
    const url = new URL(valor);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString();
  } catch { /* La URL no es absoluta. */ }
  throw new ErrorAplicacion('VALIDACION', `${campo} debe ser una dirección HTTP/HTTPS${permitirImagenLocal ? ' o una imagen subida a EnerGest' : ''}`);
}

function validarContenido(datos = {}) {
  const contenido = { ...datos };
  if (Object.hasOwn(contenido, 'imagenUrl')) contenido.imagenUrl = validarUrl(contenido.imagenUrl, 'La imagen', true);
  if (Object.hasOwn(contenido, 'fuenteUrl')) contenido.fuenteUrl = validarUrl(contenido.fuenteUrl, 'La fuente');
  if (Object.hasOwn(contenido, 'categoriaDispositivo')) {
    if (contenido.categoriaDispositivo === '') contenido.categoriaDispositivo = null;
    else if (contenido.categoriaDispositivo !== null && !CATEGORIAS_DISPOSITIVO.includes(contenido.categoriaDispositivo)) {
      throw new ErrorAplicacion('VALIDACION', 'La categoría del dispositivo no es válida');
    }
  }
  if (contenido.categoria && contenido.categoria !== 'consejo') contenido.categoriaDispositivo = null;
  if (contenido.categoria && contenido.categoria !== 'llamada-accion') contenido.textoBoton = '';
  return contenido;
}

async function listarPublico() {
  return Contenido.find({ publicado: true }).select('-__v').sort({ orden: 1, createdAt: 1 });
}

async function listarAdministracion() {
  return Contenido.find().sort({ orden: 1, createdAt: -1 });
}

async function crear(datos = {}) {
  const campos = Object.fromEntries(Object.entries(datos).filter(([campo]) => CAMPOS_EDITABLES.includes(campo)));
  return Contenido.create(validarContenido(campos));
}

async function actualizar(id, datos = {}) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador no es válido');
  const cambios = validarContenido(Object.fromEntries(Object.entries(datos).filter(([campo]) => CAMPOS_EDITABLES.includes(campo))));
  const contenido = await Contenido.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
  if (!contenido) throw new ErrorAplicacion('NO_ENCONTRADO', 'Contenido no encontrado');
  return contenido;
}

async function eliminar(id) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador no es válido');
  const contenido = await Contenido.findByIdAndDelete(id);
  if (!contenido) throw new ErrorAplicacion('NO_ENCONTRADO', 'Contenido no encontrado');
  return contenido;
}

module.exports = { listarPublico, listarAdministracion, crear, actualizar, eliminar };
