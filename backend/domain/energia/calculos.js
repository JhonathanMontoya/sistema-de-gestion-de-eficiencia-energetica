const HORAS_MAXIMAS_POR_DIA = 24;
const POTENCIA_MAXIMA_WATTS = 100000;

function esPotenciaValida(potenciaWatts) {
  if (potenciaWatts === null || potenciaWatts === undefined || (typeof potenciaWatts === 'string' && !potenciaWatts.trim())) return false;
  const potencia = Number(potenciaWatts);
  return Number.isFinite(potencia) && potencia > 0 && potencia <= POTENCIA_MAXIMA_WATTS;
}

function esCantidadHorasValida(horas) {
  if (horas === null || horas === undefined || (typeof horas === 'string' && !horas.trim())) return false;
  const cantidad = Number(horas);
  return Number.isFinite(cantidad) && cantidad >= 0 && cantidad <= HORAS_MAXIMAS_POR_DIA;
}

function calcularConsumoKwh(potenciaWatts, horas) {
  const potencia = Number(potenciaWatts);
  const cantidad = Number(horas);
  if (!Number.isFinite(potencia) || potencia < 0 || !esCantidadHorasValida(cantidad)) return null;
  return Math.round(((potencia * cantidad) / 1000) * 1000) / 1000;
}

module.exports = {
  HORAS_MAXIMAS_POR_DIA,
  POTENCIA_MAXIMA_WATTS,
  esPotenciaValida,
  esCantidadHorasValida,
  calcularConsumoKwh,
};
