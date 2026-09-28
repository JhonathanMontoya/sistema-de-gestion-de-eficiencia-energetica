// Calculo de consumo energetico (HU-09).
// Formula: kWh = (W x horas) / 1000

// Devuelve el consumo en kWh, o null si los datos no son validos
// (por ejemplo, cuando todavia no se han ingresado las horas de uso).
export function calcularKwh(potenciaWatts, horas) {
  if (horas === null || horas === undefined || horas === '') return null;

  const watts = Number(potenciaWatts);
  const horasNumero = Number(horas);

  if (!Number.isFinite(watts) || !Number.isFinite(horasNumero) || horasNumero < 0) {
    return null;
  }

  // Redondeamos a 3 decimales para evitar resultados como 2.4000000000000004
  return Math.round(((watts * horasNumero) / 1000) * 1000) / 1000;
}

// Da formato legible: 2.4 -> "2,4 kWh"
export function formatearKwh(kwh) {
  return `${kwh.toLocaleString('es-CO', { maximumFractionDigits: 3 })} kWh`;
}