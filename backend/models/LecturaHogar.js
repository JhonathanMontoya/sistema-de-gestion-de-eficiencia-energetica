const mongoose = require('mongoose');

const LecturaHogarSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consumoKwh: { type: Number, required: true, min: 0 },
    // Se guardan como medianoche UTC para conservar una fecha calendario sin
    // convertirla en un instante dependiente de la zona horaria del servidor.
    periodoInicio: { type: Date, required: true },
    periodoFin: { type: Date, required: true },
    fuente: { type: String, enum: ['factura', 'medidor', 'otro'], required: true },
    valorFacturaCop: { type: Number, min: 0, default: null },
    nota: { type: String, trim: true, maxlength: 240, default: '' },
  },
  { timestamps: true }
);

LecturaHogarSchema.index(
  { usuarioId: 1, periodoInicio: 1, periodoFin: 1 },
  { unique: true, name: 'lectura_hogar_periodo_unico_por_usuario' }
);

module.exports = mongoose.model('LecturaHogar', LecturaHogarSchema);
