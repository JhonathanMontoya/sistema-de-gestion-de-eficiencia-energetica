import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TarjetaGrid from '../components/TarjetaGrid';
import FormularioDispositivo from '../components/FormularioDispositivo';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import FichaDispositivo from '../components/FichaDispositivo';
import { buscarCategoria } from '../data/categoriasDispositivo';
import { calcularKwh, formatearKwh } from '../utils/consumo';
import '../styles/Dashboard.css';
import '../styles/Dispositivos.css';

// HU-06 (registrar), HU-07 (ver en tarjetas, editar y eliminar) y HU-09 (horas y kWh).
export default function Dispositivos() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [dispositivos, setDispositivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [intento, setIntento] = useState(0); // sirve para "Reintentar"

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [dispositivoEditando, setDispositivoEditando] = useState(null);
  const [dispositivoAEliminar, setDispositivoAEliminar] = useState(null);
  const [dispositivoDetalle, setDispositivoDetalle] = useState(null);
  const [aviso, setAviso] = useState('');

  // Carga los dispositivos del usuario desde GET /api/devices
  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);
      setErrorCarga('');
      try {
        const { data } = await api.get('/devices');
        if (activo) setDispositivos(data.dispositivos);
      } catch (err) {
        if (!activo) return;
        if (err.response?.status === 401) {
          // Token vencido o invalido: volvemos al login.
          cerrarSesion();
          navigate('/login');
          return;
        }
        setErrorCarga(
          err.response?.data?.mensaje ||
            'No pudimos cargar tus dispositivos. Revisa tu conexión e inténtalo de nuevo.'
        );
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [intento]);

  // El mensaje de confirmacion desaparece solo a los 4 segundos.
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(''), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  function manejarCierreSesion() {
    cerrarSesion();
    navigate('/login');
  }

  // ----- Registrar / editar (HU-06 y HU-07) -----
  function abrirRegistro() {
    setDispositivoEditando(null);
    setFormularioAbierto(true);
  }

  function abrirEdicion(dispositivo) {
    setDispositivoEditando(dispositivo);
    setFormularioAbierto(true);
  }

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setDispositivoEditando(null);
  }

  // Si la API falla, el error sube hasta el formulario, que lo muestra al usuario.
  async function guardarDispositivo(datos) {
    if (dispositivoEditando) {
      const { data } = await api.put(`/devices/${dispositivoEditando._id}`, datos);
      setDispositivos((lista) =>
        lista.map((d) => (d._id === data.dispositivo._id ? data.dispositivo : d))
      );
      setAviso('Cambios guardados correctamente');
    } else {
      const { data } = await api.post('/devices', datos);
      setDispositivos((lista) => [data.dispositivo, ...lista]);
      setAviso('Dispositivo registrado correctamente');
    }
    cerrarFormulario();
  }

  // ----- Eliminar (HU-07) -----
  async function eliminarDispositivo() {
    const id = dispositivoAEliminar._id;
    await api.delete(`/devices/${id}`);
    setDispositivos((lista) => lista.filter((d) => d._id !== id));
    setDispositivoAEliminar(null);
    setAviso('Dispositivo eliminado');
  }

  // ----- Horas de uso (HU-09) -----
  async function guardarHoras(horasUso) {
    const { data } = await api.patch(`/devices/${dispositivoDetalle._id}/horas`, { horasUso });
    setDispositivos((lista) =>
      lista.map((d) => (d._id === data.dispositivo._id ? data.dispositivo : d))
    );
    setDispositivoDetalle(data.dispositivo);
  }

  // ----- Datos para las tarjetas -----
  const items = dispositivos.map((d) => {
    const categoria = buscarCategoria(d.categoria);
    const kwh = calcularKwh(d.potenciaWatts, d.horasUso);

    return {
      id: d._id,
      titulo: d.nombre,
      descripcion: `${categoria?.etiqueta ?? d.categoria} · ${d.potenciaWatts} W`,
      meta: kwh !== null ? `Consumo: ${formatearKwh(kwh)}` : undefined,
      original: d,
    };
  });

  // Suma del consumo de los dispositivos que ya tienen horas registradas.
  const consumos = dispositivos
    .map((d) => calcularKwh(d.potenciaWatts, d.horasUso))
    .filter((kwh) => kwh !== null);
  const consumoTotal = consumos.reduce((suma, kwh) => suma + kwh, 0);

  let resumen = '';
  if (dispositivos.length > 0) {
    resumen = `${dispositivos.length} ${dispositivos.length === 1 ? 'dispositivo registrado' : 'dispositivos registrados'}`;
    if (consumos.length > 0) {
      resumen += ` · Consumo total: ${formatearKwh(Math.round(consumoTotal * 1000) / 1000)}`;
    }
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
        <Link to="/dashboard" className="dispositivos__volver">
          ← Volver al panel principal
        </Link>

        <div className="dispositivos__barra">
          <div>
            <h2 className="dispositivos__titulo">Mis dispositivos</h2>
            {resumen && <p className="dispositivos__contador">{resumen}</p>}
          </div>

          {dispositivos.length > 0 && (
            <button type="button" className="boton boton--primario" onClick={abrirRegistro}>
              + Registrar dispositivo
            </button>
          )}
        </div>

        {cargando && (
          <div className="dispositivos__vacio">
            <p>Cargando tus dispositivos...</p>
          </div>
        )}

        {!cargando && errorCarga && (
          <div className="dispositivos__vacio">
            <p>{errorCarga}</p>
            <button
              type="button"
              className="boton boton--secundario dispositivos__vacio-boton"
              onClick={() => setIntento((n) => n + 1)}
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !errorCarga && dispositivos.length === 0 && (
          <div className="dispositivos__vacio">
            <p>No tienes dispositivos registrados todavía.</p>
            <button
              type="button"
              className="boton boton--primario dispositivos__vacio-boton"
              onClick={abrirRegistro}
            >
              + Registrar dispositivo
            </button>
          </div>
        )}

        {!cargando && !errorCarga && dispositivos.length > 0 && (
          <div className="dispositivos__lista">
            <TarjetaGrid
              items={items}
              renderAcciones={(item) => (
                <>
                  <button
                    type="button"
                    className="boton boton--primario boton--pequeno dispositivos__accion-principal"
                    onClick={() => setDispositivoDetalle(item.original)}
                  >
                    Ver detalles
                  </button>
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
          </div>
        )}
      </main>

      {aviso && (
        <div className="dispositivos__aviso" role="status">
          {aviso}
        </div>
      )}

      {formularioAbierto && (
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

      {dispositivoDetalle && (
        <FichaDispositivo
          dispositivo={dispositivoDetalle}
          onGuardarHoras={guardarHoras}
          onCerrar={() => setDispositivoDetalle(null)}
        />
      )}
    </div>
  );
}