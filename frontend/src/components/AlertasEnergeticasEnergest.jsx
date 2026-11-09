import { useEffect, useState } from 'react';
import api from '../services/api';

function valorKwh(valor) { return Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 3 }); }

function origen(alerta) {
  return alerta.fuente === 'estimacion_dispositivo' ? 'Estimación según potencia y uso habitual' : 'Promedio de lectura manual del hogar';
}

export default function AlertasEnergeticasEnergest({ revision = 0 }) {
  const [resultado, setResultado] = useState({ alertas: [], limitesConfigurados: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      try {
        const respuesta = await api.get('/alertas');
        if (activo) { setResultado(respuesta.data); setError(''); }
      } catch (err) {
        if (activo) setError(err.response?.data?.mensaje || 'No se pudieron consultar los avisos de consumo.');
      } finally { if (activo) setCargando(false); }
    }
    cargar();
    return () => { activo = false; };
  }, [revision]);

  return (
    <section className="eg-panel eg-alertas-consumo" aria-labelledby="eg-alertas-titulo">
      <div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Seguimiento de límites</span><h2 id="eg-alertas-titulo">Avisos de consumo</h2></div><span className="eg-contador">{resultado.alertas.length}</span></div>
      {cargando && <div className="eg-cargando" role="status"><span />Revisando tus límites…</div>}
      {error && <p className="eg-alerta" role="alert">{error}</p>}
      {!cargando && !error && (resultado.alertas.length ? <ul className="eg-alertas-consumo__lista" aria-live="polite">{resultado.alertas.map((alerta) => <li className="eg-alertas-consumo__item" key={alerta.id}>
        <span className="eg-alertas-consumo__icono" aria-hidden="true">!</span>
        <div><h3>{alerta.titulo}</h3><p>{alerta.descripcion}</p><small>{origen(alerta)} · Periodo: {alerta.periodoReferencia.inicio} a {alerta.periodoReferencia.fin}</small></div>
        <strong>{valorKwh(alerta.consumoKwh)} / {valorKwh(alerta.limiteKwh)} {alerta.unidad}</strong>
      </li>)}</ul> : resultado.limitesConfigurados === 0 ? <div className="eg-vacio"><strong>Aún no configuraste límites</strong><p>Define límites diarios o mensuales abajo para recibir avisos cuando se superen.</p></div> : <p className="eg-alertas-consumo__sin-alertas" role="status">No hay límites superados con los datos disponibles.</p>)}
    </section>
  );
}
