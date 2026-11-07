function fechaTexto(fecha) {
  return fecha instanceof Date ? fecha.toISOString().slice(0, 10) : String(fecha).slice(0, 10);
}

function diasDelPeriodo(inicio, fin) {
  const desde = Date.parse(`${fechaTexto(inicio)}T00:00:00.000Z`);
  const hasta = Date.parse(`${fechaTexto(fin)}T00:00:00.000Z`);
  return Math.floor((hasta - desde) / 86400000) + 1;
}

function diasDelMes(fecha) {
  const [anio, mes] = fechaTexto(fecha).split('-').map(Number);
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

function periodoMes(fecha) {
  const texto = fechaTexto(fecha);
  const [anio, mes] = texto.split('-');
  const ultimoDia = diasDelMes(texto);
  return { inicio: `${anio}-${mes}-01`, fin: `${anio}-${mes}-${String(ultimoDia).padStart(2, '0')}` };
}

function redondear(valor) { return Math.round((valor + Number.EPSILON) * 1000) / 1000; }

function crearAlerta({ id, alcance, periodo, titulo, consumoKwh, limiteKwh, unidad, descripcion, periodoReferencia, fuente }) {
  if (limiteKwh === null || limiteKwh === undefined || !(consumoKwh > limiteKwh)) return null;
  return {
    id, alcance, periodo, titulo, consumoKwh: redondear(consumoKwh), limiteKwh,
    unidad, descripcion, periodoReferencia, fuente,
  };
}

function generarAlertas({ dispositivos = [], lecturaHogar = null, preferencias = {}, fechaActual }) {
  const alertas = [];
  const diasMesActual = diasDelMes(fechaActual);
  const periodoActual = periodoMes(fechaActual);

  for (const dispositivo of dispositivos) {
    const limite = (preferencias.limitesDispositivos || []).find((item) => String(item.dispositivoId) === String(dispositivo._id));
    if (!limite) continue;
    const diario = Number(dispositivo.consumoEstimadoKwhDia) || 0;
    const nombre = dispositivo.nombre || 'Aparato';
    const alertaDiaria = crearAlerta({
      id: `aparato:${dispositivo._id}:diario`, alcance: 'aparato', periodo: 'diario',
      titulo: `${nombre}: estimación diaria sobre el límite`, consumoKwh: diario,
      limiteKwh: limite.diarioKwh, unidad: 'kWh/día',
      descripcion: `La estimación habitual de ${nombre} supera el límite diario configurado.`,
      periodoReferencia: periodoActual, fuente: 'estimacion_dispositivo',
    });
    if (alertaDiaria) alertas.push(alertaDiaria);
    const mensual = diario * diasMesActual;
    const alertaMensual = crearAlerta({
      id: `aparato:${dispositivo._id}:mensual`, alcance: 'aparato', periodo: 'mensual',
      titulo: `${nombre}: proyección mensual sobre el límite`, consumoKwh: mensual,
      limiteKwh: limite.mensualKwh, unidad: 'kWh/mes',
      descripcion: `Proyección estimada de ${nombre}: consumo diario habitual por ${diasMesActual} días del mes.`,
      periodoReferencia: periodoActual, fuente: 'estimacion_dispositivo',
    });
    if (alertaMensual) alertas.push(alertaMensual);
  }

  if (lecturaHogar) {
    const diasPeriodo = diasDelPeriodo(lecturaHogar.periodoInicio, lecturaHogar.periodoFin);
    if (diasPeriodo > 0) {
      const consumo = Number(lecturaHogar.consumoKwh) || 0;
      const promedioDiario = consumo / diasPeriodo;
      const limite = preferencias.limiteHogar || {};
      const periodoLectura = {
        inicio: fechaTexto(lecturaHogar.periodoInicio),
        fin: fechaTexto(lecturaHogar.periodoFin),
      };
      const alertaDiaria = crearAlerta({
        id: `hogar:${lecturaHogar._id}:diario`, alcance: 'hogar', periodo: 'diario',
        titulo: 'Promedio diario del hogar sobre el límite', consumoKwh: promedioDiario,
        limiteKwh: limite.diarioKwh, unidad: 'kWh/día',
        descripcion: `Promedio calculado con los ${diasPeriodo} días de la lectura del hogar (${periodoLectura.inicio} a ${periodoLectura.fin}).`,
        periodoReferencia: periodoLectura, fuente: 'promedio_lectura_hogar',
      });
      if (alertaDiaria) alertas.push(alertaDiaria);

      const referenciaMensual = periodoMes(lecturaHogar.periodoFin);
      const diasMesLectura = diasDelMes(lecturaHogar.periodoFin);
      const mensualEstimado = promedioDiario * diasMesLectura;
      const alertaMensual = crearAlerta({
        id: `hogar:${lecturaHogar._id}:mensual`, alcance: 'hogar', periodo: 'mensual',
        titulo: 'Equivalente mensual estimado del hogar sobre el límite', consumoKwh: mensualEstimado,
        limiteKwh: limite.mensualKwh, unidad: 'kWh/mes',
        descripcion: `Equivalente estimado para el mes de cierre de la lectura: promedio diario de ${diasPeriodo} días por ${diasMesLectura} días del mes.`,
        periodoReferencia: referenciaMensual, fuente: 'promedio_lectura_hogar',
      });
      if (alertaMensual) alertas.push(alertaMensual);
    }
  }

  const preferenciasDispositivos = preferencias.limitesDispositivos || [];
  const limitesConfigurados = [preferencias.limiteHogar?.diarioKwh, preferencias.limiteHogar?.mensualKwh]
    .filter((valor) => valor !== null && valor !== undefined).length + preferenciasDispositivos.reduce((total, limite) => total + [limite.diarioKwh, limite.mensualKwh].filter((valor) => valor !== null && valor !== undefined).length, 0);

  return { alertas, limitesConfigurados };
}

module.exports = { generarAlertas, diasDelPeriodo, diasDelMes, periodoMes };
