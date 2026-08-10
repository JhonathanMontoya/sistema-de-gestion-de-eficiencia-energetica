import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

// Modulos que se implementaran en sprints siguientes.
// Por ahora solo son tarjetas de referencia, sin logica.
const MODULOS_FUTUROS = [
  {
    titulo: 'Consumo en tiempo real',
    descripcion: 'Lecturas de medidores por área o sede.',
  },
  {
    titulo: 'Dispositivos',
    descripcion: 'Inventario de equipos y su consumo asociado.',
  },
  {
    titulo: 'Alertas de eficiencia',
    descripcion: 'Notificaciones cuando el consumo supera el umbral.',
  },
  {
    titulo: 'Reportes',
    descripcion: 'Historicos y comparativos de eficiencia energética.',
  },
];

export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function manejarCierreSesion() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <span className="dashboard__eyebrow">Sistema de gestión de eficiencia energética</span>
          <h1>
            Ener<span>Gest</span>
          </h1>
        </div>

        <div className="dashboard__usuario">
          <div className="dashboard__usuario-info">
            <strong>{usuario?.nombre}</strong>
            <span>{usuario?.rol}</span>
          </div>
          <button className="dashboard__logout" onClick={manejarCierreSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard__main">
        <section className="dashboard__bienvenida">
          <h2>Bienvenido/a, {usuario?.nombre}</h2>
          <p>
            Este es el panel principal del sistema. Los módulos de monitoreo de
            consumo y eficiencia se habilitarán en los próximos sprints.
          </p>
        </section>

        <section className="dashboard__grid">
          {MODULOS_FUTUROS.map((modulo) => (
            <article key={modulo.titulo} className="dashboard__card">
              <span className="dashboard__card-badge">Próximamente</span>
              <h3>{modulo.titulo}</h3>
              <p>{modulo.descripcion}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
