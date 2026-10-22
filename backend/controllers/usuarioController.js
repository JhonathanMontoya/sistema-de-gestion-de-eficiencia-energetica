const mongoose = require('mongoose');
const User = require('../models/User');
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');
const RegistroAuditoria = require('../models/RegistroAuditoria');

const ROLES = ['administrador', 'analista', 'cliente'];
async function auditar(req, usuarioAfectadoId, accion, entidad, entidadId, descripcion) {
  try { await RegistroAuditoria.create({ actorId: req.usuarioId, usuarioAfectadoId, accion, entidad, entidadId, descripcion }); }
  catch (error) { console.error('[auditoria] No se pudo guardar el evento', error.message); }
}
async function listarUsuarios(req, res) {
  try {
    const usuarios = await User.find().select('nombre email rol createdAt').sort({ createdAt: -1 });
    return res.json({ usuarios });
  } catch (error) { console.error('[usuarioController.listarUsuarios]', error); return res.status(500).json({ mensaje: 'No se pudieron cargar los usuarios' }); }
}
async function cambiarRol(req, res) {
  try {
    const { id } = req.params; const { rol } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ mensaje: 'El identificador de usuario no es válido' });
    if (!ROLES.includes(rol)) return res.status(400).json({ mensaje: 'El rol solicitado no es válido' });
    if (id === req.usuarioId) return res.status(400).json({ mensaje: 'No puedes cambiar tu propio rol' });
    const actual = await User.findById(id).select('rol nombre email');
    if (!actual) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    if (actual.rol === 'administrador' && rol !== 'administrador' && await User.countDocuments({ rol: 'administrador' }) <= 1) return res.status(400).json({ mensaje: 'Debe quedar al menos un administrador en el sistema' });
    const usuario = await User.findByIdAndUpdate(id, { rol }, { new: true, runValidators: true }).select('nombre email rol');
    await auditar(req, id, 'cambio_rol', 'usuario', id, 'Rol cambiado de ' + actual.rol + ' a ' + rol + ' para ' + actual.email);
    return res.json({ mensaje: 'Rol actualizado', usuario });
  } catch (error) { console.error('[usuarioController.cambiarRol]', error); return res.status(500).json({ mensaje: 'No se pudo actualizar el rol' }); }
}
async function datosUsuario(req,res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({mensaje:'El identificador de usuario no es válido'});
    const usuario=await User.findById(req.params.id).select('nombre email rol createdAt');
    if(!usuario) return res.status(404).json({mensaje:'Usuario no encontrado'});
    const dispositivos=await Dispositivo.find({usuarioId:usuario._id,activo:true}).sort({createdAt:-1});
    const lecturas=await Lectura.find({usuarioId:usuario._id}).populate('dispositivoId','nombre tipo').sort({fecha:-1}).limit(200);
    return res.json({usuario,dispositivos,lecturas});
  } catch(error){console.error('[usuarioController.datosUsuario]',error);return res.status(500).json({mensaje:'No se pudieron cargar los datos de la cuenta'});}
}
async function actualizarDispositivoUsuario(req,res) {
  try {
    const {id,dispositivoId}=req.params;
    if(!mongoose.isValidObjectId(id)||!mongoose.isValidObjectId(dispositivoId)) return res.status(400).json({mensaje:'Identificador no válido'});
    const actual=await Dispositivo.findOne({_id:dispositivoId,usuarioId:id,activo:true});
    if(!actual) return res.status(404).json({mensaje:'Dispositivo activo no encontrado'});
    const campos=['nombre','tipo','ubicacion','categoria','potenciaWatts','horasUsoDiarias'];
    const cambios=Object.fromEntries(Object.entries(req.body).filter(([k])=>campos.includes(k)));
    if(!Object.keys(cambios).length) return res.status(400).json({mensaje:'No hay cambios para guardar'});
    if(cambios.potenciaWatts!==undefined&&(!Number.isFinite(Number(cambios.potenciaWatts))||Number(cambios.potenciaWatts)<=0)) return res.status(400).json({mensaje:'La potencia debe ser mayor que cero'});
    if(cambios.horasUsoDiarias!==undefined&&(!Number.isFinite(Number(cambios.horasUsoDiarias))||Number(cambios.horasUsoDiarias)<0||Number(cambios.horasUsoDiarias)>24)) return res.status(400).json({mensaje:'Las horas deben estar entre 0 y 24'});
    const watts=Number(cambios.potenciaWatts??actual.potenciaWatts), horas=Number(cambios.horasUsoDiarias??actual.horasUsoDiarias);
    cambios.consumoEstimadoKwhDia=watts*horas/1000;
    const dispositivo=await Dispositivo.findOneAndUpdate({_id:dispositivoId,usuarioId:id,activo:true},cambios,{new:true,runValidators:true});
    await auditar(req,id,'editar_dispositivo','dispositivo',dispositivoId,'Administrador editó el dispositivo '+dispositivo.nombre);
    return res.json({mensaje:'Dispositivo actualizado',dispositivo});
  } catch(error){if(error.name==='ValidationError'||error.name==='CastError') return res.status(400).json({mensaje:'Revisa los datos del dispositivo'});console.error('[usuarioController.actualizarDispositivoUsuario]',error);return res.status(500).json({mensaje:'No se pudo actualizar el dispositivo'});}
}
async function archivarDispositivoUsuario(req,res){
  try {const {id,dispositivoId}=req.params;if(!mongoose.isValidObjectId(id)||!mongoose.isValidObjectId(dispositivoId))return res.status(400).json({mensaje:'Identificador no válido'});const d=await Dispositivo.findOneAndUpdate({_id:dispositivoId,usuarioId:id,activo:true},{activo:false},{new:true});if(!d)return res.status(404).json({mensaje:'Dispositivo no encontrado'});await auditar(req,id,'archivar_dispositivo','dispositivo',dispositivoId,'Administrador archivó el dispositivo '+d.nombre);return res.json({mensaje:'Dispositivo archivado; se conservan sus lecturas'});}catch(error){console.error('[usuarioController.archivarDispositivoUsuario]',error);return res.status(500).json({mensaje:'No se pudo archivar el dispositivo'});}
}
async function eliminarLecturaUsuario(req,res){
  try {const {id,lecturaId}=req.params;if(!mongoose.isValidObjectId(id)||!mongoose.isValidObjectId(lecturaId))return res.status(400).json({mensaje:'Identificador no válido'});const l=await Lectura.findOneAndDelete({_id:lecturaId,usuarioId:id});if(!l)return res.status(404).json({mensaje:'Registro de consumo no encontrado'});await auditar(req,id,'eliminar_lectura','lectura',lecturaId,'Administrador eliminó un registro de '+Number(l.consumoKwh).toLocaleString('es-CO')+' kWh');return res.json({mensaje:'Registro de consumo eliminado'});}catch(error){console.error('[usuarioController.eliminarLecturaUsuario]',error);return res.status(500).json({mensaje:'No se pudo eliminar el registro'});}
}
async function listarAuditoria(req,res){
 try{const limite=Math.min(Math.max(Number(req.query.limite)||100,1),300);const eventos=await RegistroAuditoria.find().populate('actorId','nombre email').populate('usuarioAfectadoId','nombre email').sort({createdAt:-1}).limit(limite);return res.json({eventos});}catch(error){console.error('[usuarioController.listarAuditoria]',error);return res.status(500).json({mensaje:'No se pudo cargar la actividad administrativa'});}
}
module.exports = { listarUsuarios, cambiarRol, datosUsuario, actualizarDispositivoUsuario, archivarDispositivoUsuario, eliminarLecturaUsuario, listarAuditoria };
