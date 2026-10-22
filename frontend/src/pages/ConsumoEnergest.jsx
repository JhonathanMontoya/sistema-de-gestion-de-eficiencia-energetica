import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarcoEnergest from '../components/MarcoEnergest';
import { calcularKwh, formatearKwh } from '../utils/consumo';
import DialogoConfirmacionEnergest from '../components/DialogoConfirmacionEnergest';

// Valor redondo de ejemplo; no representa una tarifa oficial ni una tarifa local.
const TARIFA_INICIAL_COP = '1000';
function fechaHoy() {
  const hoy = new Date();
  return hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
}
function pesos(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(valor) || 0);
}

export default function ConsumoEnergest() {
  const { usuario } = useAuth();
  const puedeRegistrar = usuario?.rol !== 'analista';
  const [dispositivos, setDispositivos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [semana, setSemana] = useState({ porDispositivo: [], consumoTotalKwh: 0 });
  const [lecturas, setLecturas] = useState([]);
  const [lecturasMes, setLecturasMes] = useState([]);
  const [formulario, setFormulario] = useState({ dispositivoId: '', horasUso: '', fecha: fechaHoy(), nota: '' });
  const [tarifa, setTarifa] = useState(() => localStorage.getItem('energia_tarifa_cop_kwh') || TARIFA_INICIAL_COP);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [dispositivosIncluidos, setDispositivosIncluidos] = useState(null);
  const [lecturaPendiente, setLecturaPendiente] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      try { await api.post('/dispositivos/inicializar-ejemplos'); } catch {}
      const [respuestaResumen, respuestaSemana, respuestaDispositivos] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/lecturas/resumen-semanal'),
        api.get('/dispositivos'),
      ]);
      const rango = respuestaSemana.data;
      const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0);
      const [respuestaLecturas, respuestaLecturasMes] = await Promise.all([api.get('/lecturas', { params: { desde: rango.desde } }), api.get('/lecturas', { params: { desde: inicioMes.toISOString() } })]);
      setResumen(respuestaResumen.data.resumen);
      setSemana(rango);
      setDispositivos(respuestaDispositivos.data.dispositivos || []);
      setLecturas(respuestaLecturas.data.lecturas || []);
      setLecturasMes(respuestaLecturasMes.data.lecturas || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron cargar los datos de consumo. Intenta actualizar la página.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const dispositivoSeleccionado = useMemo(
    () => dispositivos.find((dispositivo) => dispositivo._id === formulario.dispositivoId),
    [dispositivos, formulario.dispositivoId]
  );
  const estimadoUso = dispositivoSeleccionado
    ? calcularKwh(dispositivoSeleccionado.potenciaWatts, formulario.horasUso)
    : null;
  const idsIncluidos = dispositivosIncluidos === null ? dispositivos.map((item) => item._id) : dispositivosIncluidos;
  const porDispositivoSeleccionado = (semana.porDispositivo || []).filter((item) => idsIncluidos.includes(String(item.dispositivoId)));
  const consumoSemana = porDispositivoSeleccionado.reduce((total, item) => total + (Number(item.consumoKwh) || 0), 0);
  const hoyLocal = fechaHoy();
  const consumoHoySeleccionado = lecturas.filter((l) => idsIncluidos.includes(String(l.dispositivoId?._id)) && new Date(l.fecha).toLocaleDateString('en-CA') === hoyLocal).reduce((s,l)=>s+(Number(l.consumoKwh)||0),0);
  const consumoMesSeleccionado = lecturasMes.filter((l) => idsIncluidos.includes(String(l.dispositivoId?._id))).reduce((s,l)=>s+(Number(l.consumoKwh)||0),0);
  const proyeccionAnual = consumoSemana * (365 / 7);
  const potenciaTotal = dispositivos.filter((item) => idsIncluidos.includes(item._id)).reduce((total, dispositivo) => total + (Number(dispositivo.potenciaWatts) || 0), 0);
  const consumoUnaHora = potenciaTotal / 1000;
  const tarifaNumero = Number(tarifa);

  async function registrarUso(evento) {
    evento.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      await api.post('/lecturas', {
        dispositivoId: formulario.dispositivoId,
        horasUso: Number(formulario.horasUso),
        fecha: new Date(formulario.fecha + 'T12:00:00').toISOString(),
        nota: formulario.nota,
      });
      setFormulario((actual) => ({ ...actual, horasUso: '', nota: '' }));
      setMensaje('Uso guardado. Ya aparece en el historial y en el acumulado semanal.');
      await cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar el uso. Revisa los datos.');
    } finally {
      setGuardando(false);
    }
  }

  function alternarDispositivo(id) {
    const seleccionActual = dispositivosIncluidos === null ? dispositivos.map((item) => item._id) : dispositivosIncluidos;
    setDispositivosIncluidos(seleccionActual.includes(id) ? seleccionActual.filter((item) => item !== id) : [...seleccionActual, id]);
  }

  function actualizarTarifa(valor) {
    setTarifa(valor);
    localStorage.setItem('energia_tarifa_cop_kwh', valor);
  }

  return (
    <MarcoEnergest titulo="Consumo" descripcion="Consulta los usos que registraste y cómo se acumula su consumo en el tiempo.">
      {mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
      {error && <p className="eg-alerta" role="alert">{error}</p>}
      {cargando && <div className="eg-cargando" role="status"><span />Actualizando consumos…</div>}
      <section className="eg-metricas eg-metricas--consumo">
        <article className="eg-metrica eg-metrica--verde"><span>Consumo registrado hoy</span><strong>{consumoHoySeleccionado.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Suma de los usos guardados hoy</small></article>
        <article className="eg-metrica"><span>Últimos 7 días</span><strong>{consumoSemana.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Suma de tus registros fechados</small></article>
        <article className="eg-metrica eg-metrica--amarilla"><span>Consumo del mes</span><strong>{consumoMesSeleccionado.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Suma desde el inicio del mes</small></article>
        <article className="eg-metrica"><span>Proyección anual</span><strong>{proyeccionAnual.toLocaleString('es-CO', { maximumFractionDigits: 1 })} <small>kWh</small></strong><small>Estimación: promedio de estos 7 días × 365</small></article>
        <article className="eg-metrica"><span>Por una hora de uso</span><strong>{consumoUnaHora.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Si todos tus equipos operan 1 hora a su potencia registrada</small></article>
      </section>

      <div className="eg-columnas eg-columnas--consumo">
        {puedeRegistrar ? (
          <form className="eg-panel eg-formulario" onSubmit={registrarUso}>
            <span className="eg-etiqueta">Nuevo registro</span><h2>¿Cuánto usaste un equipo?</h2>
            <p className="eg-ayuda">Usamos la potencia guardada y las horas que indiques: (W × horas) / 1000.</p>
            <label>Dispositivo<select required value={formulario.dispositivoId} onChange={(e) => setFormulario((actual) => ({ ...actual, dispositivoId: e.target.value }))}><option value="">Selecciona un dispositivo</option>{dispositivos.map((dispositivo) => <option key={dispositivo._id} value={dispositivo._id}>{dispositivo.nombre} · {dispositivo.potenciaWatts} W</option>)}</select></label>
            <label>Horas de uso<input required type="number" min="0" max="24" step="0.25" value={formulario.horasUso} onChange={(e) => setFormulario((actual) => ({ ...actual, horasUso: e.target.value }))} placeholder="Ej. 2.5" /></label>
            <label>Fecha de uso<input required type="date" max={fechaHoy()} value={formulario.fecha} onChange={(e) => setFormulario((actual) => ({ ...actual, fecha: e.target.value }))} /></label>
            <label>Nota <span className="eg-opcional">Opcional</span><input maxLength="240" value={formulario.nota} onChange={(e) => setFormulario((actual) => ({ ...actual, nota: e.target.value }))} placeholder="Ej. uso por la tarde" /></label>
            <p className="eg-ayuda">Consumo estimado de este uso: {estimadoUso !== null ? formatearKwh(estimadoUso) : 'elige un dispositivo e indica las horas'}.</p>
            <button type="submit" className="eg-boton" disabled={guardando || !dispositivos.length || estimadoUso === null}>{guardando ? 'Guardando…' : 'Guardar consumo'}</button>
            {!dispositivos.length && <small>Primero registra un dispositivo en la pestaña Dispositivos.</small>}
          </form>
        ) : <aside className="eg-panel eg-panel--consejo"><span className="eg-etiqueta">Acceso de consulta</span><h2>Registro de consumo</h2><p>Tu rol puede consultar los consumos. Una cuenta cliente puede registrar nuevos usos.</p></aside>}

        <section className="eg-panel">
          <div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Acumulado por equipo</span><h2>Últimos siete días</h2></div></div>
          {porDispositivoSeleccionado.length ? <div className="eg-consumo-equipos">{porDispositivoSeleccionado.map((item) => <article className="eg-consumo-equipo" key={item.dispositivoId}><div><strong>{item.nombre}</strong><small>{item.cantidadLecturas} {item.cantidadLecturas === 1 ? 'registro' : 'registros'}</small></div><b>{formatearKwh(item.consumoKwh)}</b></article>)}<div className="eg-consumo-total"><span>Total semanal</span><strong>{formatearKwh(consumoSemana)}</strong></div></div> : <div className="eg-vacio"><span>◷</span><strong>Sin registros en los últimos siete días</strong><p>Guarda el primer uso de uno de tus dispositivos para empezar a acumular consumo.</p></div>}
        </section>
      </div>

      <section className="eg-panel eg-inclusion"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Elige qué sumar</span><h2>Equipos incluidos en los totales</h2></div></div><p className="eg-ayuda">Desactiva una tarjeta para excluir ese equipo del acumulado semanal, la proyección y el consumo por una hora.</p><div className="eg-inclusion__grid">{dispositivos.map((d) => <label className={'eg-inclusion__item ' + (idsIncluidos.includes(d._id) ? 'incluido' : '')} key={d._id}><input type="checkbox" checked={idsIncluidos.includes(d._id)} onChange={() => alternarDispositivo(d._id)} /><span><strong>{d.nombre}</strong><small>{d.potenciaWatts} W</small></span></label>)}</div></section>

      <section className="eg-panel eg-panel--tarifa">
        <div><span className="eg-etiqueta">Opcional y editable</span><h2>Consumo en relación con el costo</h2><p>Estimación basada en los consumos mostrados y la tarifa editable. No reemplaza el valor de la factura. Operación: consumo en kWh × tarifa en COP/kWh = costo estimado en COP. La tarifa se guarda en este navegador.</p></div>
        <label>Tarifa editable (COP/kWh)<input type="number" min="0" step="1" value={tarifa} onChange={(e) => actualizarTarifa(e.target.value)} /></label>
        <div className="eg-costos-estimados">
          <article><span>Hoy</span><strong>{pesos(consumoHoySeleccionado * tarifaNumero)}</strong><small>{consumoHoySeleccionado.toLocaleString('es-CO')} kWh × {pesos(tarifaNumero)}/kWh</small></article>
          <article><span>Últimos 7 días (equipos incluidos)</span><strong>{pesos(consumoSemana * tarifaNumero)}</strong><small>{consumoSemana.toLocaleString('es-CO')} kWh × {pesos(tarifaNumero)}/kWh</small></article>
          <article><span>Proyección anual</span><strong>{pesos(proyeccionAnual * tarifaNumero)}</strong><small>{proyeccionAnual.toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh × {pesos(tarifaNumero)}/kWh</small></article>
        </div>
      </section>

      <section className="eg-panel eg-historial">
        <div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Actividad reciente</span><h2>Registros de los últimos siete días</h2></div><span className="eg-contador">{lecturas.length}</span></div>
        {lecturas.length ? <div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Dispositivo</th><th>Fecha</th><th>Uso</th><th>Consumo</th><th>Nota</th>{puedeRegistrar && <th>Acción</th>}</tr></thead><tbody>{lecturas.map((lectura) => <tr key={lectura._id}><td>{lectura.dispositivoId?.nombre || 'Dispositivo archivado'}</td><td>{new Date(lectura.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{lectura.horasUso === null || lectura.horasUso === undefined ? 'Lectura manual' : Number(lectura.horasUso).toLocaleString('es-CO') + ' h'}</td><td><strong>{formatearKwh(lectura.consumoKwh)}</strong></td><td>{lectura.nota || '—'}</td>{puedeRegistrar && <td><button type="button" className="eg-accion-peligro" onClick={() => setLecturaPendiente(lectura)}>Eliminar</button></td>}</tr>)}</tbody></table></div> : <div className="eg-vacio"><strong>Aún no hay usos registrados</strong><p>Los registros nuevos aparecerán aquí con su fecha y consumo estimado.</p></div>}
      </section>
      <DialogoConfirmacionEnergest abierto={Boolean(lecturaPendiente)} titulo="Eliminar registro de consumo" mensaje={lecturaPendiente ? 'Se eliminará el registro de ' + (lecturaPendiente.dispositivoId?.nombre || 'este dispositivo') + '. Esta acción no se puede deshacer.' : ''} confirmar="Eliminar registro" peligro onCancelar={() => setLecturaPendiente(null)} onConfirmar={async () => { const item = lecturaPendiente; setLecturaPendiente(null); if (!item) return; try { await api.delete('/lecturas/' + item._id); setMensaje('Registro eliminado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo eliminar el registro.'); } }} />
    </MarcoEnergest>
  );
}
