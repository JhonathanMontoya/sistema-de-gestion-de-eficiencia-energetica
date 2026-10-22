const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  usuarioAfectadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accion: { type: String, required: true },
  entidad: { type: String, required: true },
  entidadId: { type: mongoose.Schema.Types.ObjectId, default: null },
  descripcion: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });
schema.index({ createdAt: -1 });
module.exports = mongoose.model('RegistroAuditoria', schema);
