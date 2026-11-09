function redondear(valor, decimales = 1) {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

function generarRecomendaciones(dispositivos = [], consejos = [], limite = 3) {
  const consejosPorCategoria = new Map();
  for (const consejo of consejos) {
    if (!consejo?.categoriaDispositivo) continue;
    if (!consejosPorCategoria.has(consejo.categoriaDispositivo)) {
      consejosPorCategoria.set(consejo.categoriaDispositivo, consejo);
    }
  }

  const equipos = dispositivos
    .map((dispositivo) => ({
      dispositivo,
      consumoEstimadoKwhDia: Number(dispositivo.consumoEstimadoKwhDia) || 0,
    }))
    .filter(({ dispositivo, consumoEstimadoKwhDia }) => dispositivo.activo !== false && Number.isFinite(consumoEstimadoKwhDia) && consumoEstimadoKwhDia > 0)
    .sort((a, b) => b.consumoEstimadoKwhDia - a.consumoEstimadoKwhDia || String(a.dispositivo.nombre).localeCompare(String(b.dispositivo.nombre), 'es'));

  const consumoEstimadoTotalKwhDia = equipos.reduce((total, equipo) => total + equipo.consumoEstimadoKwhDia, 0);
  const recomendaciones = [];
  const dispositivosSinConsejo = [];

  for (const { dispositivo, consumoEstimadoKwhDia } of equipos) {
    const consejo = consejosPorCategoria.get(dispositivo.categoria);
    if (!consejo) {
      dispositivosSinConsejo.push({ nombre: dispositivo.nombre, categoria: dispositivo.categoria });
      continue;
    }
    if (recomendaciones.length >= limite) continue;

    recomendaciones.push({
      dispositivoId: String(dispositivo._id),
      dispositivo: dispositivo.nombre,
      categoria: dispositivo.categoria,
      consumoEstimadoKwhDia: redondear(consumoEstimadoKwhDia, 3),
      participacionPorcentual: consumoEstimadoTotalKwhDia > 0
        ? redondear((consumoEstimadoKwhDia / consumoEstimadoTotalKwhDia) * 100, 1)
        : 0,
      consejo: {
        titulo: consejo.titulo,
        resumen: consejo.resumen,
        texto: consejo.texto,
        imagenUrl: consejo.imagenUrl || '',
        imagenAlt: consejo.imagenAlt || '',
        fuente: consejo.fuente || '',
        fuenteUrl: consejo.fuenteUrl || '',
      },
    });
  }

  return {
    recomendaciones,
    dispositivosSinConsejo,
    dispositivosRegistrados: dispositivos.filter((dispositivo) => dispositivo.activo !== false).length,
    dispositivosAnalizados: equipos.length,
    consumoEstimadoTotalKwhDia: redondear(consumoEstimadoTotalKwhDia, 3),
    nota: 'Orden orientativo según la estimación diaria registrada para cada aparato. No representa una medición ni confirma que un equipo sea ineficiente.',
  };
}

module.exports = { generarRecomendaciones };
