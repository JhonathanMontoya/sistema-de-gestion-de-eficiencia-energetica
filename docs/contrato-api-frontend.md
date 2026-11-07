# Contrato de API para el frontend

Este documento define las rutas que puede usar la interfaz. Todas las rutas usan JSON y la base `/api` (por defecto `http://localhost:5000/api`). Las rutas privadas reciben `Authorization: Bearer <token>`; el interceptor existente en `frontend/src/services/api.js` ya agrega ese encabezado.

El contrato de lecturas totales del hogar está en [contrato-lectura-hogar.md](contrato-lectura-hogar.md). Sus rutas también están implementadas en esta versión.

## Roles

- `cliente`: crea y administra sus propios dispositivos y lecturas.
- `analista`: se conserva para las cuentas existentes del Sprint 1 y puede consultar sus propios dispositivos, lecturas y resumen, sin editarlos.
- `administrador`: administra el contenido editorial, la configuración de registro y los roles de usuarios; también puede gestionar sus propios datos mediante las rutas personales. No puede consultar ni modificar dispositivos o lecturas de otras cuentas.

El registro público siempre entrega `cliente`, incluso si alguien intenta incluir otro rol en el cuerpo de la petición. Los dominios permitidos se configuran en MongoDB; inicialmente son `gmail.com` y `unac.edu.co`. La API valida el dominio exacto al registrar y no acepta roles enviados por el navegador.

## Sesión

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `POST /auth/register` | Público | Crear cuenta: `{ "nombre", "email", "password" }` |
| `POST /auth/login` | Público | Iniciar sesión: `{ "email", "password" }` |
| `GET /auth/perfil` | Sesión | Obtener el usuario autenticado |
| `GET /auth/dominios` | Público | Obtener dominios actualmente permitidos para registro |

Registro e inicio de sesión responden `{ mensaje, token, usuario: { id, nombre, email, rol } }`.

## Inicio privado

| Método y ruta | Acceso | Respuesta |
| --- | --- | --- |
| `GET /dashboard/resumen` | Sesión | `{ resumen: { totalDispositivos, consumoHoyKwh, consumoMesKwh, lecturasRecientes } }` |
| `GET /lecturas/resumen-semanal` | Sesión | `{ desde, hasta, consumoTotalKwh, porDispositivo: [{ dispositivoId, nombre, consumoKwh, cantidadLecturas }] }` |

Los consumos del resumen suman las lecturas guardadas por la cuenta autenticada. “Hoy” y “mes” usan el calendario de Colombia (`America/Bogota`), independientemente de la zona horaria del servidor. Si no hay datos, el total es `0` y las listas están vacías.

## Dispositivos

Todas estas rutas se limitan al dueño autenticado.

| Método y ruta | Uso |
| --- | --- |
| `GET /dispositivos` | Responde `{ dispositivos: [...] }` con dispositivos activos |
| `POST /dispositivos` | Crear `{ nombre, categoria, potenciaWatts, horasUsoDiarias, ubicacion }` |
| `PUT /dispositivos/:id` | Actualizar esos campos |
| `DELETE /dispositivos/:id` | Archivar el dispositivo y conservar sus lecturas anteriores |

La API no crea dispositivos de ejemplo automáticamente. Las cuentas empiezan con el inventario vacío y cada persona registra los aparatos que realmente tiene.

Las categorías admitidas son `aire_acondicionado`, `nevera`, `iluminacion`, `computador`, `televisor`, `lavadora` y `otro`. La potencia se registra en watts y las horas de uso son de 0 a 24 por día. En la interfaz se sugieren potencias típicas y rangos por categoría como referencias orientativas, no como límites técnicos universales; el usuario puede editar la potencia para usar la que aparece en su equipo. El servidor calcula `consumoEstimadoKwhDia` con la regla de dominio `backend/domain/energia/calculos.js` y la fórmula `(potenciaWatts × horasUsoDiarias) / 1000`; cuando se entregan watts y horas, el valor enviado por el cliente no es la fuente del cálculo. Se conservan también los campos `tipo` y `consumoEstimadoKwhDia` para clientes anteriores.

## Lecturas de consumo

| Método y ruta | Uso |
| --- | --- |
| `GET /lecturas` | Responde `{ lecturas: [...] }`, más recientes primero (máximo 200); cada registro incluye `horasUso` si se calculó desde horas |
| `GET /lecturas?dispositivoId=...&desde=...&hasta=...` | Filtrar por dispositivo y rango de fechas ISO |
| `POST /lecturas` | Crear una lectura medida con `{ dispositivoId, consumoKwh, fecha, nota }` o registrar un uso con `{ dispositivoId, horasUso, fecha, nota }`; la fecha y la nota son opcionales |

Una lectura solo se acepta para un dispositivo activo del mismo usuario. `consumoKwh` debe ser un valor numérico igual o mayor que cero (no se admiten valores vacíos, nulos, infinitos ni negativos). Si se envía `horasUso`, la API calcula y guarda `consumoKwh = potenciaWatts × horasUso / 1000`; las horas deben estar entre 0 y 24. `fecha` acepta `YYYY-MM-DD` o una marca ISO 8601 con zona horaria (`Z` o desplazamiento explícito), y no puede ser futura. Si se omite, se usa el momento actual. El resumen semanal acumula los registros de los últimos siete días y los agrupa por dispositivo.

## Lecturas del hogar

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /lecturas-hogar` | Sesión | Listar lecturas propias (máximo 200), con filtros opcionales `desde` y `hasta` sobre periodos que se cruzan con el rango consultado |
| `POST /lecturas-hogar` | Cliente o administrador | Crear `{ consumoKwh, periodoInicio, periodoFin, fuente, valorFacturaCop?, nota? }` |
| `PUT /lecturas-hogar/:id` | Cliente o administrador | Reemplazar los campos editables de una lectura propia |
| `DELETE /lecturas-hogar/:id` | Cliente o administrador | Eliminar una lectura propia |

Los periodos son fechas calendario inclusivas `YYYY-MM-DD` de Colombia; no se aceptan fechas futuras ni periodos invertidos. `consumoKwh` admite hasta tres decimales. `fuente` es `factura`, `medidor` u `otro`; el valor opcional de factura solo se admite con fuente factura y se expresa en COP enteros. Los periodos parcialmente superpuestos se permiten; estas lecturas no se suman entre sí ni con las lecturas de aparatos. El rol analista puede consultar, pero no crear, editar ni eliminar.

## Preferencias energéticas

El contrato completo está en [contrato-preferencias-energeticas.md](contrato-preferencias-energeticas.md). La tarifa COP/kWh y los límites diarios/mensuales del hogar y de cada aparato pertenecen a la cuenta autenticada.

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /preferencias-energeticas` | Sesión | Obtener las preferencias propias; si no se han guardado, devuelve tarifa inicial `1000` COP/kWh y límites vacíos |
| `PUT /preferencias-energeticas` | Cliente o administrador | Reemplazar `{ tarifaCopKwh, limiteHogar: { diarioKwh, mensualKwh }, limitesDispositivos: [{ dispositivoId, diarioKwh, mensualKwh }] }` |

El rol analista puede consultar las preferencias, pero no modificarlas. Los avisos se calculan al consultar la ruta `/alertas` descrita abajo.

## Avisos de consumo

El contrato y las reglas de cálculo están en [contrato-alertas.md](contrato-alertas.md). Los avisos se calculan al consultar; no forman un historial persistido.

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /alertas` | Sesión | `{ limitesConfigurados, alertas: [...] }` con los límites superados de la cuenta autenticada |

Las recomendaciones son reglas deterministas; no usan IA. El contrato y el criterio de priorización están en [contrato-recomendaciones.md](contrato-recomendaciones.md).

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /recomendaciones` | Sesión | Devuelve consejos editoriales publicados que correspondan a las categorías de los dispositivos activos del usuario autenticado |

Las estimaciones por aparato se distinguen de los promedios calculados desde la lectura más reciente del hogar. No se suman ambas fuentes.

## Contenido editorial

El endpoint público solo devuelve publicaciones visibles. El administrador puede listar también borradores y crear, editar o eliminar contenido.

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /contenido` | Público | `{ contenidos: [...] }` ordenados por `orden` |
| `GET /contenido/administrar` | Administrador | Lista publicaciones y borradores |
| `POST /contenido` | Administrador | Crear contenido |
| `PUT /contenido/:id` | Administrador | Editar contenido |
| `DELETE /contenido/:id` | Administrador | Eliminar contenido |
| `POST /contenido/imagenes` | Administrador | Subir una imagen binaria JPG, PNG o WebP (máximo 5 MB); responde `{ imagenUrl }` con una ruta `/uploads/...` servida por el backend |

Campos de contenido: `{ slug, categoria, etiqueta, titulo, resumen, texto, imagenUrl, imagenAlt, textoBoton, categoriaDispositivo, fuente, fuenteUrl, orden, publicado }`. Las categorías aceptadas son `portada`, `seccion`, `paso`, `funcionalidad`, `ejemplo`, `llamada-accion`, `informativo`, `consejo`, `pregunta-frecuente`, `cambio-eficiencia` y `beneficio-gestion`. El texto se almacena como texto simple, no HTML. Las imágenes subidas se guardan en `backend/uploads` (o en `UPLOADS_DIR` si se configura); el hosting debe conservar esa carpeta para persistirlas.

El administrador puede editar los bloques directamente en Inicio al activar **Editar contenido de inicio**; cada bloque abre un editor superpuesto y los cambios guardados se reflejan en la misma página. También puede gestionar publicaciones desde **Administración → Contenido e imágenes**. `portada` cambia el titular, resumen, texto, etiqueta, botón e imagen principal; `seccion` cambia títulos de secciones (slugs reservados `home-pasos`, `home-herramientas`, `home-aprende`, `home-eficiencia` y `home-beneficios`); `paso`, `funcionalidad` y `ejemplo` cambian las tarjetas explicativas; `llamada-accion` controla la invitación final. `informativo`, `consejo`, `pregunta-frecuente`, `cambio-eficiencia` y `beneficio-gestion` crean publicaciones educativas. Estas categorías de inicio se agregan a las anteriores. Los campos opcionales son `etiqueta`, `imagenAlt`, `textoBoton` y `categoriaDispositivo`; este último se usa en consejos específicos para una categoría de aparato. Los enlaces de imagen y fuente deben usar HTTP/HTTPS, salvo las rutas de imagen locales `/uploads/...` que devuelve el cargador.

El texto es texto plano y se inserta como texto en React; no se admiten etiquetas HTML ni contenido ejecutable. Al subir una imagen, se puede agregar un texto alternativo descriptivo; si la imagen es decorativa, puede dejarse vacío. La interfaz pública solo muestra registros publicados. El orden numérico organiza el contenido y cada slug identifica un registro único.

## Configuración de registro

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /configuracion/publica` | Público | Consultar `{ dominios }` |
| `PUT /configuracion/dominios` | Administrador | Guardar `{ dominios: ["gmail.com", "unac.edu.co"] }`; se requiere al menos un dominio válido |

## Usuarios

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /usuarios` | Administrador | Listar cuentas sin contraseñas |
| `PATCH /usuarios/:id` | Administrador | Editar el nombre y/o correo de una cuenta con `{ "nombre", "email" }`; el correo debe ser único |
| `PATCH /usuarios/:id/rol` | Administrador | Cambiar rol con `{ "rol": "cliente" }`, `{ "rol": "analista" }` o `{ "rol": "administrador" }` |
| `GET /usuarios/auditoria` | Administrador | Consultar cambios de rol y eventos de eliminación sin identificar la cuenta eliminada; no devuelve eventos sobre dispositivos o consumos |
| `DELETE /usuarios/:id` | Administrador | Eliminar permanentemente la cuenta, sus dispositivos, lecturas por aparato y del hogar, y auditorías que la identifiquen. Registra solo un evento no identificativo de eliminación. No permite eliminar la propia cuenta ni el último administrador |

No existen rutas administrativas para consultar o modificar los dispositivos y las lecturas de otra cuenta. Cada cuenta accede a sus propios datos mediante las rutas personales protegidas por sesión.

La eliminación en la aplicación borra los documentos de la base activa. No elimina copias de seguridad administradas por MongoDB Atlas; estas dependen de la política de retención configurada en el servicio.

## Primer administrador y contenido inicial

El registro público no puede crear administradores. Registra dos cuentas normales. Desde `backend`, ejecuta `npm run promover-administrador -- primer-correo@gmail.com segundo-correo@unac.edu.co`. El comando acepta uno o dos correos y solo promueve cuentas que ya existen.

Ejecuta `npm run inicializar-contenido` desde `backend` para insertar contenido público inicial para hogares y secciones editables que no existan. El script conserva las ediciones existentes y oculta únicamente las doce tarjetas genéricas antiguas de demostración empresarial (`tendencia-1` a `tendencia-6` y `beneficio-1` a `beneficio-6`). Después, el administrador puede modificar, publicar, despublicar o eliminar las piezas desde la interfaz. El script necesita la conexión MongoDB configurada; no lo ejecutes contra una base compartida sin acordarlo primero con quienes la usan.

## Configuración local

Usa `backend/.env.example` como guía para crear `backend/.env` y completar los valores privados localmente. No subas ese archivo ni compartas secretos reales. `FRONTEND_URL` acepta una lista separada por comas; los valores por defecto cubren Vite y su servidor de previsualización.
