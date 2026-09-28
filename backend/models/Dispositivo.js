const mongoose = require('mongoose');

const DispositivoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    nombre: { type: String, required: true, trim: true, maxlength: 80 },
    tipo: { type: String, required: true, trim: true, maxlength: 50 },
    consumoEstimadoKwhDia: { type: Number, required: true, min: 0 },
    ubicacion: { type: String, trim: true, maxlength: 100, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispositivo', DispositivoSchema);
