import { useEffect, useState } from 'react';
import api from '../services/api';

function limitesVacios() { return { diarioKwh: '', mensualKwh: '' }; }

export default function PreferenciasEnergeticasEnergest({ dispositivos, puedeEditar, cargandoDispositivos, onTarifaChange, onSaved }) {
  const [tarifa, setTarifa] = useState('1000');
  const [hogar, setHogar] = useState(limitesVacios);
  const [limites, setLimites] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const respuesta = await api.get('/preferencias-energeticas');
        if (!activo) return;
        const preferencias = respuesta.data.preferencias;
        const valorTarifa = String(preferencias.tarifaCopKwh ?? 1000);
        setTarifa(valorTarifa);
        onTarifaChange(Number(valorTarifa));
        setHogar({ diarioKwh: preferencias.limiteHogar?.diarioKwh ?? '', mensualKwh: preferencias.limiteHogar?.mensualKwh ?? '' });
        setLimites(Object.fromEntries((preferencias.limitesDispositivos || []).map((limite) => [limite.dispositivoId, { diarioKwh: limite.diarioKwh ?? '', mensualKwh: limite.mensualKwh ?? '' }])));
      } catch (err) {
        if (activo) setError(err.response?.data?.mensaje || 'No se pudieron cargar tus preferencias energéticas.');
      } finally { if (activo) setCargando(false); }
    }
    cargar();
    return () => { activo = false; };
  }, [onTarifaChange]);

  function actualizarLimiteDispositivo(id, campo, valor) {
    setLimites((actuales) => ({ ...actuales, [id]: { ...limitesVacios(), ...actuales[id], [campo]: valor } }));
  }

  function numeroOpcional(valor) { return valor === '' ? null : Number(valor); }

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true); setError(''); setMensaje('');
    const datos = {
      tarifaCopKwh: Number(tarifa),
      limiteHogar: { diarioKwh: numeroOpcional(hogar.diarioKwh), mensualKwh: numeroOpcional(hogar.mensualKwh) },
      limitesDispositivos: dispositivos.map((dispositivo) => ({
        dispositivoId: dispositivo._id,
        diarioKwh: numeroOpcional(limites[dispositivo._id]?.diarioKwh ?? ''),
        mensualKwh: numeroOpcional(limites[dispositivo._id]?.mensualKwh ?? ''),
      })),
    };
    try {
      const respuesta = await api.put('/preferencias-energeticas', datos);
      const preferencias = respuesta.data.preferencias;
      const valorTarifa = Number(preferencias.tarifaCopKwh);
      setTarifa(String(valorTarifa));
      onTarifaChange(valorTarifa);
      setHogar({ diarioKwh: preferencias.limiteHogar?.diarioKwh ?? '', mensualKwh: preferencias.limiteHogar?.mensualKwh ?? '' });
      setLimites(Object.fromEntries((preferencias.limitesDispositivos || []).map((limite) => [limite.dispositivoId, { diarioKwh: limite.diarioKwh ?? '', mensualKwh: limite.mensualKwh ?? '' }])));
      setMensaje('Preferencias guardadas en tu cuenta.');
      onSaved?.();
    } catch (err) { setError(err.response?.data?.mensaje || 'No se pudieron guardar tus preferencias.'); }
    finally { setGuardando(false); }
  }

  return (
    <form className="eg-panel eg-preferencias" onSubmit={guardar}>
      <div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Configuración personal</span><h2>Tarifa y límites de consumo</h2></div></div>
      <p className="eg-ayuda">La tarifa y los límites se guardan en tu cuenta. Deja un límite vacío si todavía no quieres configurarlo. Los avisos se calculan al consultar Consumo y muestran si una estimación o lectura supera tus límites.</p>
      {mensaje && <p className="eg-exito" role="status">{mensaje}</p>}{error && <p className="eg-alerta" role="alert">{error}</p>}
      {cargando ? <div className="eg-cargando" role="status"><span />Cargando preferencias…</div> : <>
        <label className="eg-preferencias__tarifa">Tarifa editable (COP/kWh)<input type="number" min="0" max="1000000" step="1" required value={tarifa} disabled={!puedeEditar} onChange={(e) => setTarifa(e.target.value)} /></label>
        <h3>Límite del hogar</h3>
        <div className="eg-preferencias__limites">
          <label>Diario (kWh)<input type="number" min="0" max="10000000" step="0.001" value={hogar.diarioKwh} disabled={!puedeEditar} onChange={(e) => setHogar((actual) => ({ ...actual, diarioKwh: e.target.value }))} placeholder="Sin límite" /></label>
          <label>Mensual (kWh)<input type="number" min="0" max="10000000" step="0.001" value={hogar.mensualKwh} disabled={!puedeEditar} onChange={(e) => setHogar((actual) => ({ ...actual, mensualKwh: e.target.value }))} placeholder="Sin límite" /></label>
        </div>
        <h3>Límites por aparato</h3>
        {cargandoDispositivos ? <div className="eg-cargando" role="status"><span />Cargando dispositivos…</div> : dispositivos.length ? <div className="eg-tabla-wrap"><table className="eg-tabla eg-preferencias__tabla"><thead><tr><th>Aparato</th><th>Límite diario (kWh)</th><th>Límite mensual (kWh)</th></tr></thead><tbody>{dispositivos.map((dispositivo) => <tr key={dispositivo._id}><td>{dispositivo.nombre}</td><td><input aria-label={'Límite diario de ' + dispositivo.nombre + ' en kWh'} type="number" min="0" max="10000000" step="0.001" value={limites[dispositivo._id]?.diarioKwh ?? ''} disabled={!puedeEditar} placeholder="Sin límite" onChange={(e) => actualizarLimiteDispositivo(dispositivo._id, 'diarioKwh', e.target.value)} /></td><td><input aria-label={'Límite mensual de ' + dispositivo.nombre + ' en kWh'} type="number" min="0" max="10000000" step="0.001" value={limites[dispositivo._id]?.mensualKwh ?? ''} disabled={!puedeEditar} placeholder="Sin límite" onChange={(e) => actualizarLimiteDispositivo(dispositivo._id, 'mensualKwh', e.target.value)} /></td></tr>)}</tbody></table></div> : <div className="eg-vacio"><strong>Aún no hay dispositivos activos</strong><p>Al registrar aparatos podrás definir límites individuales.</p></div>}
        {puedeEditar && <button type="submit" className="eg-boton" disabled={guardando || cargandoDispositivos}>{guardando ? 'Guardando…' : 'Guardar preferencias'}</button>}
        {!puedeEditar && <p className="eg-ayuda">Tu rol puede consultar las preferencias, pero no modificarlas.</p>}
      </>}
    </form>
  );
}
