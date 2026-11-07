# Contrato: avisos de límites de consumo

**Estado:** primera versión implementada. Los avisos se calculan en cada consulta, no se guardan como historial ni se marcan como leídos.

## Ruta y privacidad

`GET /api/alertas` requiere sesión. Devuelve solo la cuenta autenticada:

```json
{
  "limitesConfigurados": 2,
  "alertas": [
    {
      "id": "aparato:507f1f77bcf86cd799439011:diario",
      "alcance": "aparato",
      "periodo": "diario",
      "titulo": "Refrigerador: estimación diaria sobre el límite",
      "consumoKwh": 2.75,
      "limiteKwh": 2.5,
      "unidad": "kWh/día",
      "fuente": "estimacion_dispositivo",
      "periodoReferencia": { "inicio": "2026-10-01", "fin": "2026-10-31" }
    }
  ]
}
```

Solo se devuelve una alerta cuando el valor calculado es estrictamente mayor que su límite. `limitesConfigurados` cuenta los límites que no son `null`, incluidos los límites iguales a cero. Si se edita una preferencia, un dispositivo o una lectura, el resultado se recalcula en la siguiente consulta. Los aparatos archivados no participan.

## Cálculos y significado

- **Aparato diario:** `Dispositivo.consumoEstimadoKwhDia`, calculado desde potencia y horas habituales. Se presenta como estimación, no como medición de lo ocurrido hoy.
- **Aparato mensual:** estimación diaria × número real de días del mes calendario actual en `America/Bogota`.
- **Hogar diario:** consumo de la lectura más reciente dividido por todos los días calendario inclusivos de su periodo. Se compara el promedio diario, no cada día por separado.
- **Hogar mensual:** promedio diario de esa lectura × cantidad de días del mes calendario en que termina el periodo. Es un equivalente mensual estimado, no una suma real por mes; el periodo de factura puede cruzar meses.
- Para el hogar se usa una sola lectura: la que tiene el `periodoFin` más reciente. No se suman periodos superpuestos ni lecturas del hogar con registros de aparatos.
- No hay alerta del hogar si no hay lectura, no hay límite de esa periodicidad o el valor calculado no supera el umbral.

## Presentación

La pantalla Consumo consulta estos avisos al abrirse y vuelve a consultarlos después de guardar límites o una lectura del hogar. No se implementan correo, push, recordatorios ni una bandeja histórica. Cada resultado explica su fuente y periodo de referencia para distinguir estimaciones de promedios calculados a partir de una lectura.

Esta elección reduce estados obsoletos y duplicados para el MVP. Si después se requiere marcar como leído, archivar o consultar el historial de avisos, se agregará persistencia con reglas de ciclo de vida separadas.
