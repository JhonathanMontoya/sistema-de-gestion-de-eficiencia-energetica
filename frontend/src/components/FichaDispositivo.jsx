import { useState } from 'react';
import api from '../services/api';
import { buscarCategoria } from '../data/categoriasDispositivo';
import { calcularKwh, formatearKwh } from '../utils/consumo';

function fechaHoy() {
  const hoy = new Date();
  return hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
}

export default function FichaDispositivo({ dispositivo, consumoSemanal = 0, puedeRegistrar = true, onCerrar, onLecturaGuardada }) {
  const [horas, setHoras] = useState('');
  const [fecha, setFecha] = useState(fechaHoy());
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const potencia = Number(dispositivo.potenciaWatts) || 0;
  const consumoPorHora = calcularKwh(potencia, 1);
  const consumoDelUso = calcularKwh(potencia, horas);
  const categoria = buscarCategoria(dispositivo.categoria);
  const estaEnRango = categoria?.wattsMin !== null && categoria?.wattsMin !== undefined
    ? potencia >= categoria.wattsMin && potencia <= categoria.wattsMax
    : null;

  async function registrarUso(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await api.post('/lecturas', {
        dispositivoId: dispositivo._id,
        horasUso: Number(horas),
        fecha: new Date(fecha + 'T12:00:00').toISOString(),
        nota,
      });
      setHoras('');
      setNota('');
      setMensaje('Uso guardado en tu historial.');
      await onLecturaGuardada?.();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar el uso. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="eg-modal-fondo" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) onCerrar(); }}>
      <section className="eg-modal-ficha" role="dialog" aria-modal="true" aria-labelledby="ficha-titulo">
        <button className="eg-modal-ficha__cerrar" type="button" onClick={onCerrar} aria-label="Cerrar ficha">×</button>
        <span className="eg-etiqueta">Ficha del dispositivo</span>
        <h2 id="ficha-titulo">{dispositivo.nombre}</h2>
        <p className="eg-modal-ficha__subtitulo">{categoria?.etiqueta || dispositivo.tipo || 'Otro'}{dispositivo.ubicacion ? ' · ' + dispositivo.ubicacion : ''}</p>
        <div className="eg-ficha-metricas">
          <article><span>Potencia registrada</span><strong>{potencia.toLocaleString('es-CO')} W</strong></article>
          <article><span>Consumo por hora de uso</span><strong>{formatearKwh(consumoPorHora)}</strong></article>
          <article><span>Consumo últimos 7 días</span><strong>{formatearKwh(consumoSemanal)}</strong></article>
        </div>
        <div className={'eg-rango-estado ' + (estaEnRango === null ? 'eg-rango-estado--sin-dato' : estaEnRango ? 'eg-rango-estado--ok' : 'eg-rango-estado--alerta')}>
          <strong>{estaEnRango === null ? 'Sin rango de referencia' : estaEnRango ? 'Dentro del rango de referencia' : 'Fuera del rango de referencia'}</strong>
          <span>{categoria?.wattsMin !== null && categoria?.wattsMin !== undefined
            ? 'Referencia orientativa para ' + categoria.etiqueta.toLowerCase() + ': ' + categoria.wattsMin + '–' + categoria.wattsMax + ' W.'
            : 'Para esta categoría no hay un rango configurado.'}</span>
          <small>El rango es una guía general; consulta la placa de tu equipo, ya que el consumo varía por modelo y condiciones de uso.</small>
        </div>
        {puedeRegistrar && (
          <form className="eg-formulario eg-ficha-uso" onSubmit={registrarUso}>
            <div><span className="eg-etiqueta">Registrar un uso</span><h3>¿Cuántas horas lo utilizaste?</h3></div>
            <label>Horas de uso<input required type="number" min="0" max="24" step="0.25" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="Ej. 2.5" /></label>
            <label>Fecha<input required type="date" max={fechaHoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
            <label>Nota <span className="eg-opcional">Opcional</span><input maxLength="240" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej. uso en la mañana" /></label>
            <p className="eg-ayuda">Consumo estimado de este uso: {consumoDelUso !== null ? formatearKwh(consumoDelUso) : 'indica las horas para calcularlo'}. La fórmula usa la potencia registrada y las horas ingresadas.</p>
            {error && <p className="eg-alerta" role="alert">{error}</p>}
            {mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
            <button className="eg-boton" type="submit" disabled={guardando || consumoDelUso === null}>{guardando ? 'Guardando…' : 'Guardar uso'}</button>
          </form>
        )}
      </section>
    </div>
  );
}
