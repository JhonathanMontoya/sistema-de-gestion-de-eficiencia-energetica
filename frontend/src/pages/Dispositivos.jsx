import { useState } from 'react';
import '../styles/Dispositivos.css';

// Pestañas del módulo de dispositivos. Cada una representa una historia
// de usuario que se implementará en un sprint próximo. Por ahora solo
// muestran un estado "en proceso", sin lógica ni datos reales.
const PESTANAS = [
  { id: 'registrar', titulo: 'Registrar dispositivo', hu: 'HU-05', sprint: 'Sprint 2' },
  { id: 'listado', titulo: 'Mis dispositivos', hu: 'HU-06', sprint: 'Sprint 2' },
];

export default function Dispositivos() {
  const [pestanaActiva, setPestanaActiva] = useState(PESTANAS[0].id);
  const pestana = PESTANAS.find((p) => p.id === pestanaActiva);

  return (
    <div className="dispositivos">
      <header className="dispositivos__header">
        <span className="dispositivos__eyebrow">Inventario de equipos</span>
        <h1>Dispositivos</h1>
      </header>

      <main className="dispositivos__main">
        <nav className="dispositivos__tabs">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`dispositivos__tab ${p.id === pestanaActiva ? 'dispositivos__tab--activa' : ''}`}
              onClick={() => setPestanaActiva(p.id)}
            >
              {p.titulo}
            </button>
          ))}
        </nav>

        <section className="dispositivos__contenido">
          <span className="dispositivos__badge">
            {pestana.hu} · {pestana.sprint} · En proceso
          </span>
          <h2>{pestana.titulo}</h2>
          <p>Este módulo todavía está en construcción. Se implementará en un próximo sprint.</p>
        </section>
      </main>
    </div>
  );
}