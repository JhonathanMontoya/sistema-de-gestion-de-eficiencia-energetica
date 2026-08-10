import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envuelve cualquier pagina que solo deba verse si el usuario inicio sesion.
// Si no hay usuario autenticado, redirige de vuelta al login.
export default function RutaProtegida({ children }) {
  const { estaAutenticado } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
