import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TarjetaGrid from '../components/TarjetaGrid';
import FormularioDispositivo from '../components/FormularioDispositivo';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import { buscarCategoria } from '../data/categoriasDispositivo';
import '../styles/Dashboard.css';
import '../styles/Dispositivos.css';

// Pantalla del modulo de dispositivos:
// HU-06 registrar, HU-07 ver en tarjetas, editar y eliminar.
export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dispositivoEditando, setDispositivoEditando] = useState(null);
  const [dispositivoAEliminar, setDispositivoAEliminar] = useState(null);

  // Al abrir la pantalla, pedimos al backend los dispositivos del usuario.
  useEffect(() => {
    let activo = true;

    api
      .get('/devices')
      .then(({ data }) => {
        if (activo) setDispositivos(data.dispositivos);
      })
      .catch((err) => {
        if (activo) {
          setErrorCarga(err.response?.data?.mensaje || 'No se pudieron cargar los dispositivos');
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  function abrirRegistro() {
    setDispositivoEditando(null);
    setMostrarFormulario(true);
  }

  function abrirEdicion(dispositivo) {
    setDispositivoEditando(dispositivo);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setDispositivoEditando(null);
  }

  // Se usa tanto para registrar como para editar, segun haya un dispositivo en edicion.
  async function guardarDispositivo(datos) {
    if (dispositivoEditando) {
      const { data } = await api.put(`/devices/${dispositivoEditando._id}`, datos);
      setDispositivos((prev) =>
        prev.map((d) => (d._id === data.dispositivo._id ? data.dispositivo : d))
      );
    } else {
      const { data } = await api.post('/devices', datos);
      setDispositivos((prev) => [data.dispositivo, ...prev]);
    }
    cerrarFormulario();
  }

  async function eliminarDispositivo() {
    await api.delete(`/devices/${dispositivoAEliminar._id}`);
    setDispositivos((prev) => prev.filter((d) => d._id !== dispositivoAEliminar._id));
    setDispositivoAEliminar(null);
  }

  // Adaptamos cada dispositivo al formato que espera <TarjetaGrid>.
  const items = dispositivos.map((d) => ({
    id: d._id,
    titulo: d.nombre,
    descripcion: buscarCategoria(d.categoria)?.etiqueta ?? d.categoria,
    meta: `${d.potenciaWatts} W`,
    original: d,
  }));

  return (
    <div className="dashboard">
      <main className="dashboard__main">
        <Link to="/dashboard" className="dispositivos__volver">
          ← Volver al panel
        </Link>

        <div className="dispositivos__barra">
          <div>
            <h2 className="dispositivos__titulo">Mis dispositivos</h2>
            <p className="dispositivos__contador">
              {cargando
                ? 'Cargando...'
                : `${dispositivos.length} ${dispositivos.length === 1 ? 'dispositivo registrado' : 'dispositivos registrados'}`}
            </p>
          </div>
          <button type="button" className="boton boton--primario" onClick={abrirRegistro}>
            + Agregar dispositivo
          </button>
        </div>

        {errorCarga && <div className="formulario__error">{errorCarga}</div>}

        {!cargando && !errorCarga && dispositivos.length === 0 && (
          <div className="dispositivos__vacio">
            <p>Aún no has registrado ningún dispositivo.</p>
            <p>Empieza agregando tu primer electrodoméstico para poder calcular su consumo.</p>
          </div>
        )}

        {items.length > 0 && (
          <TarjetaGrid
            items={items}
            renderAcciones={(item) => (
              <>
                <button
                  type="button"
                  className="boton boton--secundario boton--pequeno"
                  onClick={() => abrirEdicion(item.original)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="boton boton--peligro-suave boton--pequeno"
                  onClick={() => setDispositivoAEliminar(item.original)}
                >
                  Eliminar
                </button>
              </>
            )}
          />
        )}
      </main>

      {mostrarFormulario && (
        <FormularioDispositivo
          dispositivo={dispositivoEditando}
          onGuardar={guardarDispositivo}
          onCancelar={cerrarFormulario}
        />
      )}

      {dispositivoAEliminar && (
        <ConfirmarEliminar
          dispositivo={dispositivoAEliminar}
          onConfirmar={eliminarDispositivo}
          onCancelar={() => setDispositivoAEliminar(null)}
        />
      )}
    </div>
  );
}