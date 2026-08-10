# EnerGest — Sistema de Gestión de Eficiencia Energética

Entregable Sprint 1: login funcional + página principal, con backend, frontend
y conexión a base de datos. Sin módulos de negocio todavía (eso llega en los
siguientes sprints).

## Stack

| Capa      | Tecnología                          |
|-----------|--------------------------------------|
| Frontend  | React 18 + Vite + React Router       |
| Backend   | Node.js + Express                    |
| Base de datos | MongoDB + Mongoose               |
| Auth      | JWT + bcrypt (contraseñas hasheadas) |

## Estructura del proyecto

```
energia-mvp/
├── backend/
│   ├── config/db.js            # conexión a MongoDB
│   ├── controllers/authController.js
│   ├── middleware/authMiddleware.js  # valida el JWT
│   ├── models/User.js
│   ├── routes/authRoutes.js
│   ├── server.js               # punto de entrada
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/Login.jsx
    │   ├── pages/Dashboard.jsx     # home tras iniciar sesión
    │   ├── context/AuthContext.jsx
    │   ├── components/RutaProtegida.jsx
    │   └── services/api.js
    └── .env.example
```

## 1. Requisitos previos

- Node.js 18+ instalado
- Una base de datos MongoDB. Dos opciones, elige una:
  - **MongoDB Atlas** (recomendado si no quieres instalar nada): crea una
    cuenta gratis en https://www.mongodb.com/cloud/atlas, crea un cluster
    gratuito (M0) y copia la cadena de conexión.
  - **MongoDB local**: instala MongoDB Community Server en tu máquina.

## 2. Levantar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` y pon tu `MONGO_URI` real (local o de Atlas) y cambia `JWT_SECRET`
por cualquier texto largo propio.

```bash
npm run dev
```

Deberías ver en la consola:

```
[DB] Conectado a MongoDB -> energia_mvp
[Server] Backend corriendo en http://localhost:5000
```

Si ves un error de conexión, revisa que `MONGO_URI` esté bien copiada (usuario,
password, y que tu IP esté en la whitelist de Atlas si usas la nube).

### Crear tu primer usuario de prueba

El login necesita que exista al menos un usuario en la base de datos. Como el
sprint 1 solo pide el login (no un formulario de registro visual), créalo con
una petición HTTP directa. Puedes usar Postman, Insomnia, o este `curl`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana Torres","email":"ana@energest.com","password":"123456","rol":"administrador"}'
```

Esto te devuelve un token y confirma que el usuario quedó guardado en Mongo.

## 3. Levantar el frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre la URL que te muestre Vite (normalmente `http://localhost:5173`).

## 4. Probar el flujo completo

1. Entra a `http://localhost:5173` → te redirige a `/login`.
2. Inicia sesión con el usuario que creaste en el paso anterior
   (`ana@energest.com` / `123456`).
3. Si las credenciales son correctas, te lleva a `/dashboard`, la página
   principal del sistema (sin funciones todavía, solo estructura).
4. El botón "Cerrar sesión" borra el token y te regresa al login.
5. Si intentas entrar directo a `/dashboard` sin haber iniciado sesión, el
   sistema te redirige automáticamente a `/login` (ruta protegida).

## Decisiones técnicas (para tu sustentación)

- **Contraseñas hasheadas con bcrypt**: nunca se guarda la contraseña en texto
  plano en la base de datos.
- **JWT en vez de sesiones**: el token se guarda en `localStorage` del
  navegador y se envía en cada petición en el header `Authorization`. Es el
  enfoque estándar para separar frontend y backend como pide el proyecto.
- **Variables de entorno (`.env`)**: ni la cadena de conexión a Mongo ni el
  secreto de JWT quedan escritos en el código fuente.
- **Arquitectura por capas en el backend** (`routes` → `controllers` →
  `models`): permite agregar los módulos de consumo energético en los
  siguientes sprints sin reescribir lo ya hecho.
- **Ruta protegida en el frontend**: el `Dashboard` valida que exista sesión
  activa antes de mostrarse.

## Pendiente para próximos sprints (no incluido aquí)

- Módulos funcionales del dashboard (consumo, dispositivos, alertas, reportes).
- Pantalla visual de registro (por ahora solo existe el endpoint).
- Historias de usuario, casos de uso y diagrama de clases (documentación,
  no código — se trabajan aparte).
- Tablero en Trello y repositorio en GitHub con este código versionado.
