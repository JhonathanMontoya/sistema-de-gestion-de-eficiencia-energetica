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
  ...[
    {
      "slug": "tendencia-1",
      "categoria": "cambio-eficiencia",
      "titulo": "Precios de la energía",
      "resumen": "Los precios cambian constantemente; controlar el consumo ayuda a evitar gastos innecesarios.",
      "texto": "Los precios de la energía pueden cambiar constantemente. Por eso, controlar el consumo ayuda a evitar gastos innecesarios. Una buena gestión permite saber dónde se está gastando más, así es más fácil tomar decisiones y ahorrar.",
      "orden": 20,
      "publicado": true
    },
    {
      "slug": "tendencia-2",
      "categoria": "cambio-eficiencia",
      "titulo": "Nuevas normas ambientales",
      "resumen": "Cada vez existen más normas sobre consumo energético y reducción de emisiones.",
      "texto": "Cada vez existen más normas relacionadas con el consumo de energía. Las organizaciones deben buscar formas de ser más eficientes. También es importante reducir las emisiones y el impacto ambiental. La gestión energética ayuda a avanzar en estos objetivos.",
      "orden": 21,
      "publicado": true
    },
    {
      "slug": "tendencia-3",
      "categoria": "cambio-eficiencia",
      "titulo": "Equipos e instalaciones",
      "resumen": "Los equipos antiguos pueden consumir más energía de la necesaria.",
      "texto": "Los equipos antiguos pueden consumir más energía de la necesaria. Revisarlos permite encontrar problemas y oportunidades de mejora. Cambiar o mantener adecuadamente estos equipos puede reducir el consumo y mejorar el funcionamiento de las instalaciones.",
      "orden": 22,
      "publicado": true
    },
    {
      "slug": "tendencia-4",
      "categoria": "cambio-eficiencia",
      "titulo": "Medidores inteligentes",
      "resumen": "Permiten conocer mejor el consumo y detectar cambios fuera de lo normal.",
      "texto": "Los medidores inteligentes permiten conocer mejor el consumo de energía. La información obtenida ayuda a encontrar cambios o consumos fuera de lo normal. También permite comparar el consumo en diferentes momentos, con estos datos es más fácil tomar decisiones.",
      "orden": 23,
      "publicado": true
    },
    {
      "slug": "tendencia-5",
      "categoria": "cambio-eficiencia",
      "titulo": "Movilidad eléctrica",
      "resumen": "El transporte avanza hacia vehículos eléctricos, cambiando el uso de la energía.",
      "texto": "El transporte está avanzando hacia el uso de vehículos eléctricos. Esto está cambiando la forma en que utilizamos la energía. También aumenta la necesidad de contar con puntos de carga. La movilidad eléctrica es una parte importante de la transición energética.",
      "orden": 24,
      "publicado": true
    },
    {
      "slug": "tendencia-6",
      "categoria": "cambio-eficiencia",
      "titulo": "Ciudades inteligentes",
      "resumen": "Buscan utilizar la energía de forma más eficiente mediante tecnología.",
      "texto": "Las ciudades buscan utilizar la energía de una manera más eficiente. La tecnología permite controlar mejor diferentes sistemas y servicios, y también facilita el uso de fuentes de energía alternativas. El objetivo es lograr ciudades más eficientes y sostenibles.",
      "orden": 25,
      "publicado": true
    },
    {
      "slug": "beneficio-1",
      "categoria": "beneficio-gestion",
      "titulo": "Ahorro de costes",
      "resumen": "Controlar el consumo ayuda a detectar gastos innecesarios y reducir costos.",
      "texto": "Controlar el consumo ayuda a detectar gastos innecesarios. Al reducir el uso de energía, también pueden reducirse los costos. Esto permite aprovechar mejor el presupuesto de la organización, y el ahorro puede utilizarse en otros proyectos o necesidades.",
      "orden": 30,
      "publicado": true
    },
    {
      "slug": "beneficio-2",
      "categoria": "beneficio-gestion",
      "titulo": "Mayor sostenibilidad",
      "resumen": "Usar la energía de forma eficiente ayuda a cuidar el medio ambiente.",
      "texto": "Usar la energía de forma eficiente ayuda a cuidar el medio ambiente. Menos consumo puede significar menos emisiones. También se puede combinar con energías renovables, avanzando así hacia una operación más sostenible.",
      "orden": 31,
      "publicado": true
    },
    {
      "slug": "beneficio-3",
      "categoria": "beneficio-gestion",
      "titulo": "Mejor imagen",
      "resumen": "Las acciones de eficiencia energética mejoran la percepción de clientes y colaboradores.",
      "texto": "Las acciones de eficiencia muestran compromiso con el medio ambiente. Esto puede mejorar la percepción que tienen clientes y colaboradores. Una organización sostenible también puede diferenciarse de otras, y la gestión energética ayuda a fortalecer esa imagen.",
      "orden": 32,
      "publicado": true
    },
    {
      "slug": "beneficio-4",
      "categoria": "beneficio-gestion",
      "titulo": "Mayor competitividad",
      "resumen": "Reducir los gastos de energía puede mejorar los resultados de una empresa.",
      "texto": "Reducir los gastos de energía puede mejorar los resultados de una empresa. También permite utilizar los recursos de una forma más eficiente. La modernización de equipos puede mejorar los procesos, ayudando a que la organización sea más competitiva.",
      "orden": 33,
      "publicado": true
    },
    {
      "slug": "beneficio-5",
      "categoria": "beneficio-gestion",
      "titulo": "Equipos más duraderos",
      "resumen": "Un buen uso y mantenimiento de los equipos prolonga su vida útil.",
      "texto": "Un buen uso de los equipos puede ayudar a conservarlos por más tiempo. El mantenimiento periódico permite detectar problemas a tiempo. Además, evitar usos innecesarios reduce el desgaste, lo cual puede disminuir gastos de reparación y reemplazo.",
      "orden": 34,
      "publicado": true
    },
    {
      "slug": "beneficio-6",
      "categoria": "beneficio-gestion",
      "titulo": "Impulso a la tecnología",
      "resumen": "Los retos energéticos impulsan sistemas inteligentes de control y análisis.",
      "texto": "Los retos energéticos están impulsando nuevas soluciones tecnológicas. Los sistemas inteligentes permiten controlar y analizar el consumo, y también ayudan a automatizar algunas tareas de gestión energética. La tecnología facilita encontrar nuevas formas de ahorrar y mejorar.",
      "orden": 35,
      "publicado": true
    }
  ]
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
    console.log('Contenido editorial inicial disponible, incluidas las secciones educativas editables. Los textos existentes no se reemplazaron.');
  } catch (error) {
    console.error('No se pudo inicializar el contenido:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

inicializarContenido();
