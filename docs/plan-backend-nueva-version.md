# Inventario y plan del backend de EnerGest

**Fecha de revisión inicial:** 26 de octubre de 2026  
**Base revisada:** estructura actual en `feature/jhonathan-energest`  
**Tipo de revisión inicial:** estática de rutas, controladores, modelos, servicios frontend y contrato de API.

**Seguimiento del 27 de octubre de 2026:** además de los cambios descritos en la revisión inicial, están implementados la lectura manual del hogar, las preferencias por cuenta, los avisos y las recomendaciones deterministas. Se verificaron los flujos HTTP personales y administrativos en bases MongoDB locales aisladas: autenticación, dispositivo, preferencias, lectura del hogar, avisos, recomendación; gestión de usuarios/roles, edición editorial, permisos por rol, privacidad de consumos y borrado transaccional con sus datos asociados. Para validar transacciones se usó un replica set local temporal. El cambio de rol y su auditoría también se probaron por HTTP en un replica set local: degradación/promoción, persistencia de dos eventos y rechazo del cambio de rol propio. Atlas se comprobó con `hello` y `dbStats` de solo lectura; se confirmó conexión a `energia_mvp`, replica set y primario, sin escrituras. Las bases/carpetas temporales se eliminaron al terminar. Se alineó el documento académico con el alcance personal acordado y se corrigieron textos de interfaz que aún describían una planta de demostración o datos en tiempo real. El frontend pasó lint y build; lint conserva una advertencia previa en `AuthContext.jsx`. También se corrigió el resumen diario/mensual para usar límites exactos del calendario de Colombia (`America/Bogota`), se endureció la validación de fechas y consumos de lecturas, y se añadieron pruebas de dominio con `node:test`. Cinco pruebas automatizadas y los smoke HTTP locales del resumen/validaciones y administración de roles pasaron. La base local temporal se eliminó. La lista de implementación más abajo refleja este seguimiento.

## Propósito acordado para la siguiente versión

EnerGest se trabajará primero para uso personal, con consumo estimado por aparato y capacidad de registrar manualmente el consumo total del hogar. Debe permitir límites configurados por aparato y por hogar, con periodos diario y mensual, y mostrar avisos dentro de la aplicación. Tendrá contenido educativo general y recomendaciones personalizadas basadas en reglas explicables; la IA y los hogares compartidos quedan para etapas futuras. Colombia y COP son el contexto de unidades y moneda.

## Clasificación del sistema actual

| Capacidad o pieza | Estado actual comprobado | Decisión | Motivo y trabajo pendiente |
|---|---|---|---|
| Arranque Express, configuración de CORS, JSON, uploads y conexión Mongo | `backend/server.js` configura infraestructura y monta siete grupos de rutas | **Conservar** | Es una base suficiente para el MVP. Más adelante conviene separar la creación de `app` del arranque del proceso para facilitar validación aislada, si las pruebas lo requieren. |
| Registro, inicio de sesión y token | `authService.js`, `authController.js`, `authRoutes.js`, `authMiddleware.js`; contraseñas con bcrypt y rol público forzado a `cliente` | **Conservar y endurecer al tocar** | La propiedad del usuario autenticado es correcta como límite actual. Revisar validación, errores y ciclo de vida de sesión al trabajar esa capacidad; no rehacer autenticación sin necesidad. |
| Roles `administrador`, `cliente` y `analista` | Están en `User`, middleware, rutas y UI. `analista` puede consultar sus propios datos, sin editar | **Ajustar** | La función futura de `analista` no está definida para la etapa personal. Mantener temporalmente compatibilidad con cuentas existentes, pero documentar y revisar sus permisos antes de ampliar funciones. No eliminar cuentas ni cambiar roles de Atlas durante esta revisión. |
| Administración de cuentas | `usuarioService.js`: listado, edición de nombre/correo, cambio de rol y eliminación; bloquea autoeliminación y borrado del último administrador | **Conservar** | El cambio de rol y su auditoría, así como la eliminación de cuenta y sus dependencias, se realizan en transacciones; requiere MongoDB con soporte de transacciones. El servicio elimina dispositivos, lecturas, preferencias y auditorías identificables sin exponer consumos a otros usuarios. |
| Privacidad de consumo | Rutas de dispositivos/lecturas filtran por `req.usuarioId`; ya no hay endpoints administrativos para consultar consumos ajenos | **Conservar como requisito obligatorio** | La autorización del servidor, no la visibilidad de botones, debe seguir siendo la frontera de privacidad. |
| Dispositivos personales | `Dispositivo` pertenece a `usuarioId`; `dispositivoService.js` implementa CRUD; reglas puras de cálculo/validación nuevas están en `backend/domain/energia/calculos.js` | **Conservar** | La API calcula desde watts y horas y no confía en el kWh enviado junto con ellos. Se preserva el camino legado para clientes/documentos anteriores que no envían esos campos. |
| Creación automática de aparatos de ejemplo | La ruta, llamadas de frontend y `User.ejemplosDispositivosCreados` fueron retirados | **Retirada** | Evita insertar dispositivos que la persona no registró y que reaparecían al archivar el último dispositivo. La API ahora empieza con inventario vacío. |
| Lecturas por aparato | `Lectura` exige `dispositivoId`, registra kWh o deriva kWh desde horas y conserva historial por usuario | **Conservar y clarificar** | En la interfaz se debe indicar cuándo el valor se deriva de horas y potencia. La lectura manual del hogar tiene un recurso separado y no se suma a estas lecturas. |
| Lectura manual del total del hogar | `LecturaHogar` mantiene kWh, fuente y periodo, con propiedad individual, rutas protegidas y formulario en Consumo | **Implementada** | La cuenta individual es la propietaria. Los hogares compartidos y la migración de propiedad quedan para otra etapa. |
| Resúmenes de consumo | `dashboardService.js` suma lecturas por usuario con periodos diarios y mensuales limitados por medianoche de Colombia; el resumen semanal agrupa lecturas de aparato | **Implementado y verificado** | El tablero limita consultas con intervalos inclusivos/exclusivos en `America/Bogota`. Los totales estimados por aparato se mantienen aparte de mediciones totales del hogar. |
| Alertas configurables | `GET /api/alertas` calcula avisos del hogar y aparatos a partir de preferencias y datos disponibles | **Implementadas** | Son avisos de consulta, explican fuente y periodo y no mantienen historial ni generan correo o push. Los cálculos no mezclan lecturas del hogar con estimaciones por aparato. |
| Tarifa COP/kWh y límites | `PreferenciasEnergeticas` guarda tarifa y límites por cuenta; formulario en Consumo | **Implementada** | El valor inicial de tarifa es editable y se presenta como referencia del usuario, no como tarifa oficial. Los límites se evalúan en el servicio de alertas. |
| Contenido educativo | Modelo CRUD `Contenido`, rutas públicas/admin y datos semilla | **Conservar y reutilizar** | Puede sostener educación general. La personalización debe ser una capa de recomendaciones deterministas basada en aparatos/lecturas y referenciar contenido existente, no duplicar el CMS. |
| Configuración de dominios de registro | `ConfiguracionAcceso`, endpoints públicos/admin y validación del dominio en registro | **Conservar por ahora; confirmar necesidad académica** | Es funcional y administrable, pero añade complejidad al alta. Retirarlo solo si la rúbrica y el uso personal no requieren restringir registros. |
| Auditoría administrativa | Muestra cambios de rol y eventos de eliminación no identificativos | **Conservar con mínimo de datos** | Mantener el alcance acotado y evitar datos de consumo o identificadores de cuentas eliminadas en el evento retenido. |
| Servicios de API en frontend | `frontend/src/services/api.js` centraliza Axios/token, pero las páginas construyen rutas directamente | **Ajustar gradualmente** | Crear funciones pequeñas por capacidad cuando se conecten las nuevas funciones. No hacer una reescritura de UI ni incorporar un gestor global de estado para el MVP. |
| Límite controlador/servicio del backend | Controladores de auth, dispositivos, lecturas, resumen, contenido, configuración, imágenes y usuarios delegan en módulos de `backend/services` | **Aplicado** | Los controladores ya no importan modelos ni contienen reglas del caso de uso. `manejarError.js` traduce errores conocidos a HTTP; no se agregaron repositorios genéricos. |
| Documentación académica de alcance | `docs/proyecto_investigacion.md` ahora describe el uso personal doméstico, funciones implementadas, privacidad y exclusiones acordadas | **Alineada con el alcance actual** | Falta contrastarla con la rúbrica institucional antes de entregar; no se atribuye cumplimiento de requisitos que no se han revisado. |
| `docs/entrega-companero/` | Copia de archivos y notas de una entrega anterior, no importada por el backend activo | **No borrar en este inventario** | Es material de referencia, no una dependencia de ejecución demostrada. Confirmar su utilidad y trazabilidad antes de archivarlo o eliminarlo. |

## Diseño objetivo proporcional

```text
Rutas y middleware Express
        ↓ autenticación, autorización y validación HTTP
Controladores delgados
        ↓ invocan casos de uso
Servicios de aplicación
        ├─ dispositivos y estimación
        ├─ lecturas de aparato
        ├─ lecturas agregadas del hogar
        ├─ evaluación de límites y avisos
        └─ preferencias y recomendaciones
        ↓ usan reglas puras y modelos Mongoose
MongoDB
```

Las reglas matemáticas y de periodos deben poder evaluarse sin Express, JSX ni consultas a MongoDB. No se propone introducir microservicios, repositorios genéricos ni una capa vacía para cada modelo.

## Orden de implementación recomendado

1. **Hecho — Contrato e implementación de lectura del hogar:** modelo, validaciones, propiedad individual, rutas protegidas y formulario CRUD básico definidos en `docs/contrato-lectura-hogar.md`.
2. **Hecho — Eliminar la población automática de datos:** se quitaron las invocaciones de inicialización en carga y después de archivar, junto con endpoint, controlador y campo del usuario. No se crean ejemplos implícitamente.
3. **Hecho para capacidades actuales — Extraer reglas existentes:** se centralizaron cálculo kWh y validación de watts/horas en backend y los casos de uso actuales se movieron a servicios. La lectura del hogar usa fechas calendario `America/Bogota` y almacena cada fecha como medianoche UTC.
4. **Hecho — Lectura manual del hogar:** entidad y endpoints separados de `Lectura`, por ahora propiedad individual y sin membresías compartidas. La eliminación de usuario también borra estas lecturas dentro de la transacción existente.
5. **Hecho — Preferencias por cuenta:** tarifa editable COP/kWh y límites diarios/mensuales del hogar y de cada aparato en `PreferenciasEnergeticas`; lectura, actualización, UI básica y borrado junto con la cuenta. Contrato en `docs/contrato-preferencias-energeticas.md`.
6. **Hecho — Avisos dentro de la app:** se calculan al consultar y comparan límites diarios/mensuales por aparato y hogar, explicando fuente y periodo. No se persiste historial en esta primera versión; las reglas están en `docs/contrato-alertas.md`.
7. **Hecho — Recomendaciones deterministas:** `/api/recomendaciones` relaciona aparatos activos con consejos editoriales publicados por categoría e informa que las estimaciones son orientativas; la vista está integrada en Consumo.
8. **Hecho — Integración básica de las capacidades personales:** formularios de lectura y preferencias, avisos y recomendaciones en Consumo, con estados de carga/error/vacío. El rediseño visual amplio sigue fuera de esta etapa backend-first.

## Hallazgos que bloquean una implementación correcta

- `Lectura` no puede representar por sí sola la lectura total del hogar: siempre necesita un `dispositivoId`. Se creó el recurso separado `LecturaHogar`.
- Los resúmenes actuales de dispositivos no suman lecturas del hogar. Los avisos mantienen ambos orígenes separados para evitar doble conteo.
- Los nombres “lectura manual” y “consumo medido” no siempre reflejan el origen real: cuando se ingresan horas, el kWh es estimado desde potencia.
- Las proyecciones por aparato usan el mes calendario actual en `America/Bogota`; el promedio de hogar se normaliza al mes en que termina la última lectura. La explicación visible identifica esas proyecciones.
- La tarifa y los umbrales se guardan por cuenta. Avisos y recomendaciones se calcularon correctamente en el flujo local verificado; no mantienen historial de avisos y las recomendaciones no usan IA.
- Las fechas de lectura por aparato aceptan solo `YYYY-MM-DD` o marcas ISO 8601 con zona explícita; las fechas calendario se interpretan como medianoche de Colombia. Fechas imposibles, formatos ambiguos, consumos vacíos/nulos/no numéricos/negativos y fechas futuras se rechazan.

## Fuera de alcance en esta etapa

- Integración con medidores inteligentes y proveedor de IA.
- Hogares compartidos, membresías, permisos entre miembros y migración de propiedad a un hogar.
- Rediseño visual amplio.
- Eliminación de datos de Atlas, cambios en cuentas reales o ejecución de scripts de producción.

## Límites de la revisión inicial y verificación posterior

El inventario inicial fue estático y no confirma por sí solo la configuración, el contenido ni los requisitos de la rúbrica. La verificación posterior cubrió flujos HTTP en MongoDB local y pruebas automatizadas de reglas puras; no valida todos los formularios mediante una sesión real en el navegador ni equivale a una prueba de aceptación de la rúbrica. No se modificó Atlas.
