const mongoose = require('mongoose');

// Este modelo representa a las personas que usan el sistema de gestion
// de eficiencia energetica (ej: administrador de una planta, analista energetico).
const UserSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato valido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 6,
      select: false, // nunca se devuelve por defecto en las consultas
    },
    rol: {
      type: String,
      // "analista" se conserva para las cuentas creadas en el Sprint 1.
      enum: ['administrador', 'analista', 'cliente'],
      default: 'cliente',
    },
  },
  { timestamps: true } // agrega createdAt y updatedAt automaticamente
);

module.exports = mongoose.model('User', UserSchema);
