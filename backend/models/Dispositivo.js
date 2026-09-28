const mongoose = require('mongoose');

const CATEGORIAS = [
  'aire_acondicionado',
  'nevera',
  'iluminacion',
  'computador',
  'televisor',
  'lavadora',
  'otro',
];

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
    categoria: { type: String, enum: CATEGORIAS, default: 'otro' },
    potenciaWatts: { type: Number, min: 0, max: 100000, default: 0 },
    horasUsoDiarias: { type: Number, min: 0, max: 24, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispositivo', DispositivoSchema);
