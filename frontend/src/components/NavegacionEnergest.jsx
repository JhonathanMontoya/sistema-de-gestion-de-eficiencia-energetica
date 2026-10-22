import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavegacionEnergest() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  function salir() {
    cerrarSesion();
    navigate('/');
  }

  return (
    <header className={'eg-nav ' + (estaAutenticado ? 'eg-nav--privada' : 'eg-nav--publica')}>
      <Link className="eg-marca" to="/" aria-label="EnerGest, inicio">
        <span className="eg-marca__icono">✳</span><span>Ener<strong>Gest</strong></span>
      </Link>
      <nav className="eg-tabs-navegacion" aria-label="Secciones principales">
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/consumo">Consumo</NavLink>
        <NavLink to="/dispositivos">Dispositivos</NavLink>
      </nav>
      {estaAutenticado ? (
        <div className="eg-cuenta">
          <div><strong>{usuario?.nombre}</strong><span>{usuario?.rol}</span></div>
          {usuario?.rol === 'administrador' && <Link className="eg-enlace" to="/administrar">Administrar</Link>}
          <button className="eg-enlace" type="button" onClick={salir}>Salir</button>
        </div>
      ) : (
        <div className="eg-nav__acciones">
          <Link className="eg-enlace" to="/login">Iniciar sesión</Link>
          <Link className="eg-boton eg-boton--compacto" to="/register">Crear cuenta <span aria-hidden="true">↗</span></Link>
        </div>
      )}
    </header>
  );
}
