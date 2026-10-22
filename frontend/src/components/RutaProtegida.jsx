import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function RutaProtegida({ children }) {
  const { estaAutenticado } = useAuth();
  const location = useLocation();
  if (!estaAutenticado) {
    const destino = ['/consumo', '/dispositivos'].includes(location.pathname) ? location.pathname : '/dispositivos';
    return <main className="eg-acceso-fondo"><section className="eg-acceso" role="alert"><span className="eg-acceso__icono" aria-hidden="true">✳</span><span className="eg-etiqueta">Acceso a tu espacio personal</span><h1>Primero debes registrarte</h1><p>Para guardar dispositivos y consultar el consumo asociado, crea una cuenta o inicia sesión. La información general de EnerGest está disponible desde Inicio.</p><div className="eg-acceso__acciones"><Link className="eg-boton" to={'/register?redirect=' + encodeURIComponent(destino)}>Crear cuenta</Link><Link className="eg-boton eg-boton--suave" to={'/login?redirect=' + encodeURIComponent(destino)}>Ya tengo una cuenta</Link><Link className="eg-enlace" to="/">Volver a Inicio</Link></div></section></main>;
  }
  return children;
}
