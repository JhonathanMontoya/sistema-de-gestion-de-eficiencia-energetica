const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const TIPOS = {
  'image/jpeg': { extension: '.jpg', validar: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extension: '.png', validar: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: '.webp', validar: (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
};

async function subirImagen(req, res) {
  const tipo = TIPOS[req.headers['content-type']];
  if (!tipo || !Buffer.isBuffer(req.body)) return res.status(415).json({ mensaje: 'Usa una imagen JPG, PNG o WebP' });
  if (!req.body.length || req.body.length > 5 * 1024 * 1024) return res.status(413).json({ mensaje: 'La imagen debe pesar máximo 5 MB' });
  if (!tipo.validar(req.body)) return res.status(400).json({ mensaje: 'El archivo no coincide con el formato de imagen indicado' });
  try {
    const carpeta = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(carpeta, { recursive: true });
    const nombre = randomUUID() + tipo.extension;
    fs.writeFileSync(path.join(carpeta, nombre), req.body, { flag: 'wx' });
    return res.status(201).json({ imagenUrl: '/uploads/' + nombre });
  } catch (error) {
    console.error('[imagenController.subirImagen]', error);
    return res.status(500).json({ mensaje: 'No se pudo guardar la imagen en el servidor' });
  }
}

module.exports = { subirImagen };
