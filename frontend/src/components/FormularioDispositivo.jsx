import { useState } from 'react';
import { CATEGORIAS, buscarCategoria } from '../data/categoriasDispositivo';
import '../styles/Dashboard.css';
import '../styles/Dispositivos.css';

// Formulario en ventana modal para registrar (HU-06) o editar (HU-07) un dispositivo.
//
// dispositivo: si viene, el formulario esta en modo edicion; si es null, en modo registro.
// onGuardar(datos): funcion async del padre que hace la peticion a la API.
// onCancelar(): cierra el formulario.
export default function FormularioDispositivo({ dispositivo, onGuardar, onCancelar }) {
  const editando = Boolean(dispositivo);

  const [nombre, setNombre] = useState(dispositivo?.nombre ?? '');
  const [categoria, setCategoria] = useState(dispositivo?.categoria ?? '');
  const [potencia, setPotencia] = useState(dispositivo ? String(dispositivo.potenciaWatts) : '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const categoriaActual = buscarCategoria(categoria);
  const sugerida = categoriaActual?.wattsTipicos ?? null;

  function manejarCambioCategoria(e) {
    const nuevaValor = e.target.value;
    const nueva = buscarCategoria(nuevaValor);

    // Autocompleta la potencia solo si el usuario no la ha escrito a mano
    // (campo vacio o todavia con la sugerencia de la categoria anterior).
    const sinTocar = potencia === '' || Number(potencia) === categoriaActual?.wattsTipicos;
    if (sinTocar && nueva?.wattsTipicos) {
      setPotencia(String(nueva.wattsTipicos));
    }

    setCategoria(nuevaValor);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    const watts = Number(potencia);

    if (!nombre.trim()) {
      setError('Escribe un nombre para el dispositivo');
      return;
    }
    if (!categoria) {
      setError('Selecciona una categoría');
      return;
    }
    if (potencia === '' || !Number.isFinite(watts) || watts <= 0) {
      setError('La potencia debe ser un número mayor a 0');
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({ nombre: nombre.trim(), categoria, potenciaWatts: watts });
      // Si todo sale bien, el padre cierra el formulario.
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar el dispositivo');
      setGuardando(false);
    }
  }

  return (
    <div className="dashboard__modal-overlay" onClick={onCancelar}>
      <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="dashboard__modal-cerrar" onClick={onCancelar}>
          ✕
        </button>
        <h2>{editando ? 'Editar dispositivo' : 'Registrar dispositivo'}</h2>

        <form className="formulario" onSubmit={manejarSubmit} noValidate>
          <label className="formulario__label" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            className="formulario__input"
            type="text"
            placeholder="Ej: Aire de la sala"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={60}
          />

          <label className="formulario__label" htmlFor="categoria">
            Categoría
          </label>
          <select
            id="categoria"
            className="formulario__input"
            value={categoria}
            onChange={manejarCambioCategoria}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat.valor} value={cat.valor}>
                {cat.etiqueta}
              </option>
            ))}
          </select>

          <label className="formulario__label" htmlFor="potencia">
            Potencia (W)
          </label>
          <input
            id="potencia"
            className="formulario__input"
            type="number"
            min="1"
            placeholder="Ej: 1200"
            value={potencia}
            onChange={(e) => setPotencia(e.target.value)}
          />

          <p className="formulario__ayuda">
            {sugerida ? (
              <>
                Potencia típica para {categoriaActual.etiqueta.toLowerCase()}: ~{sugerida} W.{' '}
                {Number(potencia) !== sugerida && (
                  <button
                    type="button"
                    className="formulario__enlace"
                    onClick={() => setPotencia(String(sugerida))}
                  >
                    Usar {sugerida} W
                  </button>
                )}
                <br />
              </>
            ) : null}
            💡 Para el valor exacto, busca los watts en la etiqueta del aparato (atrás o abajo) o en su manual.
          </p>

          {error && <div className="formulario__error">{error}</div>}

          <div className="formulario__acciones">
            <button type="button" className="boton boton--secundario" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="boton boton--primario" disabled={guardando}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}