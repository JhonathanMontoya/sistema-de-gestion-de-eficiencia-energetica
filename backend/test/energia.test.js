const test = require('node:test');
const assert = require('node:assert/strict');
const { esPotenciaValida, esCantidadHorasValida, calcularConsumoKwh } = require('../domain/energia/calculos');
const { fechaValida, fechaCalendarioBogota, rangoDiaBogota, rangoMesBogota } = require('../domain/energia/fechas');
const { generarAlertas } = require('../domain/energia/alertas');
const { generarRecomendaciones } = require('../domain/energia/recomendaciones');

test('valida potencia y horas y calcula kWh con redondeo a milésimas', () => {
  assert.equal(esPotenciaValida(1500), true);
  assert.equal(esPotenciaValida(' '), false);
  assert.equal(esCantidadHorasValida(24), true);
  assert.equal(esCantidadHorasValida(24.1), false);
  assert.equal(calcularConsumoKwh(1500, 2.5), 3.75);
  assert.equal(calcularConsumoKwh('no-numérico', 2), null);
});

test('acepta fechas calendario reales y marcas ISO con zona, rechaza fechas ambiguas o imposibles', () => {
  assert.equal(fechaValida('2024-02-29').toISOString(), '2024-02-29T05:00:00.000Z');
  assert.equal(fechaValida('2026-02-31'), false);
  assert.equal(fechaValida('03/04/2026'), false);
  assert.equal(fechaValida('2026-04-03T12:30:00.000Z') instanceof Date, true);
  assert.equal(fechaValida('2026-04-03T12:30:00'), false);
  assert.equal(fechaValida(null), null);
});

test('calcula días y meses de tablero según el calendario de Bogotá', () => {
  // 2026-10-27 02:00 UTC todavía corresponde al 26 de octubre en Bogotá.
  const instante = new Date('2026-10-27T02:00:00.000Z');
  assert.equal(fechaCalendarioBogota(instante), '2026-10-26');
  const dia = rangoDiaBogota(instante);
  assert.equal(dia.inicio.toISOString(), '2026-10-26T05:00:00.000Z');
  assert.equal(dia.fin.toISOString(), '2026-10-27T05:00:00.000Z');
  const mes = rangoMesBogota(instante);
  assert.equal(mes.inicio.toISOString(), '2026-10-01T05:00:00.000Z');
  assert.equal(mes.fin.toISOString(), '2026-11-01T05:00:00.000Z');
});

test('alertas comparan estimaciones con límites configurados y distinguen aparato/hogar', () => {
  const resultado = generarAlertas({
    dispositivos: [{ _id: 'd1', nombre: 'Nevera', consumoEstimadoKwhDia: 2 }],
    preferencias: { limiteHogar: { diarioKwh: 1 }, limitesDispositivos: [{ dispositivoId: 'd1', diarioKwh: 1 }] },
    fechaActual: '2026-10-26',
  });
  assert.equal(resultado.limitesConfigurados, 2);
  assert.deepEqual(resultado.alertas.map(({ alcance, periodo }) => [alcance, periodo]), [['aparato', 'diario']]);
});

test('recomendaciones priorizan consumo y solo usan consejos de la categoría del equipo', () => {
  const resultado = generarRecomendaciones([
    { _id: 'd1', nombre: 'Nevera', categoria: 'nevera', consumoEstimadoKwhDia: 3 },
    { _id: 'd2', nombre: 'Lámpara', categoria: 'iluminacion', consumoEstimadoKwhDia: 1 },
  ], [
    { categoriaDispositivo: 'nevera', titulo: 'Ajusta temperatura' },
    { categoriaDispositivo: 'televisor', titulo: 'Apaga en espera' },
  ]);
  assert.deepEqual(resultado.recomendaciones.map(({ dispositivo }) => dispositivo), ['Nevera']);
  assert.equal(resultado.dispositivosSinConsejo[0].nombre, 'Lámpara');
  assert.equal(resultado.consumoEstimadoTotalKwhDia, 4);
});
