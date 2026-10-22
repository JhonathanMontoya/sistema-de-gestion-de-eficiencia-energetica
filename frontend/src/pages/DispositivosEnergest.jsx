import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarcoEnergest from '../components/MarcoEnergest';
import TarjetaGrid from '../components/TarjetaGrid';
import FichaDispositivo from '../components/FichaDispositivo';
import { CATEGORIAS, buscarCategoria } from '../data/categoriasDispositivo';
import { calcularKwh, formatearKwh } from '../utils/consumo';

const FORMULARIO_VACIO = { nombre: '', categoria: '', potenciaWatts: '', horasUsoDiarias: '', ubicacion: '' };

function MensajeError({ children }) {
  return children ? <p className="eg-alerta" role="alert">{children}</p> : null;
}

export default function DispositivosEnergest() {
  const { usuario } = useAuth();
  const puedeEditar = usuario?.rol !== 'analista';
  const [dispositivos, setDispositivos] = useState([]);
  const [resumenSemanal, setResumenSemanal] = useState({ porDispositivo: [] });
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editando, setEditando] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const [respuestaDispositivos, respuestaSemana] = await Promise.all([
        api.get('/dispositivos'),
        api.get('/lecturas/resumen-semanal'),
      ]);
      setDispositivos(respuestaDispositivos.data.dispositivos || []);
      setResumenSemanal(respuestaSemana.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron cargar tus dispositivos. Intenta actualizar la página.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function seleccionarCategoria(valor) {
    const anterior = buscarCategoria(formulario.categoria);
    const sugerenciaAnterior = anterior?.wattsTipicos;
    const siguiente = buscarCategoria(valor);
    cambiar('categoria', valor);
    if (siguiente?.wattsTipicos && (!formulario.potenciaWatts || Number(formulario.potenciaWatts) === sugerenciaAnterior)) {
      cambiar('potenciaWatts', String(siguiente.wattsTipicos));
    }
  }

  function iniciarEdicion(dispositivo) {
    setEditando(dispositivo._id);
    setFormulario({
      nombre: dispositivo.nombre,
      categoria: dispositivo.categoria || 'otro',
      potenciaWatts: dispositivo.potenciaWatts ? String(dispositivo.potenciaWatts) : '',
      horasUsoDiarias: String(dispositivo.horasUsoDiarias ?? ''),
      ubicacion: dispositivo.ubicacion || '',
    });
    setMensaje('');
  }

  function limpiarFormulario() {
    setEditando('');
    setFormulario(FORMULARIO_VACIO);
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    const categoria = buscarCategoria(formulario.categoria);
    const potenciaWatts = Number(formulario.potenciaWatts);
    const horasUsoDiarias = Number(formulario.horasUsoDiarias);
    const datos = {
      ...formulario,
      tipo: categoria?.etiqueta || 'Otro',
      potenciaWatts,
      horasUsoDiarias,
      consumoEstimadoKwhDia: calcularKwh(potenciaWatts, horasUsoDiarias),
    };
    try {
      if (editando) await api.put('/dispositivos/' + editando, datos);
      else await api.post('/dispositivos', datos);
      setMensaje(editando ? 'Cambios guardados.' : 'Dispositivo agregado.');
      limpiarFormulario();
      await cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Revisa los datos e inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(dispositivo) {
    if (!window.confirm('¿Quitar este dispositivo? Sus lecturas anteriores se conservarán.')) return;
    setError('');
    try {
      await api.delete('/dispositivos/' + dispositivo._id);
      setMensaje('Dispositivo archivado; su historial se conserva.');
      if (seleccionado?._id === dispositivo._id) setSeleccionado(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo archivar el dispositivo.');
    }
  }

  const items = useMemo(() => dispositivos.map((dispositivo) => {
    const categoria = buscarCategoria(dispositivo.categoria);
    return {
      id: dispositivo._id,
      titulo: dispositivo.nombre,
      descripcion: [categoria?.etiqueta || dispositivo.tipo || 'Otro', dispositivo.potenciaWatts + ' W', dispositivo.ubicacion].filter(Boolean).join(' · '),
      meta: Number(dispositivo.horasUsoDiarias) > 0
        ? 'Estimado: ' + formatearKwh(Number(dispositivo.consumoEstimadoKwhDia) || 0) + ' al día'
        : 'Sin horas habituales; registra los usos para ver el consumo',
      original: dispositivo,
    };
  }), [dispositivos]);

  const ejemplo = buscarCategoria('iluminacion');

  return (
    <MarcoEnergest titulo="Dispositivos" descripcion="Registra equipos comunes y usa su potencia para estimar el consumo. Los datos se guardan en tu cuenta.">
      {mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
      <MensajeError>{error}</MensajeError>
      <div className="eg-dispositivos-layout">
        <section className="eg-panel">
          <div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Inventario personal</span><h2>Mis dispositivos</h2></div><span className="eg-contador">{dispositivos.length}</span></div>
          {cargando ? <div className="eg-cargando" role="status"><span />Cargando dispositivos…</div> : dispositivos.length ? (
            <TarjetaGrid items={items} renderAcciones={(item) => (
              <>
                <button type="button" className="eg-boton eg-boton--compacto" onClick={() => setSeleccionado(item.original)}>Ver ficha</button>
                {puedeEditar && <button type="button" className="eg-boton eg-boton--suave eg-boton--compacto" onClick={() => iniciarEdicion(item.original)}>Editar</button>}
                {puedeEditar && <button type="button" className="eg-accion-peligro" onClick={() => eliminar(item.original)}>Quitar</button>}
              </>
            )} />
          ) : <div className="eg-vacio"><span>⌂</span><strong>Aún no tienes dispositivos</strong><p>Usa el ejemplo del formulario para ver cómo se registra uno y cambiar luego sus datos por los de tu equipo.</p></div>}
        </section>

        {puedeEditar ? (
          <form className="eg-panel eg-formulario" onSubmit={guardar}>
            <span className="eg-etiqueta">{editando ? 'Actualizar equipo' : 'Nuevo equipo'}</span>
            <h2>{editando ? 'Editar dispositivo' : 'Agregar dispositivo'}</h2>
            <div className="eg-ejemplo">
              <strong>Ejemplo guiado: bombillo LED</strong>
              <p>Un bombillo de 10 W usado 5 horas consume aproximadamente 0,05 kWh ese día.</p>
              <button type="button" className="eg-enlace" onClick={() => {
                setEditando('');
                setFormulario({ nombre: 'Bombillo de sala', categoria: 'iluminacion', potenciaWatts: String(ejemplo.wattsTipicos), horasUsoDiarias: '5', ubicacion: 'Sala' });
              }}>Cargar este ejemplo en el formulario</button>
            </div>
            <label>Nombre<input required maxLength="80" value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} placeholder="Ej. Ventilador de habitación" /></label>
            <label>Categoría<select required value={formulario.categoria} onChange={(e) => seleccionarCategoria(e.target.value)}><option value="">Selecciona una categoría</option>{CATEGORIAS.map((categoria) => <option key={categoria.valor} value={categoria.valor}>{categoria.etiqueta}</option>)}</select></label>
            <p className="eg-ayuda">La potencia sugerida es una referencia. Revisa la etiqueta o placa de tu dispositivo y puedes cambiarla.</p>
            <label>Potencia (W)<input required type="number" min="1" max="100000" step="1" value={formulario.potenciaWatts} onChange={(e) => cambiar('potenciaWatts', e.target.value)} placeholder="Ej. 200" /></label>
            <label>Horas habituales al día <span className="eg-opcional">Opcional</span><input type="number" min="0" max="24" step="0.25" value={formulario.horasUsoDiarias} onChange={(e) => cambiar('horasUsoDiarias', e.target.value)} placeholder="Ej. 3" /></label>
            <p className="eg-ayuda">{Number(formulario.horasUsoDiarias) > 0 ? 'Consumo habitual estimado: ' + formatearKwh(calcularKwh(formulario.potenciaWatts, formulario.horasUsoDiarias)) + ' al día.' : 'Si no conoces tus horas habituales, déjalo vacío. Podrás registrar cada uso después desde la ficha del dispositivo.'}</p>
            <label>Ubicación <span className="eg-opcional">Opcional</span><input maxLength="100" value={formulario.ubicacion} onChange={(e) => cambiar('ubicacion', e.target.value)} placeholder="Ej. Cocina" /></label>
            <div className="eg-formulario__acciones"><button className="eg-boton" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar equipo'}</button>{editando && <button type="button" className="eg-boton eg-boton--suave" onClick={limpiarFormulario}>Cancelar</button>}</div>
          </form>
        ) : <aside className="eg-panel eg-panel--consejo"><span className="eg-etiqueta">Acceso de consulta</span><h2>Solo lectura</h2><p>Tu rol puede revisar el inventario. Un cliente de la cuenta puede crear o actualizar equipos.</p></aside>}
      </div>
      {seleccionado && <FichaDispositivo
        dispositivo={seleccionado}
        consumoSemanal={resumenSemanal.porDispositivo?.find((item) => String(item.dispositivoId) === seleccionado._id)?.consumoKwh || 0}
        puedeRegistrar={puedeEditar}
        onCerrar={() => setSeleccionado(null)}
        onLecturaGuardada={cargar}
      />}
    </MarcoEnergest>
  );
}
