import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CAMBIOS_EFICIENCIA } from '../data/cambiosEficiencia';
import { BENEFICIOS_GESTION } from '../data/beneficiosGestion';
import '../styles/Dashboard.css';
import TarjetaGrid from '../components/TarjetaGrid';

export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);

  function manejarCierreSesion() {
    cerrarSesion();
    navigate('/login');
  }

  function manejarClicModulo(modulo) {
    setModuloSeleccionado(modulo);
  }

  function cerrarModal() {
    setModuloSeleccionado(null);
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <span className="dashboard__eyebrow">
            Sistema de gestión de eficiencia energética
          </span>

          <h1>
            Ener<span>Gest</span>
          </h1>
        </div>

        <div className="dashboard__usuario">
          <div className="dashboard__usuario-info">
            <strong>{usuario?.nombre}</strong>
            <span>{usuario?.rol}</span>
          </div>

          <button
            className="dashboard__logout"
            onClick={manejarCierreSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard__main">

        <section className="dashboard__bienvenida">
          <h2>Bienvenido/a, {usuario?.nombre}</h2>

          <p>
            La eficiencia energética busca que aprovechemos mejor la energía
            que usamos todos los días. Estas son las tendencias y beneficios
            clave que guían la gestión energética actual.
          </p>
        </section>

        <section className="dashboard__seccion">
          <h2 className="dashboard__seccion-titulo">
            Gestión del sistema
          </h2>

          <div className="dashboard__grid">
            <article
              className="dashboard__card dashboard__card--activa"
              onClick={() => navigate('/dispositivos')}
              role="button"
              tabIndex={0}
            >
              <span className="dashboard__card-badge dashboard__card-badge--activa">
                Dispositivos
              </span>

              <h3>Mis dispositivos</h3>

              <p>
                Registra y consulta los dispositivos utilizados para gestionar
                y analizar su consumo energético.
              </p>
            </article>
          </div>
        </section>

        <section className="dashboard__seccion">
          <h2 className="dashboard__seccion-titulo">
            Lo que está cambiando la eficiencia energética
          </h2>

          <TarjetaGrid
            items={CAMBIOS_EFICIENCIA}
            onSeleccionar={manejarClicModulo}
          />
        </section>

        <section className="dashboard__seccion">
          <h2 className="dashboard__seccion-titulo">
            Beneficios de una gestión energética
          </h2>

          <TarjetaGrid
            items={BENEFICIOS_GESTION}
            onSeleccionar={manejarClicModulo}
          />
        </section>

      </main>

      {moduloSeleccionado && (
        <div
          className="dashboard__modal-overlay"
          onClick={cerrarModal}
        >
          <div
            className="dashboard__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dashboard__modal-cerrar"
              onClick={cerrarModal}
            >
              ✕
            </button>

            <h2>{moduloSeleccionado.titulo}</h2>

            <div className="dashboard__modal-contenido">
              {moduloSeleccionado.contenido}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}