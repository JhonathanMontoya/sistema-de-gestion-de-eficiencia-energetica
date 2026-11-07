const ZONA_HORARIA = 'America/Bogota';

function fechaValida(valor) {
  if (typeof valor !== 'string' || !valor.trim()) return null;
  const texto = valor.trim();
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (soloFecha) {
    const [, anio, mes, dia] = soloFecha;
    const fechaCalendario = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));
    if (fechaCalendario.toISOString().slice(0, 10) !== texto) return false;
    return new Date(`${texto}T00:00:00.000-05:00`);
  }
  // Las fechas con hora deben ser ISO 8601 y declarar zona horaria.
  const isoConZona = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/i;
  if (!isoConZona.test(texto)) return false;
  const fecha = new Date(texto);
  if (Number.isNaN(fecha.getTime())) return false;
  const [fechaTexto, horaTexto] = texto.split('T');
  const [anio, mes, dia] = fechaTexto.split('-').map(Number);
  const [hora, minuto, segundo] = horaTexto.slice(0, 8).split(':').map(Number);
  const fechaCalendario = new Date(Date.UTC(anio, mes - 1, dia));
  if (fechaCalendario.toISOString().slice(0, 10) !== fechaTexto || hora > 23 || minuto > 59 || segundo > 59) return false;
  const zona = /(Z|([+-])(\d{2}):(\d{2}))$/i.exec(texto);
  if (zona[2] && (Number(zona[3]) > 23 || Number(zona[4]) > 59)) return false;
  return fecha;
}

function fechaCalendarioBogota(instante = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instante);
  const valores = Object.fromEntries(partes.filter((parte) => parte.type !== 'literal').map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

function inicioBogota(fecha) {
  return new Date(`${fecha}T00:00:00.000-05:00`);
}

function rangoDiaBogota(instante = new Date()) {
  const fecha = fechaCalendarioBogota(instante);
  const siguiente = new Date(`${fecha}T00:00:00.000Z`);
  siguiente.setUTCDate(siguiente.getUTCDate() + 1);
  return { inicio: inicioBogota(fecha), fin: inicioBogota(siguiente.toISOString().slice(0, 10)) };
}

function rangoMesBogota(instante = new Date()) {
  const fecha = fechaCalendarioBogota(instante);
  const inicio = `${fecha.slice(0, 7)}-01`;
  const siguienteMes = new Date(`${inicio}T00:00:00.000Z`);
  siguienteMes.setUTCMonth(siguienteMes.getUTCMonth() + 1);
  return { inicio: inicioBogota(inicio), fin: inicioBogota(siguienteMes.toISOString().slice(0, 10)) };
}

module.exports = { ZONA_HORARIA, fechaValida, fechaCalendarioBogota, rangoDiaBogota, rangoMesBogota };
