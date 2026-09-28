const mongoose = require('mongoose');
const User = require('../models/User');

const ROLES = ['administrador', 'analista', 'cliente'];

async function listarUsuarios(req, res) {
  try {
    const usuarios = await User.find().select('nombre email rol createdAt').sort({ createdAt: -1 });
    return res.json({ usuarios });
  } catch (error) {
    console.error('[usuarioController.listarUsuarios]', error);
    return res.status(500).json({ mensaje: 'No se pudieron cargar los usuarios' });
  }
}

async function cambiarRol(req, res) {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: 'El identificador de usuario no es válido' });
    }
    if (!ROLES.includes(rol)) {
      return res.status(400).json({ mensaje: 'El rol solicitado no es válido' });
    }
    if (id === req.usuarioId) {
      return res.status(400).json({ mensaje: 'No puedes cambiar tu propio rol' });
    }
    const usuarioActual = await User.findById(id).select('rol');
    if (!usuarioActual) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    if (usuarioActual.rol === 'administrador' && rol !== 'administrador') {
      const administradores = await User.countDocuments({ rol: 'administrador' });
      if (administradores <= 1) {
        return res.status(400).json({ mensaje: 'Debe quedar al menos un administrador en el sistema' });
      }
    }
    const usuario = await User.findByIdAndUpdate(id, { rol }, { new: true, runValidators: true })
      .select('nombre email rol');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    return res.json({ mensaje: 'Rol actualizado', usuario });
  } catch (error) {
    console.error('[usuarioController.cambiarRol]', error);
    return res.status(500).json({ mensaje: 'No se pudo actualizar el rol' });
  }
}

module.exports = { listarUsuarios, cambiarRol };
