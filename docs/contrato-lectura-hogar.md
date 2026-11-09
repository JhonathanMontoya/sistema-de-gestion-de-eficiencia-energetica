# Contrato propuesto: lectura de consumo del hogar

**Estado:** implementado en backend y formulario básico de consumo.  
**Contexto:** primera etapa individual de EnerGest, Colombia, kWh y COP. Los hogares compartidos quedan para una etapa posterior.

## Decisión de producto

Una lectura del hogar representa el consumo total de energía registrado para un periodo. La persona ingresa el consumo ya expresado en kWh, obtenido de una factura o calculado como diferencia entre lecturas del medidor. No se guardará en esta etapa el valor acumulado del contador.

Este recurso es distinto de `Lectura`, que sigue representando el consumo de un aparato. Los resúmenes no deben sumar ambos tipos como si fueran partes independientes del mismo consumo.

## Recurso `LecturaHogar`

| Campo | Tipo | Regla |
|---|---|---|
| `_id` | ObjectId | Identificador generado por MongoDB. |
| `usuarioId` | ObjectId | Propietario individual, tomado siempre de la sesión autenticada; se ignora cualquier valor enviado por el cliente. |
| `consumoKwh` | Número | Consumo total del hogar durante el periodo; finito, no negativo y con máximo 3 decimales. |
| `periodoInicio` | Fecha calendario | Día inicial incluido, formato API `YYYY-MM-DD`. |
| `periodoFin` | Fecha calendario | Día final incluido, formato API `YYYY-MM-DD`; no puede ser anterior al inicio ni futuro. |
| `fuente` | Enum | `factura`, `medidor` u `otro`. Describe de dónde obtuvo la persona el consumo ingresado. |
| `valorFacturaCop` | Entero opcional/null | Valor total de la factura en COP. Solo se admite cuando `fuente` es `factura`; no reemplaza `consumoKwh`. |
| `nota` | Texto opcional | Máximo 240 caracteres. No se almacenan imágenes ni datos de pago. |
| `createdAt`, `updatedAt` | Fecha | Marcas de tiempo automáticas. |

El periodo usa días calendario de `America/Bogota`, ambos extremos incluidos. `periodoFin` no puede superar el día actual en esa zona horaria. Una factura puede cubrir un rango que no coincida con el mes calendario.

## Endpoints propuestos

Todos requieren `Authorization: Bearer <token>` y operan exclusivamente sobre `usuarioId` autenticado.

Las rutas se montan bajo `/api/lecturas-hogar`. El rol analista puede consultar, pero las operaciones de escritura están disponibles para cliente y administrador sobre sus propios datos.

| Método y ruta | Uso |
|---|---|
| `GET /lecturas-hogar` | Listar las lecturas propias, de más recientes a más antiguas. |
| `GET /lecturas-hogar?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` | Filtrar periodos que se crucen con el rango consultado. `desde` y `hasta` son opcionales; si se envían ambos, `desde` debe ser menor o igual que `hasta`. |
| `POST /lecturas-hogar` | Registrar una lectura del hogar. |
| `PUT /lecturas-hogar/:id` | Corregir una lectura propia reemplazando sus campos editables. |
| `DELETE /lecturas-hogar/:id` | Eliminar una lectura propia. |

### Crear o reemplazar

```json
{
  "consumoKwh": 248.6,
  "periodoInicio": "2026-09-12",
  "periodoFin": "2026-10-11",
  "fuente": "factura",
  "valorFacturaCop": 186400,
  "nota": "Factura de septiembre"
}
```

Para una fuente distinta de `factura`, `valorFacturaCop` debe omitirse o enviarse como `null`.

### Respuestas propuestas

- `GET`: `{ "lecturas": [...] }`
- `POST`: `201 { "mensaje": "Lectura del hogar registrada", "lectura": {...} }`
- `PUT`: `200 { "mensaje": "Lectura del hogar actualizada", "lectura": {...} }`
- `DELETE`: `200 { "mensaje": "Lectura del hogar eliminada" }`

La respuesta de cada lectura incluye los campos del recurso y sus marcas de tiempo, pero no repite `usuarioId`.

### Errores

- `400`: datos inválidos, fechas mal formadas, periodo invertido/futuro, kWh inválidos o valor de factura incompatible con la fuente.
- `400`: identificador mal formado o datos inválidos.
- `404`: lectura que no existe o pertenece a otra cuenta. No se revela si otra persona tiene ese identificador.
- `409`: ya existe para esa cuenta una lectura con el mismo periodo exacto; se corrige con `PUT` en vez de duplicarla.
- `500`: error inesperado, sin devolver detalles internos.

No se rechazan periodos parcialmente superpuestos en esta primera versión; las vistas no deben sumar lecturas arbitrarias de hogar ni combinar estos valores con lecturas por aparato. Antes de agregar acumulados o alertas hay que definir cómo tratar solapamientos y normalizar periodos de factura.

## Reglas de propiedad y separación

1. `usuarioId` se asigna en el servicio desde la sesión y cada búsqueda, edición y borrado incluye ese propietario.
2. El modelo no tiene `dispositivoId`; las reglas de `Lectura` no se reutilizan para este recurso.
3. El administrador no obtiene endpoints para consultar lecturas de otros usuarios.
4. La tarifa configurada en la cuenta, si se implementa después, sirve para estimar costo; `valorFacturaCop` es el importe real ingresado. La interfaz debe distinguir ambos valores.
5. Las alertas por hogar no forman parte de este CRUD. El contrato de alertas definirá sus límites diarios/mensuales, la comparación con periodos no estándar de factura y el comportamiento frente a solapamientos.
6. Para hogares compartidos se podrá incorporar propiedad de hogar y membresías con una migración explícita. No se añade ahora un campo polimórfico o permisos futuros sin uso actual.

## Alcance para la implementación

- Modelo Mongoose independiente `LecturaHogar`.
- Servicio de aplicación propio para listar, validar, crear, reemplazar y eliminar.
- Rutas protegidas de sesión y controladores HTTP delgados.
- Índice compuesto único de `usuarioId`, `periodoInicio` y `periodoFin` para evitar el mismo periodo duplicado por cuenta.
- Interfaz mínima para capturar y consultar lecturas; sin rediseño visual amplio.
- Al eliminar una cuenta, sus lecturas del hogar se eliminan dentro de la misma transacción que sus dispositivos y lecturas por aparato.
- Migración de datos existentes: ninguna, porque el recurso y su colección son nuevos.

Este contrato no habilita por sí mismo lecturas acumuladas de medidor, importación de facturas, sumas automáticas del hogar ni avisos. Esas capacidades necesitan reglas separadas.
