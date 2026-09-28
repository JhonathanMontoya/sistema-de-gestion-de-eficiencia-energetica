import { useState } from 'react';
import { buscarCategoria } from '../data/categoriasDispositivo';
import { calcularKwh, formatearKwh } from '../utils/consumo';
import '../styles/Dashboard.css';
import '../styles/Dispositivos.css';

const MAX_HORAS = 8760; // horas de un año completo

// Ficha detallada de un dispositivo (HU-09): permite ingresar las horas de uso
// y muestra al instante el consumo en kWh.
//
// dispositivo: el dispositivo seleccionado.
// onGuardarHoras(horas): funcion async del padre que hace la peticion PATCH.
// onCerrar(): cierra la ficha.
export default function FichaDispositivo({ dispositivo, onGuardarHoras, onCerrar }) {
  const [horas, setHoras] = useState(
    dispositivo.horasUso !== null && dispositivo.horasUso !== undefined
      ? String(dispositivo.horasUso)
      : ''
  );
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const categoria = buscarCategoria(dispositivo.categoria);
  const kwh = calcularKwh(dispositivo.potenciaWatts, horas);

  function manejarCambioHoras(e) {
    setHoras(e.target.value);
    setError('');
    setGuardado(false);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardado(false);

    const valor = Number(horas);

    if (horas === '') {
      setError('Escribe cuántas horas se usa el dispositivo');
      return;
    }
    if (!Number.isFinite(valor) || valor < 0) {
      setError('Las horas deben ser un número igual o mayor a 0');
      return;
    }
    if (valor > MAX_HORAS) {
      setError(`Las horas no pueden superar ${MAX_HORAS} (un año completo)`);
      return;
    }

    setGuardando(true);
    try {
      await onGuardarHoras(valor);
      setGuardado(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron guardar las horas de uso');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="dashboard__modal-overlay" onClick={onCerrar}>
      <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="dashboard__modal-cerrar" onClick={onCerrar}>
          ✕
        </button>

        <span className="dashboard__card-badge">Ficha del dispositivo</span>
        <h2>{dispositivo.nombre}</h2>

        <dl className="ficha__datos">
          <div>
            <dt>Categoría</dt>
            <dd>{categoria?.etiqueta ?? dispositivo.categoria}</dd>
          </div>
          <div>
            <dt>Potencia</dt>
            <dd>{dispositivo.potenciaWatts} W</dd>
          </div>
        </dl>

        <form className="formulario" onSubmit={manejarSubmit} noValidate>
          <label className="formulario__label" htmlFor="horas">
            Horas de uso en el periodo
          </label>
          <input
            id="horas"
            className="formulario__input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="Ej: 60"
            value={horas}
            onChange={manejarCambioHoras}
          />
          <p className="formulario__ayuda">
            Ejemplo: si lo usas 2 horas al día durante 30 días, escribe 60.
          </p>

          <div className="ficha__resultado" aria-live="polite">
            <span className="ficha__resultado-etiqueta">Consumo en el periodo</span>
            {kwh !== null ? (
              <>
                <strong className="ficha__resultado-valor">{formatearKwh(kwh)}</strong>
                <span className="ficha__resultado-detalle">
                  ({dispositivo.potenciaWatts} W × {horas} h) / 1000
                </span>
              </>
            ) : (
              <span className="ficha__resultado-vacio">
                Escribe las horas de uso para ver cuánto consume.
              </span>
            )}
          </div>

          {error && <div className="formulario__error">{error}</div>}
          {guardado && <div className="ficha__ok">Horas de uso guardadas correctamente</div>}

          <div className="formulario__acciones">
            <button type="button" className="boton boton--secundario" onClick={onCerrar}>
              Cerrar
            </button>
            <button type="submit" className="boton boton--primario" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar horas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}