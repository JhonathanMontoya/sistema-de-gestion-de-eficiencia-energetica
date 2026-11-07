import { useEffect, useState } from 'react';
import api from '../services/api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const NOMBRES_CATEGORIA = {
  aire_acondicionado: 'Aire acondicionado',
  nevera: 'Nevera',
  iluminacion: 'Iluminación',
  computador: 'Computador',
  televisor: 'Televisor',
  lavadora: 'Lavadora',
  otro: 'Otro equipo',
};

function resolverImagen(url) {
  return url?.startsWith('/uploads/') ? `${API_BASE}${url}` : url;
}

export default function RecomendacionesEnergeticasEnergest() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/recomendaciones')
      .then(({ data }) => setDatos(data))
      .catch((err) => setError(err.response?.data?.mensaje || 'No se pudieron cargar los consejos personalizados.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="eg-panel eg-recomendaciones" aria-labelledby="eg-recomendaciones-titulo">
      <div className="eg-panel__cabecera">
        <div><span className="eg-etiqueta">Según tus equipos registrados</span><h2 id="eg-recomendaciones-titulo">Recomendaciones para tu hogar</h2></div>
        {datos?.recomendaciones?.length > 0 && <span className="eg-contador">{datos.recomendaciones.length}</span>}
      </div>
      <p className="eg-ayuda">Priorizamos aparatos con mayor consumo diario estimado y mostramos consejos publicados para su categoría.</p>
      {cargando && <p role="status" className="eg-ayuda">Buscando consejos para tus equipos…</p>}
      {error && <p className="eg-alerta" role="alert">{error}</p>}
      {!cargando && !error && datos?.dispositivosRegistrados === 0 && <div className="eg-vacio"><strong>Aún no tienes equipos para analizar</strong><p>Registra aparatos y sus horas habituales de uso para recibir consejos relacionados.</p></div>}
      {!cargando && !error && datos?.dispositivosRegistrados > 0 && datos?.dispositivosAnalizados === 0 && <div className="eg-vacio"><strong>No hay estimaciones diarias para analizar</strong><p>Revisa las horas habituales de tus equipos. Para priorizarlos, EnerGest necesita una estimación diaria mayor que cero.</p></div>}
      {!cargando && !error && datos?.dispositivosAnalizados > 0 && !datos.recomendaciones.length && <div className="eg-vacio"><strong>Aún no hay consejos para las categorías de tus aparatos</strong><p>Un administrador puede publicarlos desde Administración → Contenido e imágenes, seleccionando la categoría del aparato en una publicación de tipo “Consejo”.</p></div>}
      {!cargando && !error && datos?.recomendaciones?.length > 0 && <div className="eg-recomendaciones__lista">
        {datos.recomendaciones.map((item) => <article className="eg-recomendacion" key={item.dispositivoId}>
          {item.consejo.imagenUrl && <img className="eg-recomendacion__imagen" src={resolverImagen(item.consejo.imagenUrl)} alt={item.consejo.imagenAlt || ''} />}
          <div className="eg-recomendacion__contenido">
            <div className="eg-recomendacion__meta"><span>{NOMBRES_CATEGORIA[item.categoria] || 'Equipo'}</span><span>{item.participacionPorcentual}% del total estimado</span></div>
            <h3>{item.dispositivo}</h3>
            <p className="eg-recomendacion__consumo">{item.consumoEstimadoKwhDia.toLocaleString('es-CO', { maximumFractionDigits: 3 })} kWh/día estimados</p>
            <h4>{item.consejo.titulo}</h4>
            {item.consejo.resumen && <p>{item.consejo.resumen}</p>}
            <p>{item.consejo.texto}</p>
            {item.consejo.fuenteUrl && <a className="eg-enlace" href={item.consejo.fuenteUrl} target="_blank" rel="noreferrer">Fuente: {item.consejo.fuente || 'Consultar referencia'} ↗</a>}
          </div>
        </article>)}
      </div>}
      {datos?.dispositivosSinConsejo?.length > 0 && !cargando && <p className="eg-recomendaciones__pendiente">Aún no hay consejo publicado para: {datos.dispositivosSinConsejo.map((item) => item.nombre).join(', ')}.</p>}
      {datos?.recomendaciones?.length > 0 && <small className="eg-recomendaciones__nota">{datos.nota}</small>}
    </section>
  );
}
