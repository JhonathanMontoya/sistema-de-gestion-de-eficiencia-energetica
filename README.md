# EnerGest

EnerGest es una aplicación web académica para conocer y registrar el consumo estimado de dispositivos. La página Inicio y el contenido educativo son públicos; Consumo y Dispositivos requieren una cuenta iniciada. Los usos se calculan desde la potencia en watts y las horas registradas, y se guardan en MongoDB con su fecha para consultar acumulados de siete días. Usa React y Vite en el frontend, Express en el backend y MongoDB con Mongoose para guardar los datos.

## Estructura

- `backend/config`: conexión con MongoDB.
- `backend/models`: usuarios, dispositivos, lecturas, contenido editorial y configuración de dominios.
- `backend/uploads`: imágenes subidas desde la administración (se excluyen del control de versiones).
- `backend/controllers` y `backend/routes`: lógica y endpoints de la API.
- `backend/middleware`: autenticación y permisos por rol.
- `frontend/src`: páginas, componentes y comunicación con la API.
- `docs/contrato-api-frontend.md`: rutas y formatos de datos acordados para la interfaz.

## Puesta en marcha local

1. Instala Node.js y las dependencias del backend y frontend con `npm install` dentro de cada carpeta.
2. Copia `backend/.env.example` a `backend/.env` y completa localmente `MONGO_URI` y `JWT_SECRET`. No subas el `.env` al repositorio.
3. En una terminal, desde `backend`, inicia el servidor con `npm run dev`.
4. En otra terminal, desde `frontend`, inicia Vite con `npm run dev`.
5. Abre la dirección local que muestra Vite.

El backend corre por defecto en `http://localhost:5000` y Vite en `http://localhost:5173`. `frontend/.env.example` permite cambiar la URL de API; el valor predeterminado funciona con ese backend local.

## Roles

- `cliente`: rol asignado en el registro público; administra sus propios dispositivos y lecturas.
- `analista`: se conserva para las cuentas existentes y puede consultar sus propios datos sin editarlos.
- `administrador`: gestiona contenido editorial y roles de cuentas.

El servidor valida permisos en cada petición. El cliente nunca puede asignarse el rol `administrador` enviando datos desde el navegador. Los dispositivos y lecturas se consultan por la cuenta autenticada.

Para habilitar dos administradores, registra dos cuentas con correos permitidos. Promueve la primera desde `backend` con `npm run promover-administrador -- primer-correo@gmail.com segundo-correo@unac.edu.co`. El comando acepta uno o dos correos y solo promueve cuentas que ya existen. No hay contraseñas de administrador compartidas ni cuentas precreadas. Ejecuta `npm run inicializar-contenido` para insertar el contenido público de demostración y las secciones educativas editables que aún no existan; puedes volver a ejecutarlo después de actualizar el código, ya que no reemplaza textos existentes. Ambos procesos usan la base indicada en `.env`.

En Administración → Dominios de registro puedes cambiar los dominios autorizados. La regla se guarda en MongoDB y la API la aplica al crear cuentas. Para subir imágenes, edita una publicación y selecciona JPG, PNG o WebP de hasta 5 MB; el archivo se guarda en `backend/uploads` y se publica al guardar la publicación. Esa carpeta está excluida de Git. En un despliegue, configura `UPLOADS_DIR` con la ruta de un volumen persistente para conservar los archivos entre actualizaciones o reinicios.

## API

La lista de rutas, permisos y estructuras JSON está en [docs/contrato-api-frontend.md](docs/contrato-api-frontend.md). La API se publica bajo `/api`; consulta `/api/health` para verificar que el servidor está activo.
