const mongoose = require('mongoose');
const User = require('../models/User');
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');
const LecturaHogar = require('../models/LecturaHogar');
const PreferenciasEnergeticas = require('../models/PreferenciasEnergeticas');
const RegistroAuditoria = require('../models/RegistroAuditoria');
const { ErrorAplicacion } = require('./errores');

const ROLES = ['administrador', 'analista', 'cliente'];
const ACCIONES_VISIBLES_EN_AUDITORIA = ['cambio_rol', 'eliminar_usuario'];

function esMismoUsuario(id, actorId) {
  return new mongoose.Types.ObjectId(id).equals(new mongoose.Types.ObjectId(actorId));
}

async function listar() {
  return User.find().select('nombre email rol createdAt').sort({ createdAt: -1 });
}

async function cambiarRol(actorId, id, rol) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador de usuario no es válido');
  if (!ROLES.includes(rol)) throw new ErrorAplicacion('VALIDACION', 'El rol solicitado no es válido');
  if (esMismoUsuario(id, actorId)) throw new ErrorAplicacion('VALIDACION', 'No puedes cambiar tu propio rol');
  const session = await mongoose.startSession();
  let usuarioActualizado;
  try {
    await session.withTransaction(async () => {
      const actual = await User.findById(id).select('rol nombre email').session(session);
      if (!actual) throw new ErrorAplicacion('NO_ENCONTRADO', 'Usuario no encontrado');
      if (actual.rol === 'administrador' && rol !== 'administrador') {
        const administradores = await User.countDocuments({ rol: 'administrador' }).session(session);
        if (administradores <= 1) throw new ErrorAplicacion('VALIDACION', 'Debe quedar al menos un administrador en el sistema');
      }
      usuarioActualizado = await User.findByIdAndUpdate(id, { rol }, { new: true, runValidators: true, session }).select('nombre email rol');
      await new RegistroAuditoria({
        actorId,
        usuarioAfectadoId: id,
        accion: 'cambio_rol',
        entidad: 'usuario',
        entidadId: id,
        descripcion: 'Rol cambiado de ' + actual.rol + ' a ' + rol + ' para ' + actual.email,
      }).save({ session });
    });
    return usuarioActualizado;
  } finally {
    await session.endSession();
  }
}

async function actualizar(id, datos = {}) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador de usuario no es válido');
  const cambios = {};
  if (Object.hasOwn(datos, 'nombre')) {
    if (typeof datos.nombre !== 'string' || !datos.nombre.trim() || datos.nombre.trim().length > 100) {
      throw new ErrorAplicacion('VALIDACION', 'El nombre no puede estar vacío');
    }
    cambios.nombre = datos.nombre.trim();
  }
  if (Object.hasOwn(datos, 'email')) {
    if (typeof datos.email !== 'string' || datos.email.trim().length > 254 || !/^\S+@\S+\.\S+$/.test(datos.email.trim())) {
      throw new ErrorAplicacion('VALIDACION', 'El correo no tiene un formato válido');
    }
    cambios.email = datos.email.trim().toLowerCase();
  }
  if (Object.keys(cambios).length === 0) throw new ErrorAplicacion('VALIDACION', 'Indica el nombre o correo que deseas actualizar');

  const usuario = await User.findByIdAndUpdate(id, { $set: cambios }, { new: true, runValidators: true }).select('nombre email rol');
  if (!usuario) throw new ErrorAplicacion('NO_ENCONTRADO', 'Usuario no encontrado');
  return usuario;
}

async function eliminar(actorId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ErrorAplicacion('VALIDACION', 'El identificador de usuario no es válido');
  if (esMismoUsuario(id, actorId)) throw new ErrorAplicacion('VALIDACION', 'No puedes eliminar tu propia cuenta desde esta pantalla');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const usuario = await User.findById(id).select('rol').session(session);
      if (!usuario) throw new ErrorAplicacion('NO_ENCONTRADO', 'Usuario no encontrado');
      if (usuario.rol === 'administrador') {
        const administradores = await User.countDocuments({ rol: 'administrador' }).session(session);
        if (administradores <= 1) throw new ErrorAplicacion('VALIDACION', 'Debe quedar al menos un administrador en el sistema');
      }
      await Lectura.deleteMany({ usuarioId: usuario._id }).session(session);
      await LecturaHogar.deleteMany({ usuarioId: usuario._id }).session(session);
      await PreferenciasEnergeticas.deleteOne({ usuarioId: usuario._id }).session(session);
      await Dispositivo.deleteMany({ usuarioId: usuario._id }).session(session);
      await RegistroAuditoria.deleteMany({ $or: [{ actorId: usuario._id }, { usuarioAfectadoId: usuario._id }] }).session(session);
      await User.deleteOne({ _id: usuario._id }).session(session);
      await new RegistroAuditoria({
        actorId,
        accion: 'eliminar_usuario',
        entidad: 'usuario',
        descripcion: 'Una cuenta y sus datos personales fueron eliminados permanentemente',
      }).save({ session });
    });
  } finally {
    await session.endSession();
  }
}

async function listarAuditoria(limiteSolicitado) {
  const limite = Math.min(Math.max(Number(limiteSolicitado) || 100, 1), 300);
  return RegistroAuditoria.find({ accion: { $in: ACCIONES_VISIBLES_EN_AUDITORIA } })
    .populate('actorId', 'nombre email')
    .populate('usuarioAfectadoId', 'nombre email')
    .sort({ createdAt: -1 })
    .limit(limite);
}

module.exports = { listar, cambiarRol, actualizar, eliminar, listarAuditoria };
