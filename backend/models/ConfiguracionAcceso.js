const mongoose = require('mongoose');

const ConfiguracionAccesoSchema = new mongoose.Schema({
  clave: { type: String, required: true, unique: true, default: 'registro' },
  dominios: { type: [String], required: true, default: ['gmail.com', 'unac.edu.co'] },
}, { timestamps: true });

module.exports = mongoose.model('ConfiguracionAcceso', ConfiguracionAccesoSchema);
