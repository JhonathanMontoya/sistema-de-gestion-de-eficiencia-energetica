import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarcoEnergest from '../components/MarcoEnergest';
import { calcularKwh, formatearKwh } from '../utils/consumo';
import DialogoConfirmacionEnergest from '../components/DialogoConfirmacionEnergest';
import LecturasHogarEnergest from '../components/LecturasHogarEnergest';
import PreferenciasEnergeticasEnergest from '../components/PreferenciasEnergeticasEnergest';
import AlertasEnergeticasEnergest from '../components/AlertasEnergeticasEnergest';
import RecomendacionesEnergeticasEnergest from '../components/RecomendacionesEnergeticasEnergest';

// Valor redondo de ejemplo; no representa una tarifa oficial ni una tarifa local.
const TARIFA_INICIAL_COP = '1000';
function fechaHoy() {
  const hoy = new Date();
  return hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
}
function pesos(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(valor) || 0);
}
function fechaClaveBogota(fecha) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(fecha));
}

export default function ConsumoEnergest() {
  const { usuario } = useAuth();
  const puedeRegistrar = usuario?.rol !== 'analista';
  const [dispositivos, setDispositivos] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [formulario, setFormulario] = useState({ dispositivoId: '', horasUso: '', fecha: fechaHoy(), nota: '' });
  const [tarifa, setTarifa] = useState(TARIFA_INICIAL_COP);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [dispositivosIncluidos, setDispositivosIncluidos] = useState(null);
  const [lecturaPendiente, setLecturaPendiente] = useState(null);
  const [revisionAlertas, setRevisionAlertas] = useState(0);

  async function cargar() {
    setCargando(true);
    try {
      const desdeHistorial = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [respuestaDispositivos, respuestaLecturas] = await Promise.all([
        api.get('/dispositivos'),
        api.get('/lecturas', { params: { desde: desdeHistorial } }),
      ]);
      setDispositivos(respuestaDispositivos.data.dispositivos || []);
      setLecturas(respuestaLecturas.data.lecturas || []);
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
  function horasActualizadas(dispositivo) { return dispositivo._id === formulario.dispositivoId && formulario.horasUso !== '' ? Number(formulario.horasUso) : Number(dispositivo.horasUsoDiarias) || 0; }
  const dispositivosSeleccionados = dispositivos.filter((item) => idsIncluidos.includes(item._id));
  const consumoDiarioEstimado = dispositivosSeleccionados.reduce((total, dispositivo) => total + (calcularKwh(dispositivo.potenciaWatts, horasActualizadas(dispositivo)) || 0), 0);
  const consumoSemana = consumoDiarioEstimado * 7;
  const consumoMesSeleccionado = consumoDiarioEstimado * 30;
  const proyeccionAnual = consumoDiarioEstimado * 365;
  const potenciaTotal = dispositivosSeleccionados.reduce((total, dispositivo) => total + (Number(dispositivo.potenciaWatts) || 0), 0);
  const consumoUnaHora = potenciaTotal / 1000;
  const tarifaNumero = Number(tarifa);
  const consumoDiarioSemana = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, indice) => {
      const fecha = new Date();
      fecha.setHours(12, 0, 0, 0);
      fecha.setDate(fecha.getDate() - (6 - indice));
      return { clave: fechaClaveBogota(fecha), fecha, consumo: 0 };
    });
    const porFecha = new Map(dias.map((dia) => [dia.clave, dia]));
    for (const lectura of lecturas) {
      const dia = porFecha.get(fechaClaveBogota(lectura.fecha));
      if (dia) dia.consumo += Number(lectura.consumoKwh) || 0;
    }
    const maximo = Math.max(...dias.map((dia) => dia.consumo), 0);
    return dias.map((dia) => ({
      ...dia,
      alto: maximo ? Math.max((dia.consumo / maximo) * 100, dia.consumo ? 8 : 3) : 3,
      etiqueta: new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', weekday: 'short' }).format(dia.fecha).replace('.', ''),
    }));
  }, [lecturas]);

  async function registrarUso(evento) {
    evento.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    try {
      if (dispositivoSeleccionado) await api.put('/dispositivos/' + dispositivoSeleccionado._id, { horasUsoDiarias: Number(formulario.horasUso) });
      await api.post('/lecturas', {
        dispositivoId: formulario.dispositivoId,
        horasUso: Number(formulario.horasUso),
        fecha: new Date(formulario.fecha + 'T12:00:00').toISOString(),
        nota: formulario.nota,
      });
      setFormulario((actual) => ({ ...actual, horasUso: String(Number(formulario.horasUso)), nota: '' }));
      setMensaje('Uso guardado. Ya aparece en el historial y en el acumulado semanal.');
      setRevisionAlertas((actual) => actual + 1);
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

  return (
    <MarcoEnergest titulo="Consumo" descripcion="Consulta los usos que registraste y cómo se acumula su consumo en el tiempo.">
      {mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
      {error && <p className="eg-alerta" role="alert">{error}</p>}
      {cargando && <div className="eg-cargando" role="status"><span />Actualizando consumos…</div>}
      <nav className="eg-consumo-accesos" aria-label="Ir a una sección de consumo">
        <span>Explora:</span>
        <a href="#resumen-consumo">Resumen</a>
        <a href="#equipos-consumo">Por aparato</a>
        <a href="#lectura-hogar">Hogar</a>
        <a href="#preferencias-consumo">Ajustes</a>
        <a href="#historial-consumo">Historial</a>
      </nav>
      <section className="eg-bloque-consumo eg-bloque-consumo--resumen eg-ancla-consumo" id="resumen-consumo">
        <div className="eg-bloque-consumo__encabezado"><span className="eg-bloque-consumo__numero">01</span><div><span className="eg-etiqueta">Vista general</span><h2>Resumen de consumo estimado</h2><p>Una proyección basada en la potencia y las horas registradas para los aparatos incluidos.</p></div></div>
        <div className="eg-metricas eg-metricas--consumo" aria-label="Resumen de consumo estimado">
          <article className="eg-metrica eg-metrica--verde"><span>Consumo diario estimado</span><strong>{consumoDiarioEstimado.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Según watts y horas habituales de los dispositivos incluidos</small></article>
          <article className="eg-metrica"><span>7 días estimados</span><strong>{consumoSemana.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Proyección diaria × 7, según los dispositivos incluidos</small></article>
          <article className="eg-metrica eg-metrica--amarilla"><span>30 días estimados</span><strong>{consumoMesSeleccionado.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Proyección diaria × 30, según los dispositivos incluidos</small></article>
          <article className="eg-metrica"><span>Proyección anual</span><strong>{proyeccionAnual.toLocaleString('es-CO', { maximumFractionDigits: 1 })} <small>kWh</small></strong><small>Proyección diaria × 365</small></article>
          <article className="eg-metrica"><span>Por una hora de uso</span><strong>{consumoUnaHora.toLocaleString('es-CO', { maximumFractionDigits: 3 })} <small>kWh</small></strong><small>Si los dispositivos incluidos operan 1 hora a su potencia registrada</small></article>
        </div>
        <figure className="eg-consumo-grafico" aria-labelledby="eg-grafico-consumo-titulo">
          <figcaption className="eg-consumo-grafico__cabecera"><div><span className="eg-etiqueta">Tendencia</span><h3 id="eg-grafico-consumo-titulo">Consumo registrado por día</h3><p>Registros por aparato de los últimos siete días · hora de Colombia</p></div><span className="eg-consumo-grafico__unidad">kWh</span></figcaption>
          {lecturas.length ? <div className="eg-consumo-grafico__plot" role="img" aria-label={'Gráfico de consumo registrado: ' + consumoDiarioSemana.map((dia) => `${dia.etiqueta} ${dia.consumo.toLocaleString('es-CO', { maximumFractionDigits: 3 })} kWh`).join(', ')}>
            <div className="eg-consumo-grafico__rejilla"><span>{Math.max(...consumoDiarioSemana.map((dia) => dia.consumo)).toLocaleString('es-CO', { maximumFractionDigits: 2 })}</span><span>0</span></div>
            <div className="eg-consumo-grafico__barras">{consumoDiarioSemana.map((dia) => <div className="eg-consumo-grafico__dia" key={dia.clave} title={`${dia.etiqueta}: ${dia.consumo.toLocaleString('es-CO', { maximumFractionDigits: 3 })} kWh`}><div className="eg-consumo-grafico__columna"><span style={{ height: dia.alto + '%' }} /></div><small>{dia.etiqueta}</small></div>)}</div>
          </div> : <div className="eg-consumo-grafico__vacio"><span aria-hidden="true">⌁</span><p>Cuando registres usos, aquí verás cómo cambia el consumo durante la semana.</p></div>}
        </figure>
        <div className="eg-seguimiento-consumo" id="avisos-consumo"><AlertasEnergeticasEnergest revision={revisionAlertas} /><RecomendacionesEnergeticasEnergest /></div>
      </section>

      <section className="eg-bloque-consumo eg-bloque-consumo--equipos eg-ancla-consumo" id="equipos-consumo">
        <div className="eg-bloque-consumo__encabezado"><span className="eg-bloque-consumo__numero">02</span><div><span className="eg-etiqueta">Consumo por aparato</span><h2>Registra y ajusta tus equipos</h2><p>Actualiza un uso y elige qué aparatos participan en los cálculos del resumen.</p></div></div>
        <div className="eg-columnas eg-columnas--consumo">
        {puedeRegistrar ? (
          <form id="registrar-uso" className="eg-panel eg-formulario eg-ancla-consumo" onSubmit={registrarUso}>
            <span className="eg-etiqueta">Uso del dispositivo</span><h2>Actualiza horas y registra un uso</h2>
            <p className="eg-ayuda">Se cargan las horas habituales guardadas en Dispositivos. Puedes modificarlas aquí; al guardar, se actualizan en el dispositivo y se registra ese uso con la fecha y nota. La fecha organiza el historial; no cambia el estimado general. Fórmula: (W × horas) / 1000.</p>
            <label>Dispositivo<select required value={formulario.dispositivoId} onChange={(e) => { const id=e.target.value; const d=dispositivos.find((item)=>item._id===id); setFormulario((actual) => ({ ...actual, dispositivoId: id, horasUso: d ? String(d.horasUsoDiarias ?? '') : '' })); }}><option value="">Selecciona un dispositivo</option>{dispositivos.map((dispositivo) => <option key={dispositivo._id} value={dispositivo._id}>{dispositivo.nombre} · {dispositivo.potenciaWatts} W</option>)}</select></label>
            <label>Horas habituales al día<input required type="number" min="0" max="24" step="0.25" value={formulario.horasUso} onChange={(e) => setFormulario((actual) => ({ ...actual, horasUso: e.target.value }))} placeholder="Ej. 2.5" /></label>
            <label>Fecha de uso<input required type="date" max={fechaHoy()} value={formulario.fecha} onChange={(e) => setFormulario((actual) => ({ ...actual, fecha: e.target.value }))} /></label>
            <label>Nota <span className="eg-opcional">Opcional</span><input maxLength="240" value={formulario.nota} onChange={(e) => setFormulario((actual) => ({ ...actual, nota: e.target.value }))} placeholder="Ej. uso por la tarde" /></label>
            <p className="eg-ayuda">Consumo estimado de este uso: {estimadoUso !== null ? formatearKwh(estimadoUso) : 'elige un dispositivo e indica las horas'}.</p>
            <button type="submit" className="eg-boton" disabled={guardando || !dispositivos.length || estimadoUso === null}>{guardando ? 'Guardando…' : 'Guardar consumo'}</button>
            {!dispositivos.length && <small>Primero registra un dispositivo en la pestaña Dispositivos.</small>}
          </form>
        ) : <aside className="eg-panel eg-panel--consejo"><span className="eg-etiqueta">Acceso de consulta</span><h2>Registro de consumo</h2><p>Tu rol puede consultar los consumos. Una cuenta cliente puede registrar nuevos usos.</p></aside>}

        <section id="ajustar-dispositivos" className="eg-panel eg-inclusion eg-inclusion--fichas eg-ancla-consumo">
          <div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Equipos para el cálculo</span><h2>Selecciona los dispositivos</h2></div><span className="eg-contador">{idsIncluidos.length}/{dispositivos.length}</span></div>
          <p className="eg-ayuda">Selecciona las fichas que quieras incluir. La selección actualiza los totales de consumo y su estimación de costo.</p>
          {dispositivos.length ? <div className="eg-tarjeta-grid">{dispositivos.map((d) => <label className={'eg-tarjeta eg-tarjeta--seleccionable ' + (idsIncluidos.includes(d._id) ? 'eg-tarjeta--incluida' : '')} key={d._id}>
            <input className="eg-tarjeta__selector" type="checkbox" checked={idsIncluidos.includes(d._id)} onChange={() => alternarDispositivo(d._id)} aria-label={'Incluir ' + d.nombre + ' en los cálculos'} />
            <span className="eg-tarjeta__icono eg-tarjeta__icono--animado" aria-hidden="true">{({ iluminacion: '💡', nevera: '🧊', aire_acondicionado: '❄️', computador: '💻', televisor: '📺', lavadora: '🫧' })[d.categoria] || '🔌'}</span>
            <div className="eg-tarjeta__contenido"><h3>{d.nombre}</h3><p>{d.potenciaWatts} W · {horasActualizadas(d)} h/día</p><strong className="eg-tarjeta__meta">Estimado diario: {formatearKwh(calcularKwh(d.potenciaWatts,horasActualizadas(d)) ?? 0)}</strong></div>
            <span className="eg-tarjeta__estado">{idsIncluidos.includes(d._id) ? 'Incluido' : 'Excluido'}</span>
          </label>)}</div> : <div className="eg-vacio"><strong>No hay dispositivos activos</strong><p>Agrega un dispositivo en la pestaña Dispositivos para empezar.</p></div>}
        </section>
      </div>
      </section>

      <section className="eg-bloque-consumo eg-bloque-consumo--hogar eg-ancla-consumo" id="lectura-hogar">
        <div className="eg-bloque-consumo__encabezado"><span className="eg-bloque-consumo__numero">03</span><div><span className="eg-etiqueta">Consumo total</span><h2>Lecturas del hogar</h2><p>Registra el total de la factura o del medidor y mantenlo separado de la estimación por aparato.</p></div></div>
        <LecturasHogarEnergest puedeRegistrar={puedeRegistrar} onChanged={() => setRevisionAlertas((actual) => actual + 1)} />
      </section>

      <section className="eg-bloque-consumo eg-bloque-consumo--ajustes eg-ancla-consumo" id="preferencias-consumo">
        <div className="eg-bloque-consumo__encabezado"><span className="eg-bloque-consumo__numero">04</span><div><span className="eg-etiqueta">Personaliza el seguimiento</span><h2>Costos y límites</h2><p>Ajusta la tarifa de referencia y define cuándo quieres recibir avisos dentro de la aplicación.</p></div></div>
        <section className="eg-panel eg-panel--tarifa" id="costo-consumo">
          <div><span className="eg-etiqueta">Estimación de costo</span><h2>Consumo en relación con el costo</h2><p>Usa la tarifa guardada para estimar el valor asociado al consumo habitual. No reemplaza el valor de la factura. Operación: kWh estimados × COP/kWh.</p></div>
          <label>Tarifa editable (COP/kWh)<input type="number" min="0" step="1" value={tarifa} readOnly aria-label="Tarifa guardada en tus preferencias" /></label>
          <div className="eg-costos-estimados">
            <article><span>Un día estimado</span><strong>{pesos(consumoDiarioEstimado * tarifaNumero)}</strong><small>{consumoDiarioEstimado.toLocaleString('es-CO')} kWh × {pesos(tarifaNumero)}/kWh</small></article>
            <article><span>7 días estimados</span><strong>{pesos(consumoSemana * tarifaNumero)}</strong><small>{consumoSemana.toLocaleString('es-CO')} kWh × {pesos(tarifaNumero)}/kWh</small></article>
            <article><span>Proyección anual</span><strong>{pesos(proyeccionAnual * tarifaNumero)}</strong><small>{proyeccionAnual.toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh × {pesos(tarifaNumero)}/kWh</small></article>
          </div>
        </section>
        <PreferenciasEnergeticasEnergest dispositivos={dispositivos} puedeEditar={puedeRegistrar} cargandoDispositivos={cargando} onTarifaChange={setTarifa} onSaved={() => setRevisionAlertas((actual) => actual + 1)} />
      </section>

      <section className="eg-bloque-consumo eg-bloque-consumo--historial eg-ancla-consumo" id="historial-consumo">
        <div className="eg-bloque-consumo__encabezado"><span className="eg-bloque-consumo__numero">05</span><div><span className="eg-etiqueta">Actividad registrada</span><h2>Historial reciente</h2><p>Usos guardados durante los últimos siete días. Cada registro conserva su fecha y aparato asociado.</p></div><span className="eg-contador">{lecturas.length}</span></div>
        <section className="eg-panel eg-historial">
          {lecturas.length ? <div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Dispositivo</th><th>Fecha</th><th>Uso</th><th>Consumo</th><th>Nota</th>{puedeRegistrar && <th>Acción</th>}</tr></thead><tbody>{lecturas.map((lectura) => <tr key={lectura._id}><td>{lectura.dispositivoId?.nombre || 'Dispositivo archivado'}</td><td>{new Date(lectura.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{lectura.horasUso === null || lectura.horasUso === undefined ? 'Lectura manual' : Number(lectura.horasUso).toLocaleString('es-CO') + ' h'}</td><td><strong>{formatearKwh(lectura.consumoKwh)}</strong></td><td>{lectura.nota || '—'}</td>{puedeRegistrar && <td><button type="button" className="eg-accion-peligro" onClick={() => setLecturaPendiente(lectura)}>Eliminar</button></td>}</tr>)}</tbody></table></div> : <div className="eg-vacio"><strong>Aún no hay usos registrados</strong><p>Los registros nuevos aparecerán aquí con su fecha y consumo estimado.</p></div>}
        </section>
      </section>
      <DialogoConfirmacionEnergest abierto={Boolean(lecturaPendiente)} titulo="Eliminar registro de consumo" mensaje={lecturaPendiente ? 'Se eliminará el registro de ' + (lecturaPendiente.dispositivoId?.nombre || 'este dispositivo') + '. Esta acción no se puede deshacer.' : ''} confirmar="Eliminar registro" peligro onCancelar={() => setLecturaPendiente(null)} onConfirmar={async () => { const item = lecturaPendiente; setLecturaPendiente(null); if (!item) return; try { await api.delete('/lecturas/' + item._id); setMensaje('Registro eliminado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo eliminar el registro.'); } }} />
    </MarcoEnergest>
  );
}
