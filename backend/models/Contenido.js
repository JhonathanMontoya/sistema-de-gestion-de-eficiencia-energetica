const mongoose = require('mongoose');

// Se guardan textos editoriales simples, no HTML ejecutable.
const ContenidoSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    categoria: {
      type: String,
      required: true,
      enum: ['portada', 'seccion', 'paso', 'funcionalidad', 'ejemplo', 'llamada-accion', 'informativo', 'consejo', 'pregunta-frecuente', 'cambio-eficiencia', 'beneficio-gestion'],
    },
    titulo: { type: String, required: true, trim: true, maxlength: 120 },
    resumen: { type: String, trim: true, maxlength: 240, default: '' },
    texto: { type: String, required: true, trim: true, maxlength: 4000 },
    imagenUrl: { type: String, trim: true, maxlength: 500, default: '' },
    imagenAlt: { type: String, trim: true, maxlength: 180, default: '' },
    textoBoton: { type: String, trim: true, maxlength: 60, default: '' },
    categoriaDispositivo: {
      type: String,
      enum: [null, 'aire_acondicionado', 'nevera', 'iluminacion', 'computador', 'televisor', 'lavadora', 'otro'],
      default: null,
    },
    etiqueta: { type: String, trim: true, maxlength: 100, default: '' },
    fuente: { type: String, trim: true, maxlength: 160, default: '' },
    fuenteUrl: { type: String, trim: true, maxlength: 500, default: '' },
    orden: { type: Number, min: 0, default: 0 },
    publicado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contenido', ContenidoSchema);
