# EnerGest

EnerGest es una aplicación web académica para registrar dispositivos y lecturas de consumo energético. Usa React y Vite en el frontend, Express en el backend y MongoDB con Mongoose para guardar los datos.

## Estructura

- `backend/config`: conexión con MongoDB.
- `backend/models`: usuarios, dispositivos, lecturas y contenido editorial.
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

Para habilitar el primer administrador, primero registra una cuenta de manera normal y luego ejecuta, desde `backend`, `npm run promover-administrador -- correo@ejemplo.com`. Para añadir textos editoriales de demostración en una base vacía, ejecuta `npm run inicializar-contenido`. Ambos procesos usan la base indicada en `.env`.

## API

La lista de rutas, permisos y estructuras JSON está en [docs/contrato-api-frontend.md](docs/contrato-api-frontend.md). La API se publica bajo `/api`; consulta `/api/health` para verificar que el servidor está activo.
