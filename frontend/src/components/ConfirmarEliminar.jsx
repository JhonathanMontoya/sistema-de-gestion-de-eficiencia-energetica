import { useState } from 'react';
import '../styles/Dashboard.css';
import '../styles/Dispositivos.css';

// Ventana de confirmacion antes de eliminar un dispositivo (HU-07).
//
// dispositivo: el dispositivo que se quiere eliminar.
// onConfirmar(): funcion async del padre que hace la peticion DELETE.
// onCancelar(): cierra la ventana sin eliminar.
export default function ConfirmarEliminar({ dispositivo, onConfirmar, onCancelar }) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState('');

  async function manejarConfirmar() {
    setError('');
    setEliminando(true);
    try {
      await onConfirmar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo eliminar el dispositivo');
      setEliminando(false);
    }
  }

  return (
    <div className="dashboard__modal-overlay" onClick={onCancelar}>
      <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
        <h2>Eliminar dispositivo</h2>
        <p className="dashboard__modal-descripcion">
          ¿Seguro que quieres eliminar <strong>{dispositivo.nombre}</strong>? Esta acción no se
          puede deshacer.
        </p>

        {error && <div className="formulario__error">{error}</div>}

        <div className="formulario__acciones">
          <button type="button" className="boton boton--secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton boton--peligro"
            onClick={manejarConfirmar}
            disabled={eliminando}
          >
            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}