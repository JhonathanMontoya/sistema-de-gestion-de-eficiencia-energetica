import { useEffect, useState } from 'react';
import api from '../services/api';

function hoyBogota() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function formularioVacio() {
  const hoy = hoyBogota();
  return { consumoKwh: '', periodoInicio: hoy, periodoFin: hoy, fuente: 'factura', valorFacturaCop: '', nota: '' };
}

function fechaVisible(fecha) { return typeof fecha === 'string' ? fecha.slice(0, 10) : ''; }

export default function LecturasHogarEnergest({ puedeRegistrar, onChanged }) {
  const [lecturas, setLecturas] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [editandoId, setEditandoId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const respuesta = await api.get('/lecturas-hogar');
      setLecturas(respuesta.data.lecturas || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron cargar las lecturas del hogar.');
    } finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  function editar(lectura) {
    setEditandoId(lectura._id);
    setFormulario({ consumoKwh: String(lectura.consumoKwh), periodoInicio: fechaVisible(lectura.periodoInicio), periodoFin: fechaVisible(lectura.periodoFin), fuente: lectura.fuente, valorFacturaCop: lectura.valorFacturaCop ?? '', nota: lectura.nota || '' });
    setError('');
    setMensaje('');
  }

  function cancelarEdicion() { setEditandoId(''); setFormulario(formularioVacio()); }

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true); setError(''); setMensaje('');
    const datos = { ...formulario, consumoKwh: Number(formulario.consumoKwh), valorFacturaCop: formulario.fuente === 'factura' && formulario.valorFacturaCop !== '' ? Number(formulario.valorFacturaCop) : null };
    try {
      if (editandoId) await api.put('/lecturas-hogar/' + editandoId, datos);
      else await api.post('/lecturas-hogar', datos);
      setMensaje(editandoId ? 'Lectura del hogar actualizada.' : 'Lectura del hogar guardada.');
      cancelarEdicion(); await cargar();
      onChanged?.();
    } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo guardar la lectura del hogar.'); }
    finally { setGuardando(false); }
  }

  async function eliminar(lectura) {
    if (!window.confirm('¿Eliminar esta lectura del hogar? Esta acción no se puede deshacer.')) return;
    setError(''); setMensaje('');
    try {
      await api.delete('/lecturas-hogar/' + lectura._id);
      setMensaje('Lectura del hogar eliminada.');
      if (editandoId === lectura._id) cancelarEdicion();
      await cargar();
      onChanged?.();
    } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo eliminar la lectura del hogar.'); }
  }

  return (
    <section className="eg-panel eg-historial eg-lecturas-hogar">
      <div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Consumo total</span><h2>Lecturas del hogar</h2></div><span className="eg-contador">{lecturas.length}</span></div>
      <p className="eg-ayuda">Registra el consumo total que aparece en una factura o que calculaste para el periodo. Se mantiene separado del consumo estimado por aparatos.</p>
      {mensaje && <p className="eg-exito" role="status">{mensaje}</p>}{error && <p className="eg-alerta" role="alert">{error}</p>}
      {puedeRegistrar && <form className="eg-formulario eg-lecturas-hogar__formulario" onSubmit={guardar}>
        <label>Consumo del periodo (kWh)<input required type="number" min="0" max="10000000" step="0.001" value={formulario.consumoKwh} onChange={(e) => setFormulario((actual) => ({ ...actual, consumoKwh: e.target.value }))} /></label>
        <label>Desde<input required type="date" max={hoyBogota()} value={formulario.periodoInicio} onChange={(e) => setFormulario((actual) => ({ ...actual, periodoInicio: e.target.value }))} /></label>
        <label>Hasta<input required type="date" max={hoyBogota()} min={formulario.periodoInicio} value={formulario.periodoFin} onChange={(e) => setFormulario((actual) => ({ ...actual, periodoFin: e.target.value }))} /></label>
        <label>Fuente<select required value={formulario.fuente} onChange={(e) => setFormulario((actual) => ({ ...actual, fuente: e.target.value, valorFacturaCop: e.target.value === 'factura' ? actual.valorFacturaCop : '' }))}><option value="factura">Factura</option><option value="medidor">Medidor</option><option value="otro">Otro</option></select></label>
        {formulario.fuente === 'factura' && <label>Valor de factura (COP) <span className="eg-opcional">Opcional</span><input type="number" min="0" step="1" value={formulario.valorFacturaCop} onChange={(e) => setFormulario((actual) => ({ ...actual, valorFacturaCop: e.target.value }))} /></label>}
        <label className="eg-lecturas-hogar__nota">Nota <span className="eg-opcional">Opcional</span><input maxLength="240" value={formulario.nota} onChange={(e) => setFormulario((actual) => ({ ...actual, nota: e.target.value }))} /></label>
        <div className="eg-formulario__acciones"><button type="submit" className="eg-boton" disabled={guardando}>{guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar lectura'}</button>{editandoId && <button type="button" className="eg-boton eg-boton--secundario" onClick={cancelarEdicion}>Cancelar</button>}</div>
      </form>}
      {cargando ? <div className="eg-cargando" role="status"><span />Cargando lecturas…</div> : lecturas.length ? <div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Periodo</th><th>Consumo</th><th>Fuente</th><th>Factura</th><th>Nota</th>{puedeRegistrar && <th>Acciones</th>}</tr></thead><tbody>{lecturas.map((lectura) => <tr key={lectura._id}><td>{fechaVisible(lectura.periodoInicio)} a {fechaVisible(lectura.periodoFin)}</td><td><strong>{Number(lectura.consumoKwh).toLocaleString('es-CO', { maximumFractionDigits: 3 })} kWh</strong></td><td>{({ factura: 'Factura', medidor: 'Medidor', otro: 'Otro' })[lectura.fuente]}</td><td>{lectura.valorFacturaCop === null || lectura.valorFacturaCop === undefined ? '—' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(lectura.valorFacturaCop)}</td><td>{lectura.nota || '—'}</td>{puedeRegistrar && <td><button type="button" className="eg-accion-peligro" onClick={() => editar(lectura)}>Editar</button> <button type="button" className="eg-accion-peligro" onClick={() => eliminar(lectura)}>Eliminar</button></td>}</tr>)}</tbody></table></div> : <div className="eg-vacio"><strong>Aún no tienes lecturas del hogar</strong><p>Agrega el consumo de tu primera factura o lectura de medidor.</p></div>}
    </section>
  );
}
