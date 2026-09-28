const mongoose = require('mongoose');

const LecturaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dispositivoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispositivo',
      required: true,
      index: true,
    },
    consumoKwh: { type: Number, required: true, min: 0 },
    fecha: { type: Date, required: true, default: Date.now, index: true },
    nota: { type: String, trim: true, maxlength: 240, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lectura', LecturaSchema);
