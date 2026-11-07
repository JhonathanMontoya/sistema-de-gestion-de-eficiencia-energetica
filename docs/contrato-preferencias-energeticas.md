# Contrato: preferencias energéticas por cuenta

**Estado:** implementado en backend e interfaz básica. Los límites se guardan y validan; la evaluación de avisos está implementada y descrita en [contrato-alertas.md](contrato-alertas.md).

## Recurso

`PreferenciasEnergeticas` contiene una configuración por cuenta autenticada:

| Campo | Regla |
| --- | --- |
| `tarifaCopKwh` | Entero COP/kWh entre 0 y 1.000.000. Si la cuenta aún no ha guardado preferencias, se responde el valor inicial editable de `1000`. |
| `limiteHogar.diarioKwh` | Umbral opcional de consumo del hogar para un día; vacío se guarda como `null`. |
| `limiteHogar.mensualKwh` | Umbral opcional del hogar para el mes calendario; vacío se guarda como `null`. |
| `limitesDispositivos[]` | Umbrales opcionales diarios y mensuales por `dispositivoId` activo que pertenezca al usuario. |

Los límites de energía son números no negativos de máximo 3 decimales, hasta 10.000.000 kWh. El valor `0` es un umbral válido; `null` significa que no se configuró límite. El administrador opera solo sobre sus preferencias personales. El analista puede consultarlas y no editarlas.

## Rutas

Base: `/api/preferencias-energeticas`. Las dos rutas requieren token de sesión y nunca aceptan `usuarioId` del cliente.

| Método | Acceso | Resultado |
| --- | --- | --- |
| `GET /` | Sesión | `{ preferencias: { tarifaCopKwh, limiteHogar, limitesDispositivos } }`; si aún no existe documento, responde valores iniciales sin crearlo. |
| `PUT /` | Cliente o administrador | Reemplaza la configuración editable de la cuenta y responde `{ mensaje, preferencias }`. |

Ejemplo de `PUT`:

```json
{
  "tarifaCopKwh": 1000,
  "limiteHogar": { "diarioKwh": 12, "mensualKwh": 280 },
  "limitesDispositivos": [
    { "dispositivoId": "507f1f77bcf86cd799439011", "diarioKwh": 2.5, "mensualKwh": 70 }
  ]
}
```

Si el identificador de un aparato no es válido, no pertenece a la cuenta o el aparato está archivado, se rechaza el cambio completo con `400`; no se guarda parcialmente. En una lista vacía no quedan límites individuales activos. Los límites de aparatos archivados no se devuelven y se eliminan al guardar la configuración desde la interfaz.

La eliminación de una cuenta elimina sus preferencias dentro de la misma transacción que sus demás datos. No hay migración de la tarifa almacenada antes en `localStorage`: ese valor era compartido por navegador, no pertenecía con seguridad a una cuenta. La tarifa inicial ahora es 1000 COP/kWh y cada usuario puede guardarla o cambiarla.

## Fuera de alcance de este contrato

Los avisos se calculan al consultar `/api/alertas`, con las reglas, fuentes y periodos definidos en [contrato-alertas.md](contrato-alertas.md). No se persiste un historial de avisos en esta versión.
