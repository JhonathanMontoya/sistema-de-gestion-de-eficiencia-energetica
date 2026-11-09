# Revisión de arquitectura actual de EnerGest

**Fecha:** 26 de octubre de 2026  
**Base:** commit `ceb2b54` (`feature/jhonathan-energest`)  
**Alcance:** lectura estática de estructura, dependencias, modelos y flujos; no se modificó código.

**Seguimiento:** esta revisión documenta el estado previo a las correcciones de privacidad realizadas después. Se retiraron las rutas administrativas para consultar o modificar dispositivos y lecturas de otras cuentas, y la auditoría visible quedó limitada a eventos seguros de cambios de rol y eliminación no identificativa. La administración ahora permite editar nombre/correo y eliminar una cuenta junto con dispositivos, lecturas y auditorías que la identificaban, en una transacción; se impide eliminar la propia cuenta o el último administrador. La eliminación de la base activa no controla copias de seguridad de Atlas. La revisión original no ejecutó pruebas; los cambios tampoco se han validado con una suite automatizada.

**Seguimiento posterior:** se retiró el endpoint y las llamadas que creaban dispositivos de ejemplo al abrir Consumo/Dispositivos o después de archivar el último aparato. Se eliminó el campo `ejemplosDispositivosCreados` del esquema. Las reglas de consumo nuevas se centralizaron en `backend/domain/energia/calculos.js`. Los próximos casos de lectura del hogar y alertas deben añadirse como servicios propios.

**Seguimiento de separación de capas:** los casos de uso actuales de autenticación, dispositivos, lecturas, resumen, contenido, configuración, imágenes y usuarios se movieron a servicios en `backend/services`. Los controladores ya no importan modelos Mongoose: reciben datos de Express, llaman al servicio correspondiente y construyen la respuesta HTTP. La separación se aplica a las funciones existentes; las reglas de nuevas funciones aún deben diseñarse antes de implementarlas. Se corrigió además el resumen agregado para comparar `usuarioId` como `ObjectId`, que es el tipo almacenado en MongoDB.

## Propósito acordado

EnerGest será primero una aplicación personal para registrar y entender el consumo energético del hogar en Colombia. Se mantiene la estimación por aparato que ya existe, se planea añadir lecturas manuales del hogar (kWh o datos de factura), avisos configurables y recomendaciones deterministas con explicación. La IA queda fuera. Hogares compartidos y la relación de varias cuentas con un hogar quedan para una fase futura. El administrador gestionará contenido y configuración, sin consultar consumos privados.

## Veredicto actual

La separación React/Vite → API Express → MongoDB/Mongoose sigue siendo adecuada para el MVP académico. En el backend ya se separaron controladores HTTP de servicios de aplicación y reglas energéticas puras. Esto reduce el acoplamiento al agregar casos de uso, sin añadir microservicios, repositorios genéricos ni un marco de estado global. Los servicios actuales acceden a Mongoose directamente; es suficiente para este proyecto mientras esa dependencia quede fuera de controladores y reglas puras.

El frontend conserva acoplamiento moderado entre páginas, estado de interacción y llamadas Axios. Como acordamos priorizar el backend, se ajustará gradualmente al conectar funciones nuevas y su rediseño se dejará para el final.

## Mapa actual

```text
React pages/components → Axios client → API JSON + bearer token
                                          ↓
Express routes → autenticación/autorización → controladores HTTP
                                              ↓
                                     servicios por capacidad
                                        ├─ servicios de aplicación
                                        └─ reglas puras: domain/energia
                                              ↓
                                      modelos Mongoose → MongoDB
```

Hechos que respaldan el mapa:

- `backend/server.js` configura middleware y monta rutas; las rutas conectan middleware con controladores.
- Los controladores actuales delegan en `backend/services` y traducen resultados/errores a HTTP. Las reglas puras de cálculo están en `backend/domain/energia/calculos.js`.
- `ConsumoEnergest.jsx` y `DispositivosEnergest.jsx` llaman rutas directamente y gestionan carga, errores, formularios y presentación. `PortalEnergest.jsx` concentra página pública y administración.
- Los documentos `Dispositivo` y `Lectura` usan `usuarioId` como propietario. `Lectura` requiere `dispositivoId`.

## Hallazgos priorizados

### P1 — La administración tiene acceso a consumos privados

`backend/routes/usuarioRoutes.js` protege todas sus rutas para `administrador`, incluida `GET /:id/datos`. `usuarioController.datosUsuario` devuelve dispositivos y lecturas de la cuenta elegida. También existen operaciones administrativas para editar/archivar dispositivos y eliminar lecturas, presentadas en la pestaña “Cuentas y registros” de `PortalEnergest.jsx`.

Esto contradice el requisito acordado: el administrador gestiona contenido y configuración, pero no ve datos de consumo. Es un límite de autorización y de producto, no solo una separación de código. Debe corregirse antes de extender ese portal. Los registros de auditoría pueden conservar metadatos de acciones administrativas sin exponer el detalle energético.

### P1 — Los datos están ligados a la persona, no al hogar

`Dispositivo.usuarioId` y `Lectura.usuarioId` son la frontera actual de propiedad. Eso funciona para cuentas individuales, pero una cuenta adicional de un hogar no podría ver legítimamente los mismos dispositivos/lecturas sin cambiar esa frontera. Además, la lectura actual siempre referencia un aparato, por lo que no representa una lectura agregada de factura o medidor del hogar.

Para la etapa personal, se puede permitir que la cuenta registre el total del hogar sin introducir membresías. Para la etapa posterior de hogares compartidos, definir un agregado `Hogar` y membresías con permisos explícitos; los recursos compartidos pertenecerían al hogar y se autorizarían por membresía, no por el `usuarioId` de quien los creó. Mantener por separado las lecturas de aparato y las lecturas agregadas del hogar evita mezclar sus periodos, fuentes y reglas de cálculo.

### P1 — El controlador es también la capa de negocio y persistencia

Los controladores contienen reglas, validación, consultas y respuestas HTTP. La fórmula de estimación aparece en controladores de dispositivos, lecturas y administración de cuentas, además de una utilidad del frontend. `lecturaController` también tiene reglas de fechas, propiedad y límite de horas.

Para el MVP actual esto reduce archivos y conceptos, pero al agregar alertas las reglas podrían terminar repetidas entre lectura manual, estimación de dispositivos y resumen del hogar. La recomendación es extraer funciones de dominio puras para cálculos/validaciones y servicios de aplicación pequeños para casos de uso; mantener Mongoose como implementación de persistencia. Añadir repositorios solo si un caso real lo exige, no como capa vacía por anticipado.

### P2 — La interfaz depende de rutas y modelos de respuesta concretos

Las páginas llaman rutas con Axios directamente y leen respuestas como `respuesta.data.dispositivos`; no hay servicios por función que traduzcan el contrato de API para la UI. Cambiar nombres o particionar endpoints puede obligar a editar páginas y componentes. La pestaña de administración contiene a la vez contenido, dominios, roles, auditoría y operaciones sobre datos personales.

Recomendación incremental: servicios frontend por capacidad (contenido, dispositivos, lecturas, configuración) y componentes/páginas por tarea. Las páginas deberían coordinar interacción y renderizado; los servicios encapsulan URLs y formato de API. No hace falta una capa de estado global para este tamaño.

### P2 — Tarifa y preferencias no tienen una propiedad clara en el servidor

La tarifa COP/kWh se guarda en `localStorage` bajo una clave fija, no en MongoDB ni asociada a la cuenta. En un mismo navegador puede persistir al cambiar de cuenta; en otro dispositivo no acompaña al usuario. No hay todavía un modelo/configuración que delimite si la tarifa es individual o del hogar.

Para la fase personal, definirla como preferencia de cuenta y persistirla del lado servidor si debe acompañar la cuenta entre dispositivos. Cuando exista el agregado hogar, mover la tarifa allí solo si se acuerda que todos sus miembros comparten esa configuración.

### P2 — Las lecturas mezclan “estimado” y “medido” en un mismo recurso

El contrato permite registrar una lectura medida en kWh o generar una desde horas de uso, y ambos casos quedan en el modelo `Lectura` con `consumoKwh`, opcional `horasUso` y `fecha`. No se guarda una clase explícita de origen/precisión.

Al incorporar recibos del hogar, las vistas y alertas deben comparar periodos y fuentes compatibles. Recomiendo explicitar el origen (estimación de uso, ingreso de kWh medidos, lectura de medidor/factura) y el periodo cubierto. No presentar un total estimado de aparatos como si fuera el valor real de factura.

### P2 — Roles y permisos están codificados en varios lugares

Los roles aparecen como enum de `User`, listas en controladores/rutas, condiciones en React y documentación. El backend es quien debe decidir acceso; ocultar controles en la UI solo mejora la experiencia. Al reservar `analista` para hogares compartidos, conservar el nombre ahora no debe implicar permisos futuros ambiguos.

Recomendación: mantener autorización en middleware/servicios del backend y centralizar las capacidades o políticas de cada rol en un lugar. El frontend puede usar esos permisos para mostrar u ocultar acciones, sin ser fuente de seguridad.

### P2 — Documentos de alcance no representan el producto acordado

`docs/proyecto_investigacion.md` habla de organizaciones, consumo real, análisis, alertas e informes, mientras el código implementa datos por cuenta individual, estimaciones y lecturas por dispositivo. El contrato de API describe la aplicación actual, pero no un hogar ni una lectura total de factura.

Esto afecta la trazabilidad académica y también las decisiones de arquitectura. Antes de construir funciones nuevas, alinear pregunta, objetivos, alcance y contrato con la etapa personal y dejar hogares compartidos/integración como evolución, salvo que la rúbrica exija otra cosa.

## Dirección objetivo proporcional

Para las siguientes capacidades, propongo estos límites:

```text
Frontend
  páginas por tarea → servicios HTTP por capacidad → contrato API
                                                │
API                                                   │
  rutas/middleware → controladores HTTP → casos de uso/servicios
                                      → reglas puras de dominio
                                      → persistencia Mongoose

Dominio energético (reglas puras)
  estimación y costo · periodos · tipos de lectura · evaluación de límites
```

Principios aplicables a EnerGest:

1. Las reglas de consumo, costos y avisos deben poder explicarse sin depender de JSX, Express o consultas Mongoose.
2. Los controladores traducen HTTP a una operación y su resultado; no concentran el producto completo.
3. El servidor determina identidad, propiedad y permisos; la interfaz no puede concederlos.
4. Cada función nueva actualiza frontend, API, modelo y contrato cuando corresponda, pero conserva límites separados de los demás dominios.
5. Los avisos se derivan de lecturas con fuente y periodo conocidos. La forma de entregarlos dentro de la app se define como parte de ese caso de uso.
6. La integración de medidores y la colaboración entre cuentas son adaptadores/capacidades futuras; no deben filtrarse en las reglas del MVP antes de tener una fuente concreta.

## Orden recomendado

1. Corregir el límite de privacidad del administrador y decidir qué metadatos administrativos son necesarios.
2. Alinear documentación de alcance con el producto personal acordado.
3. Diseñar el modelo de lecturas para diferenciar fuente, periodo y precisión, separando lectura de aparato y lectura total del hogar.
4. Extraer cálculo energético y evaluación de límites a funciones/servicios de dominio pequeños.
5. Persistir tarifa como preferencia con propietario definido y actualizar el contrato de API.
6. Descomponer gradualmente pantallas/servicios por capacidad cuando se trabajen esas funciones.
7. Diseñar hogares compartidos y membresías cuando se priorice esa etapa; entonces migrar explícitamente la propiedad de los recursos.

## Límites

Esta revisión es estática: no se ejecutó la aplicación ni pruebas, no se inspeccionó Atlas y no se validó la rúbrica académica. No se modificó código ni datos. La recomendación de no introducir capas genéricas es un juicio de proporcionalidad basado en la escala actual, no una regla universal.
