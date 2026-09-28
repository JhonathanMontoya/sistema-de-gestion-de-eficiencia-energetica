require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Contenido = require('../models/Contenido');

const CONTENIDO_INICIAL = [
  {
    slug: 'bienvenida',
    categoria: 'portada',
    titulo: 'Usar mejor la energía empieza por conocerla',
    resumen: 'Registra tus equipos, lleva lecturas sencillas y descubre cómo cambia tu consumo.',
    texto: 'EnerGest reúne en un solo lugar tus dispositivos y su consumo registrado. Empieza con una lectura manual y construye un historial útil para tomar mejores decisiones.',
    orden: 1,
    publicado: true,
  },
  {
    slug: 'pequenos-cambios',
    categoria: 'informativo',
    titulo: 'Pequeños cambios también cuentan',
    resumen: 'Un registro constante ayuda a reconocer hábitos y oportunidades de ahorro.',
    texto: 'Anotar el consumo de tus equipos con regularidad te permite comparar periodos, detectar variaciones y evaluar si una acción de ahorro está dando resultado.',
    orden: 2,
    publicado: true,
  },
  {
    slug: 'consejo-registro',
    categoria: 'consejo',
    titulo: 'Consejo para empezar',
    resumen: 'Registra las lecturas en horarios parecidos para que la comparación sea más clara.',
    texto: 'Cuando sea posible, registra el consumo bajo condiciones similares. Así podrás comparar mejor las lecturas entre días y entender qué cambios pueden explicar una diferencia.',
    orden: 3,
    publicado: true,
  },
];

async function inicializarContenido() {
  await connectDB();
  try {
    for (const contenido of CONTENIDO_INICIAL) {
      await Contenido.updateOne(
        { slug: contenido.slug },
        { $setOnInsert: contenido },
        { upsert: true }
      );
    }
    console.log('Contenido editorial inicial disponible. Los textos existentes no se reemplazaron.');
  } catch (error) {
    console.error('No se pudo inicializar el contenido:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

inicializarContenido();
