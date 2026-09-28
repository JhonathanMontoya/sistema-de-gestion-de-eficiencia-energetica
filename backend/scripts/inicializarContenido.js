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
  {
    slug: 'iluminacion-led', categoria: 'informativo',
    titulo: 'Aprovecha la luz y elige bombillas eficientes',
    resumen: 'La iluminación eficiente empieza con hábitos sencillos y equipos adecuados.',
    texto: 'Abre cortinas y persianas durante el día para aprovechar la luz natural. Cuando necesites iluminación artificial, considera bombillas LED compatibles con tu luminaria y apaga las luces de espacios desocupados. Para comparar opciones, revisa la etiqueta de eficiencia y la potencia indicada en el empaque.',
    fuente: 'Ministerio de Minas y Energía de Colombia', fuenteUrl: 'https://minenergia.gov.co/es/misional/eficiencia-energ%C3%A9tica/',
    orden: 4, publicado: true,
  },
  {
    slug: 'refrigerador-eficiente', categoria: 'consejo',
    titulo: 'Cuida el uso de tu refrigerador',
    resumen: 'La ubicación, el sello de la puerta y el tiempo abierta influyen en su funcionamiento.',
    texto: 'Procura ubicar el refrigerador lejos de fuentes de calor y deja espacio para que circule el aire, según las indicaciones del fabricante. Revisa que el sello de la puerta cierre bien y evita mantenerla abierta mientras decides qué sacar. Consulta el manual para definir los ajustes de temperatura apropiados para tu equipo y tus alimentos.',
    fuente: 'ENERGY STAR', fuenteUrl: 'https://www.energystar.gov/products/refrigerators',
    orden: 5, publicado: true,
  },
  {
    slug: 'climatizacion-responsable', categoria: 'informativo',
    titulo: 'Usa la climatización con criterio',
    resumen: 'Ajustes moderados y espacios bien cerrados ayudan a evitar consumo innecesario.',
    texto: 'Si utilizas aire acondicionado, cierra puertas y ventanas del espacio climatizado y evita dejarlo funcionando en habitaciones vacías. Limpia los filtros de acuerdo con el manual del equipo. El Ministerio de Minas y Energía recomienda un ajuste entre 22 y 24 °C como referencia para el uso eficiente del aire acondicionado.',
    fuente: 'Ministerio de Minas y Energía de Colombia', fuenteUrl: 'https://www.minenergia.gov.co/es/sala-de-prensa/noticias-index/gobierno-nacional-promueve-el-uso-eficiente-de-la-energia-ante-la-posible-llegada-del-fenomeno-de-el-nino-al-pais/',
    orden: 6, publicado: true,
  },
  {
    slug: 'interpreta-consumo', categoria: 'pregunta-frecuente',
    titulo: '¿Cómo interpreto mis registros en EnerGest?',
    resumen: 'Compara periodos equivalentes y ten en cuenta que una estimación no es una factura.',
    texto: 'EnerGest organiza las lecturas que ingresas manualmente y calcula una referencia diaria aproximada a partir de potencia y horas de uso. No reemplaza el medidor ni la factura de tu proveedor. Para comparar, registra con frecuencia y condiciones parecidas; cambios en horarios, clima o cantidad de personas pueden explicar variaciones.',
    fuente: 'UPME · Plan Energético Nacional 2024–2054', fuenteUrl: 'https://docs.upme.gov.co/DemandayEficiencia/Documents/PEN_2024_2054/PDF2_PE_Eficiencia_Energetica_Publicacion_Tomo_I.pdf',
    orden: 7, publicado: true,
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
