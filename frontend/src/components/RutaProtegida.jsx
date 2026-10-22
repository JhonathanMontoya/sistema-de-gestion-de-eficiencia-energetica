import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envuelve cualquier pagina que solo deba verse si el usuario inicio sesion.
// Si no hay usuario autenticado, redirige de vuelta al login.
export default function RutaProtegida({ children }) {
  const { estaAutenticado } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    const destino = ['/consumo', '/dispositivos'].includes(location.pathname) ? location.pathname : '/consumo';
    return <Navigate to={`/register?redirect=${encodeURIComponent(destino)}`} replace />;
  }

  return children;
}
