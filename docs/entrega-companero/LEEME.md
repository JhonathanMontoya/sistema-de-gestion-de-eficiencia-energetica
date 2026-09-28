# Parte de interfaz para la rama de tu compañero

Estos archivos están listos para copiar al frontend existente. No reemplazan la estructura ni el contexto de autenticación actuales.

## Dónde copiar

| Archivo de esta carpeta | Destino dentro de `frontend/src` |
| --- | --- |
| `App.jsx` | `App.jsx` |
| `PortalEnergest.jsx` | `pages/PortalEnergest.jsx` (archivo nuevo) |
| `PortalEnergest.css` | `styles/PortalEnergest.css` (archivo nuevo) |
| `index.css` | `index.css` |
| `Auth.css` | `styles/Auth.css` |

`App.jsx` mantiene los componentes actuales `Login`, `Register`, `AuthProvider` y `RutaProtegida`. La pantalla pública usa `GET /api/contenido`; los espacios privados consumen las rutas descritas en [../contrato-api-frontend.md](../contrato-api-frontend.md).

## Flujo de Git recomendado

1. Tu rama de backend es `feature/energest-backend` y contiene el contrato de API.
2. Tu compañero crea `feature/energest-interfaz` desde `main`, copia estos cinco archivos y confirma sus cambios.
3. Integra primero `feature/energest-backend` en `main`; después tu compañero actualiza su rama con `main` y abre la integración de `feature/energest-interfaz`.

Los dos cambios se concentran en carpetas distintas: backend y documentación en tu rama; frontend en la de tu compañero. La app usa el contenido de MongoDB para el carrusel y la administración editorial. En la rama backend, desde `backend`, ejecuta `npm run inicializar-contenido` una vez para cargar ejemplos si la base está vacía.
