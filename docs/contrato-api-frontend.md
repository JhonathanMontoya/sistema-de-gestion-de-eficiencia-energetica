# Contrato de API para el frontend

Este documento define las rutas que puede usar la interfaz. Todas las rutas usan JSON y la base `/api` (por defecto `http://localhost:5000/api`). Las rutas privadas reciben `Authorization: Bearer <token>`; el interceptor existente en `frontend/src/services/api.js` ya agrega ese encabezado.

## Roles

- `cliente`: crea y administra sus propios dispositivos y lecturas.
- `analista`: se conserva para las cuentas existentes del Sprint 1 y puede consultar sus propios dispositivos, lecturas y resumen, sin editarlos.
- `administrador`: administra el contenido editorial y los roles de usuarios; también puede gestionar sus propios datos. Los datos de dispositivos y lecturas siguen separados por cuenta.

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

Los consumos del resumen suman las lecturas guardadas por la cuenta autenticada. Si no hay datos, el total es `0` y las listas están vacías.

## Dispositivos

Todas estas rutas se limitan al dueño autenticado.

| Método y ruta | Uso |
| --- | --- |
| `GET /dispositivos` | Responde `{ dispositivos: [...] }` con dispositivos activos |
| `POST /dispositivos` | Crear `{ nombre, categoria, potenciaWatts, horasUsoDiarias, ubicacion }` |
| `PUT /dispositivos/:id` | Actualizar esos campos |
| `DELETE /dispositivos/:id` | Archivar el dispositivo y conservar sus lecturas anteriores |

Las categorías admitidas son `aire_acondicionado`, `nevera`, `iluminacion`, `computador`, `televisor`, `lavadora` y `otro`. La potencia se registra en watts y las horas de uso son de 0 a 24 por día. En la interfaz se sugieren potencias típicas y rangos por categoría como referencias orientativas, no como límites técnicos universales; el usuario puede editar la potencia para usar la que aparece en su equipo. El servidor calcula `consumoEstimadoKwhDia` con la fórmula `(potenciaWatts × horasUsoDiarias) / 1000`. Se conservan también los campos `tipo` y `consumoEstimadoKwhDia` para clientes anteriores.

## Lecturas de consumo

| Método y ruta | Uso |
| --- | --- |
| `GET /lecturas` | Responde `{ lecturas: [...] }`, más recientes primero (máximo 200); cada registro incluye `horasUso` si se calculó desde horas |
| `GET /lecturas?dispositivoId=...&desde=...&hasta=...` | Filtrar por dispositivo y rango de fechas ISO |
| `POST /lecturas` | Crear una lectura medida con `{ dispositivoId, consumoKwh, fecha, nota }` o registrar un uso con `{ dispositivoId, horasUso, fecha, nota }`; la fecha y la nota son opcionales |

Una lectura solo se acepta para un dispositivo activo del mismo usuario. `consumoKwh` debe ser un número igual o mayor que cero. Si se envía `horasUso`, la API calcula y guarda `consumoKwh = potenciaWatts × horasUso / 1000`; las horas deben estar entre 0 y 24. Si se omite la fecha, se usa el momento actual. El resumen semanal acumula los registros de los últimos siete días y los agrupa por dispositivo.

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

Campos de contenido: `{ slug, categoria, titulo, resumen, texto, imagenUrl, fuente, fuenteUrl, orden, publicado }`. Las categorías aceptadas son `portada`, `informativo`, `consejo`, `pregunta-frecuente`, `cambio-eficiencia` y `beneficio-gestion`. El texto se almacena como texto simple, no HTML. Las imágenes subidas se guardan en `backend/uploads` (o en `UPLOADS_DIR` si se configura); el hosting debe conservar esa carpeta para persistirlas.

## Configuración de registro

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /configuracion/publica` | Público | Consultar `{ dominios }` |
| `PUT /configuracion/dominios` | Administrador | Guardar `{ dominios: ["gmail.com", "unac.edu.co"] }`; se requiere al menos un dominio válido |

## Usuarios

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /usuarios` | Administrador | Listar cuentas sin contraseñas |
| `PATCH /usuarios/:id/rol` | Administrador | Cambiar rol con `{ "rol": "cliente" }`, `{ "rol": "analista" }` o `{ "rol": "administrador" }` |

## Primer administrador y contenido inicial

El registro público no puede crear administradores. Registra dos cuentas normales. Desde `backend`, ejecuta `npm run promover-administrador -- primer-correo@gmail.com segundo-correo@unac.edu.co`. El comando acepta uno o dos correos y solo promueve cuentas que ya existen.

Ejecuta `npm run inicializar-contenido` desde `backend` para insertar contenido público y las secciones educativas administrables que no existan. El script no reemplaza documentos existentes, por lo que puede volver a ejecutarse después de actualizar el proyecto. Después el administrador puede modificarlos desde la interfaz.

## Configuración local

Usa `backend/.env.example` como guía para crear `backend/.env` y completar los valores privados localmente. No subas ese archivo ni compartas secretos reales. `FRONTEND_URL` acepta una lista separada por comas; los valores por defecto cubren Vite y su servidor de previsualización.
