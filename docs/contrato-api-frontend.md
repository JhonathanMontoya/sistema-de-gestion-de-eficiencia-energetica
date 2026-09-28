# Contrato de API para el frontend

Este documento define las rutas que puede usar la interfaz. Todas las rutas usan JSON y la base `/api` (por defecto `http://localhost:5000/api`). Las rutas privadas reciben `Authorization: Bearer <token>`; el interceptor existente en `frontend/src/services/api.js` ya agrega ese encabezado.

## Roles

- `cliente`: crea y administra sus propios dispositivos y lecturas.
- `analista`: se conserva para las cuentas existentes del Sprint 1 y puede consultar sus propios dispositivos, lecturas y resumen, sin editarlos.
- `administrador`: administra el contenido editorial y los roles de usuarios; también puede gestionar sus propios datos. Los datos de dispositivos y lecturas siguen separados por cuenta.

El registro público siempre entrega `cliente`, incluso si alguien intenta incluir otro rol en el cuerpo de la petición.

## Sesión

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `POST /auth/register` | Público | Crear cuenta: `{ "nombre", "email", "password" }` |
| `POST /auth/login` | Público | Iniciar sesión: `{ "email", "password" }` |
| `GET /auth/perfil` | Sesión | Obtener el usuario autenticado |

Registro e inicio de sesión responden `{ mensaje, token, usuario: { id, nombre, email, rol } }`.

## Inicio privado

| Método y ruta | Acceso | Respuesta |
| --- | --- | --- |
| `GET /dashboard/resumen` | Sesión | `{ resumen: { totalDispositivos, consumoHoyKwh, consumoMesKwh, lecturasRecientes } }` |

Los consumos del resumen suman las lecturas guardadas por la cuenta autenticada. Si no hay datos, el total es `0` y las listas están vacías.

## Dispositivos

Todas estas rutas se limitan al dueño autenticado.

| Método y ruta | Uso |
| --- | --- |
| `GET /dispositivos` | Responde `{ dispositivos: [...] }` con dispositivos activos |
| `POST /dispositivos` | Crear `{ nombre, tipo, consumoEstimadoKwhDia, ubicacion }` |
| `PUT /dispositivos/:id` | Actualizar esos campos |
| `DELETE /dispositivos/:id` | Archivar el dispositivo y conservar sus lecturas anteriores |

`consumoEstimadoKwhDia` es una cantidad numérica estimada en kWh por día.

## Lecturas manuales

| Método y ruta | Uso |
| --- | --- |
| `GET /lecturas` | Responde `{ lecturas: [...] }`, más recientes primero (máximo 200) |
| `GET /lecturas?dispositivoId=...&desde=...&hasta=...` | Filtrar por dispositivo y rango de fechas ISO |
| `POST /lecturas` | Crear `{ dispositivoId, consumoKwh, fecha, nota }`; `fecha` y `nota` son opcionales |

Una lectura solo se acepta para un dispositivo activo del mismo usuario. `consumoKwh` debe ser un número igual o mayor que cero. Si se omite la fecha, se usa el momento actual.

## Contenido editorial

El endpoint público solo devuelve publicaciones visibles. El administrador puede listar también borradores y crear, editar o eliminar contenido.

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /contenido` | Público | `{ contenidos: [...] }` ordenados por `orden` |
| `GET /contenido/administrar` | Administrador | Lista publicaciones y borradores |
| `POST /contenido` | Administrador | Crear contenido |
| `PUT /contenido/:id` | Administrador | Editar contenido |
| `DELETE /contenido/:id` | Administrador | Eliminar contenido |

Campos de contenido: `{ slug, categoria, titulo, resumen, texto, imagenUrl, orden, publicado }`. Las categorías aceptadas son `portada`, `informativo`, `consejo` y `pregunta-frecuente`. El texto se almacena como texto simple, no HTML.

## Usuarios

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /usuarios` | Administrador | Listar cuentas sin contraseñas |
| `PATCH /usuarios/:id/rol` | Administrador | Cambiar rol con `{ "rol": "cliente" }`, `{ "rol": "analista" }` o `{ "rol": "administrador" }` |

## Primer administrador y contenido inicial

El registro público no puede crear administradores. Registra primero una cuenta normal y, desde `backend`, ejecuta `npm run promover-administrador -- correo@ejemplo.com` una sola vez para habilitar la administración.

Para insertar textos de demostración en una base de datos vacía, ejecuta `npm run inicializar-contenido` desde `backend`. El script no reemplaza textos que ya existen. Después el administrador puede modificarlos desde la interfaz.

## Configuración local

Usa `backend/.env.example` como guía para crear `backend/.env` y completar los valores privados localmente. No subas ese archivo ni compartas secretos reales. `FRONTEND_URL` acepta una lista separada por comas; los valores por defecto cubren Vite y su servidor de previsualización.
