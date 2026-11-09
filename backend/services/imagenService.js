const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { ErrorAplicacion } = require('./errores');

const TIPOS = {
  'image/jpeg': { extension: '.jpg', validar: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extension: '.png', validar: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: '.webp', validar: (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
};

function guardarImagen(contentType, contenido) {
  const tipo = TIPOS[contentType];
  if (!tipo || !Buffer.isBuffer(contenido)) throw new ErrorAplicacion('TIPO_NO_SOPORTADO', 'Usa una imagen JPG, PNG o WebP');
  if (!contenido.length || contenido.length > 5 * 1024 * 1024) throw new ErrorAplicacion('TAMANO_EXCEDIDO', 'La imagen debe pesar máximo 5 MB');
  if (!tipo.validar(contenido)) throw new ErrorAplicacion('VALIDACION', 'El archivo no coincide con el formato de imagen indicado');

  const carpeta = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
  fs.mkdirSync(carpeta, { recursive: true });
  const nombre = randomUUID() + tipo.extension;
  fs.writeFileSync(path.join(carpeta, nombre), contenido, { flag: 'wx' });
  return '/uploads/' + nombre;
}

module.exports = { guardarImagen };
