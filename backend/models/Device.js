const mongoose = require('mongoose');

// Categorias permitidas. Deben coincidir con las del frontend
// (frontend/src/data/categoriasDispositivo.js).
const CATEGORIAS = [
  'aire_acondicionado',
  'nevera',
  'iluminacion',
  'computador',
  'televisor',
  'lavadora',
  'otro',
];

// Un dispositivo (electrodomestico) registrado por un usuario.
// Guardamos su potencia en watts para poder calcular el consumo mas adelante.
const DeviceSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del dispositivo es obligatorio'],
      trim: true,
      maxlength: [60, 'El nombre no puede superar los 60 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: CATEGORIAS,
        message: 'La categoría seleccionada no es válida',
      },
    },
    potenciaWatts: {
      type: Number,
      required: [true, 'La potencia en watts es obligatoria'],
      min: [1, 'La potencia debe ser mayor a 0'],
      max: [100000, 'La potencia ingresada parece demasiado alta'],
    },
        // Horas de uso del dispositivo en el periodo consultado (HU-09).
    // Es opcional: mientras sea null, el consumo en kWh aun no se calcula.
    horasUso: {
      type: Number,
      default: null,
      min: [0, 'Las horas de uso no pueden ser negativas'],
      max: [8760, 'Las horas de uso no pueden superar 8760 (un año completo)'],
    },
    // A que usuario pertenece: asi cada persona solo ve sus propios dispositivos.
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', DeviceSchema);