const mongoose = require('mongoose');
const Contenido = require('../models/Contenido');

async function listarContenidoPublico(req, res) {
  try {
    const contenidos = await Contenido.find({ publicado: true })
      .select('-__v')
      .sort({ orden: 1, createdAt: 1 });
    return res.json({ contenidos });
  } catch (error) {
    console.error('[contenidoController.listarContenidoPublico]', error);
    return res.status(500).json({ mensaje: 'No se pudo cargar el contenido' });
  }
}

async function listarContenidoAdmin(req, res) {
  try {
    const contenidos = await Contenido.find().sort({ orden: 1, createdAt: -1 });
    return res.json({ contenidos });
  } catch (error) {
    console.error('[contenidoController.listarContenidoAdmin]', error);
    return res.status(500).json({ mensaje: 'No se pudo cargar el contenido' });
  }
}

async function crearContenido(req, res) {
  try {
    const contenido = await Contenido.create(req.body);
    return res.status(201).json({ mensaje: 'Contenido creado', contenido });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ mensaje: 'Ese identificador de contenido ya existe' });
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'Revisa los campos del contenido' });
    }
    console.error('[contenidoController.crearContenido]', error);
    return res.status(500).json({ mensaje: 'No se pudo crear el contenido' });
  }
}

async function actualizarContenido(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador no es válido' });
    }
    const camposPermitidos = ['slug', 'categoria', 'titulo', 'resumen', 'texto', 'imagenUrl', 'fuente', 'fuenteUrl', 'orden', 'publicado'];
    const cambios = Object.fromEntries(
      Object.entries(req.body).filter(([campo]) => camposPermitidos.includes(campo))
    );
    const contenido = await Contenido.findByIdAndUpdate(req.params.id, cambios, {
      new: true,
      runValidators: true,
    });
    if (!contenido) return res.status(404).json({ mensaje: 'Contenido no encontrado' });
    return res.json({ mensaje: 'Contenido actualizado', contenido });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ mensaje: 'Ese identificador de contenido ya existe' });
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'Revisa los campos del contenido' });
    }
    console.error('[contenidoController.actualizarContenido]', error);
    return res.status(500).json({ mensaje: 'No se pudo actualizar el contenido' });
  }
}

async function eliminarContenido(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador no es válido' });
    }
    const contenido = await Contenido.findByIdAndDelete(req.params.id);
    if (!contenido) return res.status(404).json({ mensaje: 'Contenido no encontrado' });
    return res.json({ mensaje: 'Contenido eliminado' });
  } catch (error) {
    console.error('[contenidoController.eliminarContenido]', error);
    return res.status(500).json({ mensaje: 'No se pudo eliminar el contenido' });
  }
}

module.exports = {
  listarContenidoPublico,
  listarContenidoAdmin,
  crearContenido,
  actualizarContenido,
  eliminarContenido,
};
