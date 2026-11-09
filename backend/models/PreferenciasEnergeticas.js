const mongoose = require('mongoose');

const LimiteSchema = new mongoose.Schema({
  diarioKwh: { type: Number, min: 0, max: 10000000, default: null },
  mensualKwh: { type: Number, min: 0, max: 10000000, default: null },
}, { _id: false });

const LimiteDispositivoSchema = new mongoose.Schema({
  dispositivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispositivo', required: true },
  diarioKwh: { type: Number, min: 0, max: 10000000, default: null },
  mensualKwh: { type: Number, min: 0, max: 10000000, default: null },
}, { _id: false });

const PreferenciasEnergeticasSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tarifaCopKwh: { type: Number, min: 0, max: 1000000, default: 1000 },
  limiteHogar: { type: LimiteSchema, default: () => ({}) },
  limitesDispositivos: { type: [LimiteDispositivoSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('PreferenciasEnergeticas', PreferenciasEnergeticasSchema);
