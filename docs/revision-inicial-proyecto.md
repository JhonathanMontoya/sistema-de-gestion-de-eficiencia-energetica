# Revisión inicial de EnerGest

**Fecha:** 26 de octubre de 2026  
**Base revisada:** commit `ceb2b54` (`feature/jhonathan-energest`)  
**Tipo de revisión:** lectura estática de código, documentación y estructura del repositorio.

## Resumen ejecutivo

EnerGest tiene una base adecuada para un MVP académico: frontend y API están separados, el backend organiza rutas/controladores/modelos, las operaciones principales identifican al usuario autenticado, las contraseñas se guardan con hash y hay controles de rol y registro de auditoría administrativa.

Antes de ampliar arquitectura o agregar funciones, conviene resolver dos asuntos: (1) el rol `analista`, descrito como solo lectura, puede provocar escrituras al inicializar ejemplos; (2) el documento de investigación define un alcance organizacional con alertas e informes, mientras la aplicación implementa cuentas individuales, estimaciones y un historial de usos. La rúbrica del curso debe decidir si se reduce el alcance escrito o se amplía el producto.

La evaluación es estática. No se ejecutó la aplicación, no se probaron flujos con cuentas reales, no se inspeccionó la base Atlas y no se realizó una auditoría de seguridad ni una evaluación asistida de accesibilidad.

Como marco de calidad se tomó **ISO/IEC 25010:2023**, que define un modelo de calidad para evaluar productos de software, sin tratar esta revisión como certificación ([ficha oficial de ISO](https://www.iso.org/standard/78176.html)). Para observaciones específicas de accesibilidad se consultó WCAG 2.2 y para dejar una referencia de seguridad futura, OWASP ASVS 5.0.0.

## Contexto y arquitectura observados

- **Frontend:** React 19, Vite, React Router y Axios; páginas y componentes React con CSS propio.
- **Backend:** Express 4 con Mongoose; `server.js` monta rutas, las rutas agregan autenticación/permisos, los controladores manejan solicitudes y los modelos definen los documentos.
- **Datos:** cuentas y roles, dispositivos, lecturas de consumo, contenido editorial, configuración de dominios y eventos de auditoría.
- **Flujos:** inicio público y educativo, registro e inicio de sesión, dispositivos, registro/historial de consumo y administración editorial/de usuarios.
- **Cálculo:** la estimación diaria usa watts × horas / 1000. Las lecturas se derivan de horas de uso; los totales por periodos son agregaciones de registros.
- **Despliegue:** las imágenes se guardan en disco local o en `UPLOADS_DIR`; la documentación ya advierte que el alojamiento debe conservar ese directorio.

La separación actual es suficiente para el tamaño académico observado. No recomiendo migrar a microservicios, introducir repositorios genéricos ni rehacer todo el backend. La próxima mejora arquitectónica debe reducir responsabilidades de componentes grandes y hacer explícitas las reglas de acceso.

## Hallazgos priorizados

### P1 — El acceso de solo lectura de `analista` no se cumple en el servidor

`backend/routes/dispositivoRoutes.js` protege `/inicializar-ejemplos` con autenticación, pero no con `permitirRoles`. El controlador inserta dispositivos en la cuenta autenticada. Además, las páginas de Consumo y Dispositivos llaman ese endpoint automáticamente (`frontend/src/pages/ConsumoEnergest.jsx`, `frontend/src/pages/DispositivosEnergest.jsx`), aunque ambas ocultan la edición para `analista`.

**Impacto:** abrir una pantalla de consulta puede escribir datos en la cuenta del analista. La interfaz dice “Solo lectura”, pero el servidor no mantiene esa regla en este endpoint.

**Recomendación:** hacer cumplir el rol en el backend y definir si los ejemplos son una acción opcional de bienvenida o datos creados automáticamente. Comprobar la regla para los tres roles antes de integrar el cambio.

### P1 — El alcance de investigación y el producto no coinciden

`docs/proyecto_investigacion.md` plantea gestión para organizaciones/instalaciones, alertas por límites, comparaciones entre periodos e informes. La implementación actual organiza datos por cuenta individual y ofrece estimaciones por dispositivo e historial semanal; no se observan entidad de organización, configuración de umbrales, alertas, informes ni comparación de periodos equivalentes.

**Impacto:** la entrega puede parecer incompleta frente a sus propios objetivos aunque el MVP actual funcione bien.

**Recomendación:** contrastar con la rúbrica. Si alertas, informes y organizaciones no son requisito de esta entrega, ajustar pregunta, objetivos y alcance a las funciones presentes. Si sí son obligatorios, convertirlos en historias separadas con criterios verificables y priorizarlos antes de cambios cosméticos.

### P2 — La carga automática de ejemplos impide conservar el inventario vacío

El endpoint de ejemplos se invoca al entrar en Consumo y Dispositivos. Cuando se archiva el último dispositivo, la interfaz vuelve a pedir ejemplos y el controlador permite inicializarlos otra vez. Esto hace difícil eliminar todos los datos de demostración y mantener una cuenta realmente vacía.

**Recomendación:** mostrar la opción para cargar datos de ejemplo de forma explícita y no recrearlos después de eliminar el último equipo. Mantener ejemplos automáticos solo si la rúbrica o una decisión de producto lo requiere.

### P2 — El carrusel público avanza solo y no tiene control para pausarlo

`frontend/src/pages/PortalEnergest.jsx` cambia el contenido cada 6,5 segundos. Hay controles anterior/siguiente, pero no un control de pausa; el ajuste CSS de movimiento reducido no detiene ese temporizador.

**Criterio:** WCAG 2.2, éxito 2.2.2, pide un mecanismo para pausar, detener u ocultar contenido que se mueve o actualiza automáticamente bajo las condiciones que define el criterio. La implementación merece corregirse y verificarse contra el flujo real. La referencia oficial explica el criterio [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide).

**Recomendación:** preferir que el usuario avance manualmente, o añadir un control de pausa perceptible y accesible; revisar también el comportamiento con `prefers-reduced-motion`.

### P2 — Los diálogos declaran semántica modal, pero no muestran gestión de foco/teclado

`FichaDispositivo.jsx` y `DialogoConfirmacionEnergest.jsx` usan `role="dialog"`/`role="alertdialog"` y `aria-modal`, pero en el código revisado no se observa mover el foco al abrir, mantenerlo dentro, devolverlo al cerrar ni cerrar con Escape. El patrón modal de WAI-ARIA describe esas interacciones de teclado y foco ([WAI-ARIA APG: Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).

**Recomendación:** verificar con teclado y lector de pantalla. Para el tamaño actual, usar `<dialog>` nativo o completar explícitamente el manejo de foco y Escape.

### P2 — Responsabilidades de página concentradas en `PortalEnergest.jsx`

El archivo contiene Inicio público y administración, junto con carga de datos editoriales, carrusel, formularios, dominios, usuarios, auditoría y acciones de cuenta. Algunas expresiones JSX de administración son muy densas. Esto encarece revisar cambios y facilita errores al tocar un flujo aislado.

**Recomendación:** dividir de forma incremental en páginas y componentes por función (Inicio, contenido, dominios, usuarios/cuentas). Mantener el contrato de API y la apariencia existentes. No hace falta añadir un framework de estado ni rehacer todas las páginas.

### P2 — El contrato de API documentado no cubre todas las funciones de administración

`docs/contrato-api-frontend.md` documenta roles y contenido, pero no refleja todas las rutas actuales de auditoría ni las operaciones administrativas sobre dispositivos y lecturas de una cuenta. `docs/entrega-companero/LEEME.md` conserva nombres y pasos de ramas de una integración anterior.

**Recomendación:** actualizar el contrato cuando se resuelva el alcance; marcar la guía de entrega como archivo histórico o actualizarla para que no se confunda con el flujo actual.

### P2 — Falta una base automatizada para proteger reglas importantes

Los `package.json` no definen scripts de pruebas automatizadas y el inventario no muestra una suite de pruebas. Las reglas más importantes (cálculo kWh, separación entre cuentas, permisos por rol, validación de lecturas y auditoría) son vulnerables a regresiones durante una refactorización.

**Recomendación:** agregar primero pruebas pequeñas para la fórmula y validaciones, y pruebas de API para aislamiento por usuario y permisos. Mantener el alcance de las pruebas acorde con el tiempo académico; no es necesario crear una infraestructura de QA empresarial.

### Consideración antes de exposición pública

La sesión conserva el bearer token en `localStorage` (`frontend/src/services/api.js` y `AuthContext.jsx`). Es una decisión frecuente para demos, pero un XSS en el frontend permitiría que scripts de la página lean ese token. Antes de exponer la aplicación ampliamente, hacer una revisión de seguridad específica de sesión, limitación de intentos de login, carga de imágenes y despliegue. La guía OWASP ASVS ofrece requisitos verificables ([versión estable consultada: 5.0.0](https://asvs.owasp.org/)). Este punto no es una afirmación de vulnerabilidad explotable ni una auditoría completa.

## Fortalezas que conviene conservar

- El registro público fija el rol `cliente`; no acepta que el navegador eleve privilegios.
- El middleware reconsulta el rol en MongoDB, por lo que un cambio de rol afecta tokens existentes.
- Lecturas y dispositivos personales se consultan usando `req.usuarioId`; el borrado de dispositivo se modela como archivo para conservar historial.
- La contraseña no se selecciona por defecto y se compara con bcrypt.
- El contenido se guarda como texto simple y la subida de imágenes limita tipo/tamaño y usa nombre aleatorio.
- Hay retroalimentación de carga/error/éxito, etiquetas para formularios, foco visible, soporte de reducción de movimiento en animaciones y confirmación de acciones destructivas.
- Los valores calculados se presentan como estimaciones y aclaran que no sustituyen una factura o medición.

## Ruta recomendada

1. Confirmar el alcance/rúbrica y decidir si EnerGest representa organizaciones o cuentas individuales para esta entrega.
2. Corregir el endpoint de inicialización de ejemplos y decidir el flujo de datos de demostración.
3. Resolver la diferencia entre objetivos, funciones entregadas y contrato de API.
4. Corregir pausa del carrusel y verificar los diálogos con teclado.
5. Añadir pruebas para las reglas de acceso y cálculo antes de dividir componentes grandes.
6. Refactorizar administración en componentes pequeños, en cambios revisables.

## Límites de la evaluación

No se inspeccionaron datos ni secretos de `.env`; no se ejecutaron scripts que conectan a Atlas. No se ejecutaron pruebas, builds, lint ni flujos de navegador. La revisión no sustituye validación contra la rúbrica del curso, pruebas manuales con usuarios ni una auditoría de seguridad/de accesibilidad.
# Seguimiento de correcciones

Esta revisión recoge hallazgos del estado inicial. Después se retiraron las rutas administrativas que exponían dispositivos/lecturas ajenos, se actualizó el portal de administración y se eliminó la inicialización automática de dispositivos de ejemplo. Consulta `revision-arquitectura-actual.md` y `plan-backend-nueva-version.md` para el estado posterior y el trabajo pendiente.
