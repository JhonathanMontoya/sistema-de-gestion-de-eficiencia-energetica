import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavegacionEnergest from '../components/NavegacionEnergest';
import MarcoEnergest from '../components/MarcoEnergest';
import DialogoConfirmacionEnergest from '../components/DialogoConfirmacionEnergest';
import '../styles/PortalEnergest.css';

function ErrorMensaje({ children }) {
  return children ? <p className="eg-alerta" role="alert">{children}</p> : null;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
function resolverImagenUrl(url) { return url?.startsWith('/uploads/') ? `${API_BASE}${url}` : url; }

const CONTENIDO_INICIAL = {
  pasos: [
    { slug: 'inicio-paso-dispositivos', etiqueta: '01', titulo: 'Registra tus equipos', resumen: 'Anota la potencia indicada en cada aparato y, si la conoces, sus horas habituales de uso.' },
    { slug: 'inicio-paso-uso', etiqueta: '02', titulo: 'Registra el uso', resumen: 'Guarda las horas de uso para estimar la energía asociada a cada dispositivo.' },
    { slug: 'inicio-paso-compara', etiqueta: '03', titulo: 'Revisa y compara', resumen: 'Consulta las estimaciones por aparato y compáralas con las lecturas del hogar.' },
  ],
  funcionalidades: [
    { slug: 'inicio-herramienta-equipos', etiqueta: 'Equipos', titulo: 'Inventario de dispositivos', resumen: 'Organiza tus aparatos por categoría, potencia y ubicación.' },
    { slug: 'inicio-herramienta-consumo', etiqueta: 'Consumo', titulo: 'Estimaciones e historial', resumen: 'Registra usos y consulta cómo se distribuye la estimación por periodo.' },
    { slug: 'inicio-herramienta-hogar', etiqueta: 'Hogar', titulo: 'Lecturas y límites', resumen: 'Agrega lecturas totales y define límites para recibir avisos dentro de la app.' },
  ],
  destacado: { slug: 'inicio-info-estimacion', categoria: 'informativo', titulo: 'Una estimación depende de tus datos', resumen: 'La energía estimada se calcula con la potencia del aparato y el tiempo de uso que registras.', texto: 'Como referencia, se multiplica la potencia en watts por las horas de uso y se divide entre 1.000 para obtener kilovatios hora. El resultado orienta la comparación; no sustituye la lectura del medidor ni la factura.' },
};

function Cargando() {
  return <div className="eg-cargando" role="status"><span />Cargando información…</div>;
}

function MarcoPrivado({ children, titulo, descripcion }) {
  return <MarcoEnergest titulo={titulo} descripcion={descripcion}>{children}</MarcoEnergest>;
}

export function InicioEnergest() {
  const { usuario } = useAuth();
  const esAdministrador = usuario?.rol === 'administrador';
  const [contenidos, setContenidos] = useState([]);
  const [error, setError] = useState('');
  const [cargandoContenido, setCargandoContenido] = useState(true);
  const [indice, setIndice] = useState(0);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [contenidoEditando, setContenidoEditando] = useState(null);
  const [formularioEdicion, setFormularioEdicion] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [mensajeEdicion, setMensajeEdicion] = useState('');

  async function cargarContenido() {
    setCargandoContenido(true);
    setError('');
    try {
      const { data } = await api.get('/contenido');
      setContenidos(data.contenidos || []);
    } catch {
      setError('No pudimos cargar las publicaciones. Puedes consultar la guía general y volver a intentarlo.');
    } finally {
      setCargandoContenido(false);
    }
  }

  useEffect(() => { cargarContenido(); }, []);

  const portada = contenidos.find((item) => item.categoria === 'portada');
  const destacados = contenidos.filter((item) => ['informativo', 'consejo', 'pregunta-frecuente'].includes(item.categoria));
  const cambiosEducativos = contenidos.filter((item) => item.categoria === 'cambio-eficiencia');
  const beneficiosEducativos = contenidos.filter((item) => item.categoria === 'beneficio-gestion');
  const pasosPublicados = contenidos.filter((item) => item.categoria === 'paso');
  const pasos = pasosPublicados.length ? pasosPublicados : CONTENIDO_INICIAL.pasos;
  const funcionalidadesPublicadas = contenidos.filter((item) => item.categoria === 'funcionalidad');
  const funcionalidades = funcionalidadesPublicadas.length ? funcionalidadesPublicadas : CONTENIDO_INICIAL.funcionalidades;
  const ejemplo = contenidos.find((item) => item.categoria === 'ejemplo');
  const secciones = Object.fromEntries(contenidos.filter((item) => item.categoria === 'seccion').map((item) => [item.slug, item]));
  const llamadaAccion = contenidos.find((item) => item.categoria === 'llamada-accion');
  const publicaciones = destacados.length ? destacados : [CONTENIDO_INICIAL.destacado];
  const actual = publicaciones[indice % publicaciones.length];

  useEffect(() => {
    if (publicaciones.length < 2) return undefined;
    const temporizador = window.setInterval(() => setIndice((valor) => (valor + 1) % publicaciones.length), 6500);
    return () => window.clearInterval(temporizador);
  }, [publicaciones.length]);

  useEffect(() => {
    if (!contenidoEditando) return undefined;
    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') setContenidoEditando(null);
    }
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [contenidoEditando]);

  function abrirEditor(contenido) {
    setContenidoEditando(contenido);
    setFormularioEdicion({
      etiqueta: contenido.etiqueta || '',
      titulo: contenido.titulo || '',
      resumen: contenido.resumen || '',
      texto: contenido.texto || '',
      imagenUrl: contenido.imagenUrl || '',
      imagenAlt: contenido.imagenAlt || '',
      textoBoton: contenido.textoBoton || '',
      fuente: contenido.fuente || '',
      fuenteUrl: contenido.fuenteUrl || '',
      orden: contenido.orden || 0,
      publicado: contenido.publicado,
    });
    setError('');
  }

  async function guardarEdicion(evento) {
    evento.preventDefault();
    setGuardandoEdicion(true);
    setError('');
    try {
      await api.put('/contenido/' + contenidoEditando._id, formularioEdicion);
      const { data } = await api.get('/contenido');
      setContenidos(data.contenidos || []);
      setContenidoEditando(null);
      setFormularioEdicion(null);
      setMensajeEdicion('Cambios guardados y visibles en la página.');
      window.setTimeout(() => setMensajeEdicion(''), 4500);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron guardar los cambios. Intenta de nuevo.');
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function subirImagenEnEditor(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo || !formularioEdicion) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) {
      setError('Elige una imagen JPG, PNG o WebP de máximo 5 MB.');
      evento.target.value = '';
      return;
    }
    setGuardandoEdicion(true);
    setError('');
    try {
      const { data } = await api.post('/contenido/imagenes', archivo, { headers: { 'Content-Type': archivo.type } });
      setFormularioEdicion((actualFormulario) => ({ ...actualFormulario, imagenUrl: data.imagenUrl }));
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo subir la imagen.');
    } finally {
      setGuardandoEdicion(false);
      evento.target.value = '';
    }
  }

  function botonEditar(contenido) {
    if (!esAdministrador || !modoEdicion || !contenido?._id) return null;
    return <button className="eg-edicion-inicio__boton" type="button" onClick={() => abrirEditor(contenido)}>Editar este contenido</button>;
  }

  return (
    <div className="eg-publico">
      <NavegacionEnergest />
      {esAdministrador && <div className="eg-edicion-inicio__barra" role="region" aria-label="Edición de la página de inicio">
        {modoEdicion ? <><span>Modo de edición: selecciona el bloque que quieres cambiar.</span><button type="button" onClick={() => setModoEdicion(false)}>Terminar edición</button></> : <><span>¿Quieres actualizar lo que ven tus visitantes?</span><button type="button" onClick={() => setModoEdicion(true)}>Editar contenido de inicio</button></>}
      </div>}
      {mensajeEdicion && <p className="eg-exito eg-edicion-inicio__mensaje" role="status">{mensajeEdicion}</p>}
      <main>
        <section className="eg-hero">
          <div className="eg-hero__texto">
            <span className="eg-etiqueta"><i />{portada?.etiqueta || 'Gestión energética para comprender tu consumo'}</span>
            <h1>{portada?.titulo || 'Conoce tu consumo. Elige qué mejorar.'}</h1>
            <p>{portada?.resumen || 'EnerGest te ayuda a registrar equipos, estimar su consumo a partir de la potencia y las horas de uso, y consultar cómo cambia con el tiempo.'}</p>
            {portada?.texto && <p className="eg-hero__detalle">{portada.texto}</p>}
            {botonEditar(portada)}
            <div className="eg-hero__acciones">
              <Link className="eg-boton" to="/register">{portada?.textoBoton || 'Crear una cuenta'} <span aria-hidden="true">→</span></Link>
              <a className="eg-enlace" href="#como-funciona">Conoce cómo funciona ↓</a>
            </div>
            <div className="eg-nota"><span className="eg-nota__punto">✓</span> La página de inicio es pública; tu consumo y tus dispositivos son privados.</div>
          </div>
          <div className="eg-ilustracion" aria-label="Ilustración de una planta eficiente" role="img">
            {portada?.imagenUrl ? <img className="eg-portada-imagen" src={resolverImagenUrl(portada.imagenUrl)} alt={portada.imagenAlt || ''} /> : <>
            <div className="eg-ilustracion__sol" />
            <svg className="eg-ilustracion__dibujo" viewBox="0 0 560 430" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M0 365C90 330 150 395 255 354C355 315 430 350 560 310V430H0V365Z" fill="#DDEFE3" />
              <rect x="91" y="190" width="285" height="174" rx="13" fill="#fff" />
              <path d="M80 196L233 104L389 196H80Z" fill="#176B51" />
              <rect x="220" y="251" width="60" height="113" rx="5" fill="#EAF4EC" />
              <rect x="121" y="223" width="59" height="51" rx="6" fill="#BCE7D3" />
              <rect x="288" y="223" width="59" height="51" rx="6" fill="#BCE7D3" />
              <path d="M136 249H164M303 249H331M151 223V274M318 223V274" stroke="#fff" strokeWidth="5" />
              <path d="M424 350V176M424 226C386 216 378 187 382 165C413 169 430 195 424 226ZM424 267C463 260 478 231 476 209C444 211 423 236 424 267Z" fill="#37A879" />
              <path d="M52 352V245M52 282C27 273 23 253 27 237C49 242 60 259 52 282ZM52 315C77 309 86 290 83 274C63 276 50 292 52 315Z" fill="#70BD8E" />
              <circle cx="449" cy="103" r="43" fill="#F8C95D" />
              <path d="M449 79V127M425 103H473M432 86L466 120M466 86L432 120" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
              <rect x="162" y="155" width="77" height="14" rx="7" fill="#E8B94F" />
            </svg>
            </>}
            </div>
        </section>

        <section className="eg-pasos" id="como-funciona">
          <div className="eg-seccion-titulo"><span className="eg-etiqueta">{secciones['home-pasos']?.etiqueta || 'Sencillo desde el primer día'}</span><h2>{secciones['home-pasos']?.titulo || 'Tu energía, en tres pasos'}</h2><p>{secciones['home-pasos']?.resumen || 'Empieza con la información que tienes y completa tus registros a medida que conozcas mejor tus equipos.'}</p>{botonEditar(secciones['home-pasos'])}</div>
          <div className="eg-pasos__grid">
            {pasos.map((item, i) => <article className="eg-paso" key={item.slug}>{item.imagenUrl && <img className="eg-editorial-imagen" src={resolverImagenUrl(item.imagenUrl)} alt={item.imagenAlt || ''} />}<span>{item.etiqueta || String(i + 1).padStart(2, '0')}</span><h3>{item.titulo}</h3><p>{item.resumen || item.texto}</p>{botonEditar(item)}</article>)}
          </div>
          {ejemplo && <div className="eg-ejemplo-publico">{ejemplo.imagenUrl && <img className="eg-editorial-imagen" src={resolverImagenUrl(ejemplo.imagenUrl)} alt={ejemplo.imagenAlt || ''} />}<div><span className="eg-etiqueta">{ejemplo.etiqueta || 'Ejemplo práctico'}</span><h3>{ejemplo.titulo}</h3><p>{ejemplo.resumen}</p></div><p>{ejemplo.texto}</p>{botonEditar(ejemplo)}</div>}
        </section>

        <section className="eg-funciones-publicas">
          <div className="eg-seccion-titulo"><span className="eg-etiqueta">{secciones['home-herramientas']?.etiqueta || 'Al crear tu cuenta'}</span><h2>{secciones['home-herramientas']?.titulo || 'Herramientas para entender tus equipos'}</h2><p>{secciones['home-herramientas']?.resumen || 'Registra aparatos, estima su consumo y guarda lecturas del hogar en un mismo espacio.'}</p>{botonEditar(secciones['home-herramientas'])}</div>
          <div className="eg-pasos__grid">
            {funcionalidades.map((item, i) => <article className="eg-paso" key={item.slug}>{item.imagenUrl && <img className="eg-editorial-imagen" src={resolverImagenUrl(item.imagenUrl)} alt={item.imagenAlt || ''} />}<span>{item.etiqueta || String(i + 1).padStart(2, '0')}</span><h3>{item.titulo}</h3><p>{item.resumen || item.texto}</p>{botonEditar(item)}</article>)}
          </div>
        </section>

        <section className="eg-aprende" id="aprende">
          <div className="eg-aprende__cabecera"><div><span className="eg-etiqueta">{secciones['home-aprende']?.etiqueta || 'Ideas para usar mejor la energía'}</span><h2>{secciones['home-aprende']?.titulo || 'Información que te puede servir'}</h2><p>{secciones['home-aprende']?.resumen || 'Entiende qué significan las estimaciones y cuáles son sus límites antes de tomar decisiones.'}</p>{botonEditar(secciones['home-aprende'])}</div>
            {publicaciones.length > 1 && <div className="eg-carrusel__controles"><button type="button" onClick={() => setIndice((actualIndice) => (actualIndice - 1 + publicaciones.length) % publicaciones.length)} aria-label="Anterior">←</button><button type="button" onClick={() => setIndice((actualIndice) => (actualIndice + 1) % publicaciones.length)} aria-label="Siguiente">→</button></div>}
          </div>
          {error && <div className="eg-contenido-error" role="alert"><ErrorMensaje>{error}</ErrorMensaje><button className="eg-boton eg-boton--suave eg-boton--compacto" type="button" onClick={cargarContenido} disabled={cargandoContenido}>{cargandoContenido ? 'Intentando…' : 'Reintentar carga'}</button></div>}
          {cargandoContenido && !contenidos.length && <p className="eg-ayuda" role="status">Cargando publicaciones… Mientras tanto, puedes consultar esta guía general.</p>}
          {actual ? <article className="eg-carrusel" key={actual.slug}>
            <div className="eg-carrusel__imagen" role={actual.imagenUrl ? 'img' : undefined} aria-label={actual.imagenUrl ? actual.imagenAlt || actual.titulo : undefined} style={actual.imagenUrl ? { backgroundImage: 'linear-gradient(0deg, #133d2aaa, transparent), url("' + resolverImagenUrl(actual.imagenUrl) + '")' } : undefined}><span aria-hidden="true">ENERGEST · {actual.categoria.replace('-', ' ')}</span></div>
            <div className="eg-carrusel__texto"><h3>{actual.titulo}</h3><p>{actual.resumen}</p><p>{actual.texto}</p>{actual.fuenteUrl && <a className="eg-enlace" href={actual.fuenteUrl} target="_blank" rel="noreferrer">Fuente: {actual.fuente || 'Consultar referencia'} ↗</a>}{botonEditar(actual)}{publicaciones.length > 1 && <div className="eg-carrusel__puntos">{publicaciones.map((item, i) => <button type="button" key={item.slug} className={i === indice ? 'activo' : ''} onClick={() => setIndice(i)} aria-label={'Ver contenido ' + (i + 1)} aria-pressed={i === indice} />)}</div>}</div>
          </article> : null}
        </section>

        {(cambiosEducativos.length > 0 || beneficiosEducativos.length > 0) && <section className="eg-aprende eg-aprende--gerson">
          {cambiosEducativos.length > 0 && <><div className="eg-seccion-titulo"><span className="eg-etiqueta">{secciones['home-eficiencia']?.etiqueta || 'Aprende sobre eficiencia energética'}</span><h2>{secciones['home-eficiencia']?.titulo || 'Qué está cambiando y por qué importa'}</h2><p>{secciones['home-eficiencia']?.resumen}</p>{botonEditar(secciones['home-eficiencia'])}</div>
          <div className="eg-info-grid">{cambiosEducativos.map((item) => <details className="eg-info-card" key={item.slug} open={modoEdicion}>{item.imagenUrl && <img className="eg-info-card__imagen" src={resolverImagenUrl(item.imagenUrl)} alt={item.imagenAlt || ''} />}<summary><strong>{item.titulo}</strong><span>{item.resumen}</span><small>Leer más</small></summary><p>{item.texto}</p>{item.fuenteUrl && <a className="eg-enlace" href={item.fuenteUrl} target="_blank" rel="noreferrer">Fuente: {item.fuente || 'Consultar referencia'} ↗</a>}{botonEditar(item)}</details>)}</div></>}
          {beneficiosEducativos.length > 0 && <><div className="eg-seccion-titulo eg-seccion-titulo--secundario"><span className="eg-etiqueta">{secciones['home-beneficios']?.etiqueta || 'Gestión energética'}</span><h2>{secciones['home-beneficios']?.titulo || 'Beneficios de gestionar mejor'}</h2><p>{secciones['home-beneficios']?.resumen}</p>{botonEditar(secciones['home-beneficios'])}</div>
          <div className="eg-info-grid">{beneficiosEducativos.map((item) => <details className="eg-info-card" key={item.slug} open={modoEdicion}>{item.imagenUrl && <img className="eg-info-card__imagen" src={resolverImagenUrl(item.imagenUrl)} alt={item.imagenAlt || ''} />}<summary><strong>{item.titulo}</strong><span>{item.resumen}</span><small>Leer más</small></summary><p>{item.texto}</p>{item.fuenteUrl && <a className="eg-enlace" href={item.fuenteUrl} target="_blank" rel="noreferrer">Fuente: {item.fuente || 'Consultar referencia'} ↗</a>}{botonEditar(item)}</details>)}</div></>}
        </section>}

        <section className="eg-cta"><div><span className="eg-etiqueta">{llamadaAccion?.etiqueta || 'Tu información, organizada'}</span><h2>{llamadaAccion?.titulo || 'Empieza con lo que tienes hoy.'}</h2><p>{llamadaAccion?.texto || 'Crea una cuenta para guardar tus dispositivos y construir un historial de consumo. El registro está disponible con los dominios autorizados por administración.'}</p>{botonEditar(llamadaAccion)}</div><Link className="eg-boton eg-boton--claro" to="/register">{llamadaAccion?.textoBoton || 'Crear mi cuenta'} <span aria-hidden="true">→</span></Link></section>
      </main>
      {contenidoEditando && formularioEdicion && <div className="eg-editor-inicio__fondo" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setContenidoEditando(null); }}>
        <form className="eg-editor-inicio" role="dialog" aria-modal="true" aria-labelledby="eg-editor-inicio-titulo" onSubmit={guardarEdicion}>
          <div className="eg-editor-inicio__cabecera"><div><span className="eg-etiqueta">Edición en la página</span><h2 id="eg-editor-inicio-titulo">{contenidoEditando.titulo || 'Editar contenido'}</h2><small>{contenidoEditando.categoria} · {contenidoEditando.slug}</small></div><button type="button" aria-label="Cerrar editor" onClick={() => setContenidoEditando(null)}>×</button></div>
          <ErrorMensaje>{error}</ErrorMensaje>
          <label>Etiqueta breve<input maxLength="100" value={formularioEdicion.etiqueta} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, etiqueta: e.target.value })} /></label>
          <label>Título<input autoFocus required maxLength="120" value={formularioEdicion.titulo} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, titulo: e.target.value })} /></label>
          <label>Resumen<input maxLength="240" value={formularioEdicion.resumen} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, resumen: e.target.value })} /></label>
          <label>Texto<textarea required rows="5" maxLength="4000" value={formularioEdicion.texto} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, texto: e.target.value })} /></label>
          {contenidoEditando.categoria === 'portada' || contenidoEditando.categoria === 'llamada-accion' ? <label>Texto del botón<input maxLength="60" value={formularioEdicion.textoBoton} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, textoBoton: e.target.value })} /></label> : null}
          <label>Subir imagen <span className="eg-opcional">JPG, PNG o WebP · máximo 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={subirImagenEnEditor} disabled={guardandoEdicion} /></label>
          <label>Dirección de imagen<input type="url" maxLength="500" value={formularioEdicion.imagenUrl.startsWith('/uploads/') ? '' : formularioEdicion.imagenUrl} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, imagenUrl: e.target.value })} placeholder="https://…" /></label>
          {formularioEdicion.imagenUrl && <div className="eg-admin-vista-imagen"><img src={resolverImagenUrl(formularioEdicion.imagenUrl)} alt="Vista previa de la imagen" /><button type="button" className="eg-texto-peligro" onClick={() => setFormularioEdicion({ ...formularioEdicion, imagenUrl: '' })}>Quitar imagen</button></div>}
          <label>Descripción de la imagen <span className="eg-opcional">Déjala vacía si es decorativa</span><input maxLength="180" value={formularioEdicion.imagenAlt} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, imagenAlt: e.target.value })} /></label>
          {['informativo', 'consejo', 'pregunta-frecuente', 'cambio-eficiencia', 'beneficio-gestion'].includes(contenidoEditando.categoria) && <><label>Nombre de la fuente<input maxLength="160" value={formularioEdicion.fuente} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, fuente: e.target.value })} /></label><label>Enlace de la fuente<input type="url" maxLength="500" value={formularioEdicion.fuenteUrl} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, fuenteUrl: e.target.value })} placeholder="https://…" /></label></>}
          <label className="eg-check"><input type="checkbox" checked={formularioEdicion.publicado} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, publicado: e.target.checked })} /> Mostrar en la página pública</label>
          <div className="eg-formulario__acciones"><button className="eg-boton" type="submit" disabled={guardandoEdicion}>{guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}</button><button className="eg-boton eg-boton--suave" type="button" onClick={() => setContenidoEditando(null)}>Cancelar</button></div>
        </form>
      </div>}
      <footer className="eg-footer"><Link className="eg-marca" to="/"><span className="eg-marca__icono">✳</span><span>Ener<strong>Gest</strong></span></Link><span>Gestión energética sencilla · Proyecto académico</span></footer>
    </div>
  );
}

const NUEVO_CONTENIDO = { slug: '', categoria: 'informativo', etiqueta: '', titulo: '', resumen: '', texto: '', imagenUrl: '', imagenAlt: '', textoBoton: '', categoriaDispositivo: '', fuente: '', fuenteUrl: '', orden: 0, publicado: false };

export function AdministracionEnergest() {
  const { usuario } = useAuth();
  const [contenidos, setContenidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formulario, setFormulario] = useState(NUEVO_CONTENIDO);
  const [editando, setEditando] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [pestana, setPestana] = useState('contenido');
  const [cargando, setCargando] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [guardandoDominios, setGuardandoDominios] = useState(false);
  const [dominiosTexto, setDominiosTexto] = useState('gmail.com, unac.edu.co');
  const [dominios, setDominios] = useState(['gmail.com', 'unac.edu.co']);
  const [confirmacion, setConfirmacion] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const [respuestaContenido, respuestaUsuarios, respuestaAcceso] = await Promise.all([
        api.get('/contenido/administrar'),
        api.get('/usuarios'),
        api.get('/configuracion/publica'),
      ]);
      setContenidos(respuestaContenido.data.contenidos || []);
      setUsuarios(respuestaUsuarios.data.usuarios || []);
      const permitidos = respuestaAcceso.data.dominios || ['gmail.com', 'unac.edu.co'];
      setDominios(permitidos);
      setDominiosTexto(permitidos.join(', '));
      setError('');
    } catch {
      setError('No se pudo cargar la administración. Comprueba que tu cuenta tenga rol administrador.');
    } finally {
      setCargando(false);
    }
  }

  async function cargarAuditoria() {
    try {
      const { data } = await api.get('/usuarios/auditoria');
      setAuditoria(data.eventos || []);
    } catch {
      setAuditoria([]);
    }
  }

  useEffect(() => { cargar(); }, []);
  useEffect(() => {
    if (pestana === 'usuarios') cargarAuditoria();
  }, [pestana]);

  if (usuario?.rol !== 'administrador') return <Navigate to="/consumo" replace />;

  function empezarEdicion(contenido) {
    setEditando(contenido._id);
    setFormulario({
      slug: contenido.slug,
      categoria: contenido.categoria,
      etiqueta: contenido.etiqueta || '',
      titulo: contenido.titulo,
      resumen: contenido.resumen || '',
      texto: contenido.texto,
      imagenUrl: contenido.imagenUrl || '',
      imagenAlt: contenido.imagenAlt || '',
      textoBoton: contenido.textoBoton || '',
      categoriaDispositivo: contenido.categoriaDispositivo || '',
      fuente: contenido.fuente || '',
      fuenteUrl: contenido.fuenteUrl || '',
      orden: contenido.orden || 0,
      publicado: contenido.publicado,
    });
  }

  function limpiar() {
    setEditando('');
    setFormulario(NUEVO_CONTENIDO);
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setMensaje('');
    try {
      if (editando) await api.put('/contenido/' + editando, formulario);
      else await api.post('/contenido', formulario);
      limpiar();
      setMensaje('Contenido guardado.');
      await cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo guardar. Revisa el identificador y los campos obligatorios.');
    }
  }

  async function subirImagen(evento) {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;

    setError('');
    setMensaje('');
    setSubiendoImagen(true);
    try {
      const respuesta = await api.post('/contenido/imagenes', archivo, {
        headers: { 'Content-Type': archivo.type },
      });
      setFormulario((actual) => ({ ...actual, imagenUrl: respuesta.data.imagenUrl }));
      setMensaje('Imagen subida al servidor. Guarda la publicación para mostrarla en Inicio.');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo subir la imagen. Usa JPG, PNG o WebP de máximo 5 MB.');
    } finally {
      setSubiendoImagen(false);
    }
  }

  function borrar(id) {
    setConfirmacion({
      titulo: 'Eliminar contenido',
      mensaje: 'La publicación dejará de estar disponible en Inicio. Esta acción no se puede deshacer.',
      confirmar: 'Eliminar',
      ejecutar: async () => {
        await api.delete('/contenido/' + id);
        setMensaje('Contenido eliminado.');
        await cargar();
      },
    });
  }

  async function ejecutarConfirmacion() {
    const accion = confirmacion;
    setConfirmacion(null);
    if (!accion) return;

    setError('');
    try {
      await accion.ejecutar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo completar la acción.');
    }
  }

  async function cambiarRol(id, rol) {
    setError('');
    setMensaje('');
    try {
      await api.patch('/usuarios/' + id + '/rol', { rol });
      setMensaje('Rol de cuenta actualizado.');
      await cargar();
      if (pestana === 'usuarios') await cargarAuditoria();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo cambiar el rol.');
    }
  }

  async function guardarUsuario(evento) {
    evento.preventDefault();
    if (!usuarioEditando) return;

    setError('');
    setMensaje('');
    try {
      await api.patch('/usuarios/' + usuarioEditando._id, {
        nombre: usuarioEditando.nombre,
        email: usuarioEditando.email,
      });
      setMensaje('Datos de la cuenta actualizados.');
      setUsuarioEditando(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron actualizar los datos de la cuenta.');
    }
  }

  function confirmarEliminacionUsuario(cuenta) {
    setConfirmacion({
      titulo: 'Eliminar cuenta permanentemente',
      mensaje: 'Se eliminarán la cuenta de ' + cuenta.nombre + ', sus dispositivos, lecturas y eventos de auditoría asociados. Esta acción no se puede deshacer.',
      confirmar: 'Eliminar cuenta',
      ejecutar: async () => {
        await api.delete('/usuarios/' + cuenta._id);
        setUsuarioEditando((actual) => (actual?._id === cuenta._id ? null : actual));
        setMensaje('La cuenta y sus datos personales fueron eliminados.');
        await cargar();
        await cargarAuditoria();
      },
    });
  }

  async function guardarDominios(evento) {
    evento.preventDefault();
    setError('');
    setMensaje('');
    setGuardandoDominios(true);
    const lista = dominiosTexto
      .split(/[\n,;]+/)
      .map((valor) => valor.trim().replace(/^@/, ''))
      .filter(Boolean);

    try {
      const respuesta = await api.put('/configuracion/dominios', { dominios: lista });
      setDominios(respuesta.data.dominios);
      setDominiosTexto(respuesta.data.dominios.join(', '));
      setMensaje('Los dominios de registro fueron actualizados.');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudieron guardar los dominios.');
    } finally {
      setGuardandoDominios(false);
    }
  }

  return (
    <MarcoPrivado
      titulo="Administración"
      descripcion="Gestiona el contenido público, las imágenes, los dominios de registro y los roles."
    >
      <ErrorMensaje>{error}</ErrorMensaje>
      {mensaje && <p className="eg-exito" role="status">{mensaje}</p>}

      <div className="eg-tabs" role="tablist" aria-label="Herramientas de administración">
        <button
          className={pestana === 'contenido' ? 'activo' : ''}
          onClick={() => setPestana('contenido')}
          role="tab"
          aria-selected={pestana === 'contenido'}
        >
          Contenido e imágenes
        </button>
        <button
          className={pestana === 'dominios' ? 'activo' : ''}
          onClick={() => setPestana('dominios')}
          role="tab"
          aria-selected={pestana === 'dominios'}
        >
          Dominios de registro
        </button>
        <button
          className={pestana === 'usuarios' ? 'activo' : ''}
          onClick={() => setPestana('usuarios')}
          role="tab"
          aria-selected={pestana === 'usuarios'}
        >
          Usuarios y roles
        </button>
      </div>

      {cargando ? <Cargando /> : pestana === 'contenido' ? (
        <div className="eg-admin-layout">
          <section className="eg-panel">
            <div className="eg-panel__cabecera">
              <div><span className="eg-etiqueta">Página pública</span><h2>Textos publicados</h2></div>
              <span className="eg-contador">{contenidos.length}</span>
            </div>
            {contenidos.length ? contenidos.map((contenido) => (
              <article className="eg-contenido-item" key={contenido._id}>
                <div>
                  <span className={'eg-estado ' + (contenido.publicado ? 'eg-estado--publicado' : '')}>
                    {contenido.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                  <h3>{contenido.titulo}</h3>
                  <p>{contenido.resumen || contenido.texto}</p>
                  <small>{contenido.categoria} · orden {contenido.orden}{contenido.imagenUrl ? ' · con imagen' : ''}</small>
                </div>
                <div className="eg-dispositivo__acciones">
                  <button type="button" onClick={() => empezarEdicion(contenido)}>Editar</button>
                  <button type="button" className="eg-texto-peligro" onClick={() => borrar(contenido._id)}>Eliminar</button>
                </div>
              </article>
            )) : (
              <div className="eg-vacio">
                <strong>No hay contenido todavía</strong>
                <p>Crea la primera sección informativa para la página pública.</p>
              </div>
            )}
          </section>

          <form className="eg-panel eg-formulario" onSubmit={guardar}>
            <span className="eg-etiqueta">{editando ? 'Editar publicación' : 'Nueva publicación'}</span>
            <h2>{editando ? 'Actualizar texto' : 'Crear contenido'}</h2>
            <p className="eg-ayuda">Estas publicaciones controlan los textos e imágenes visibles en la página de inicio. Guarda como borrador para ocultarlas mientras las editas.</p>
            <label>Identificador único<input required maxLength="100" value={formulario.slug} onChange={(e) => setFormulario({ ...formulario, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="ejemplo-de-contenido" /></label>
            <label>Sección<select value={formulario.categoria} onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value, categoriaDispositivo: '', textoBoton: '' })}><option value="portada">Portada principal</option><option value="seccion">Título de sección de inicio</option><option value="paso">Paso: cómo funciona</option><option value="funcionalidad">Herramienta de EnerGest</option><option value="ejemplo">Ejemplo práctico</option><option value="llamada-accion">Invitación a crear cuenta</option><option value="informativo">Información educativa</option><option value="consejo">Consejo de eficiencia</option><option value="pregunta-frecuente">Pregunta frecuente</option><option value="cambio-eficiencia">Eficiencia energética</option><option value="beneficio-gestion">Beneficio de gestionar el consumo</option></select></label>
            {formulario.categoria === 'seccion' && <label>Ubicación de la sección<select required value={formulario.slug} onChange={(e) => setFormulario({ ...formulario, slug: e.target.value })}><option value="">Selecciona dónde aparece</option><option value="home-pasos">Cómo funciona</option><option value="home-herramientas">Herramientas</option><option value="home-aprende">Información educativa</option><option value="home-eficiencia">Eficiencia energética</option><option value="home-beneficios">Beneficios</option></select></label>}
            <label>Etiqueta breve <span className="eg-opcional">Opcional · texto pequeño sobre el título</span><input maxLength="100" value={formulario.etiqueta} onChange={(e) => setFormulario({ ...formulario, etiqueta: e.target.value })} /></label>
            <label>Título<input required maxLength="120" value={formulario.titulo} onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })} /></label>
            <label>Resumen<input maxLength="240" value={formulario.resumen} onChange={(e) => setFormulario({ ...formulario, resumen: e.target.value })} /></label>
            <label>Texto<textarea required rows="5" maxLength="4000" value={formulario.texto} onChange={(e) => setFormulario({ ...formulario, texto: e.target.value })} /></label>
            {formulario.categoria === 'llamada-accion' && <label>Texto del botón<input maxLength="60" value={formulario.textoBoton} onChange={(e) => setFormulario({ ...formulario, textoBoton: e.target.value })} placeholder="Crear mi cuenta" /></label>}
            {formulario.categoria === 'consejo' && <label>Aplicable a<select value={formulario.categoriaDispositivo} onChange={(e) => setFormulario({ ...formulario, categoriaDispositivo: e.target.value })}><option value="">Todos los equipos</option><option value="aire_acondicionado">Aire acondicionado</option><option value="nevera">Nevera</option><option value="iluminacion">Iluminación</option><option value="computador">Computador</option><option value="televisor">Televisor</option><option value="lavadora">Lavadora</option><option value="otro">Otro equipo</option></select></label>}
            <label>Imagen para este espacio <span className="eg-opcional">Opcional · JPG, PNG o WebP · máximo 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={subirImagen} disabled={subiendoImagen} /></label>
            <label>O dirección de imagen <span className="eg-opcional">Opcional</span><input type="text" maxLength="500" value={formulario.imagenUrl} onChange={(e) => setFormulario({ ...formulario, imagenUrl: e.target.value })} placeholder="URL externa o ruta de imagen subida" /></label>
            {formulario.imagenUrl && (
              <div className="eg-admin-vista-imagen">
                <img src={resolverImagenUrl(formulario.imagenUrl)} alt="Vista previa de la imagen del contenido" />
                <button type="button" className="eg-texto-peligro" onClick={() => setFormulario({ ...formulario, imagenUrl: '' })}>Quitar imagen</button>
              </div>
            )}
            <label>Descripción de la imagen <span className="eg-opcional">Accesibilidad · describe la imagen; déjala vacía si es decorativa</span><input maxLength="180" value={formulario.imagenAlt} onChange={(e) => setFormulario({ ...formulario, imagenAlt: e.target.value })} /></label>
            <label>Nombre de la fuente <span className="eg-opcional">Opcional</span><input maxLength="160" value={formulario.fuente} onChange={(e) => setFormulario({ ...formulario, fuente: e.target.value })} placeholder="Ej. Ministerio de Minas y Energía" /></label>
            <label>Enlace de la fuente <span className="eg-opcional">Opcional</span><input type="url" maxLength="500" value={formulario.fuenteUrl} onChange={(e) => setFormulario({ ...formulario, fuenteUrl: e.target.value })} placeholder="https://…" /></label>
            <label>Orden<input type="number" min="0" value={formulario.orden} onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })} /></label>
            <label className="eg-check"><input type="checkbox" checked={formulario.publicado} onChange={(e) => setFormulario({ ...formulario, publicado: e.target.checked })} /> Mostrar en la página pública</label>
            <div className="eg-formulario__acciones">
              <button className="eg-boton" type="submit" disabled={subiendoImagen}>{subiendoImagen ? 'Subiendo imagen…' : 'Guardar'}</button>
              {editando && <button className="eg-boton eg-boton--suave" type="button" onClick={limpiar}>Cancelar</button>}
            </div>
          </form>
        </div>
      ) : pestana === 'dominios' ? (
        <section className="eg-panel eg-panel--dominios">
          <span className="eg-etiqueta">Control de acceso</span>
          <h2>Dominios autorizados para crear cuenta</h2>
          <p>Solo podrán registrarse correos cuyo dominio exacto esté en esta lista. El servidor aplica esta regla aunque alguien modifique el formulario del navegador.</p>
          <form onSubmit={guardarDominios}>
            <label>Dominios permitidos<textarea rows="5" value={dominiosTexto} onChange={(e) => setDominiosTexto(e.target.value)} placeholder="gmail.com, unac.edu.co" /></label>
            <div className="eg-dominios-actuales">{dominios.map((dominio) => <span key={dominio}>@{dominio}</span>)}</div>
            <button className="eg-boton" type="submit" disabled={guardandoDominios}>{guardandoDominios ? 'Guardando…' : 'Guardar dominios'}</button>
          </form>
        </section>
      ) : (
        <div className="eg-admin-usuarios">
          <section className="eg-panel">
            <div className="eg-panel__cabecera">
              <div><span className="eg-etiqueta">Acceso a EnerGest</span><h2>Cuentas y roles</h2></div>
              <span className="eg-contador">{usuarios.length}</span>
            </div>
            {usuarioEditando && (
              <form className="eg-formulario eg-edicion-admin" onSubmit={guardarUsuario}>
                <h3>Editar cuenta</h3>
                <label>Nombre<input required maxLength="100" value={usuarioEditando.nombre} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })} /></label>
                <label>Correo<input required type="email" maxLength="254" value={usuarioEditando.email} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })} /></label>
                <div className="eg-formulario__acciones">
                  <button className="eg-boton" type="submit">Guardar cambios</button>
                  <button className="eg-boton eg-boton--suave" type="button" onClick={() => setUsuarioEditando(null)}>Cancelar</button>
                </div>
              </form>
            )}
            <div className="eg-tabla-wrap">
              <table className="eg-tabla">
                <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
                <tbody>{usuarios.map((cuenta) => (
                  <tr key={cuenta._id}>
                    <td>{cuenta.nombre}</td>
                    <td>{cuenta.email}</td>
                    <td>
                      <select
                        aria-label={'Rol de ' + cuenta.nombre}
                        value={cuenta.rol}
                        disabled={cuenta._id === usuario.id}
                        onChange={(e) => cambiarRol(cuenta._id, e.target.value)}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="analista">Analista</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </td>
                    <td>
                      <div className="eg-dispositivo__acciones">
                        <button type="button" onClick={() => setUsuarioEditando({ _id: cuenta._id, nombre: cuenta.nombre, email: cuenta.email })}>Editar</button>
                        <button
                          type="button"
                          className="eg-texto-peligro"
                          disabled={cuenta._id === usuario.id}
                          onClick={() => confirmarEliminacionUsuario(cuenta)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className="eg-ayuda">El administrador gestiona roles de acceso; los consumos y dispositivos siguen siendo privados para cada cuenta.</p>
          </section>

          <section className="eg-panel">
            <div className="eg-panel__cabecera">
              <div><span className="eg-etiqueta">Trazabilidad</span><h2>Cambios de rol</h2></div>
            </div>
            {auditoria.length ? (
              <div className="eg-auditoria">
                {auditoria.map((evento) => (
                  <article key={evento._id}>
                    <strong>{evento.descripcion}</strong>
                    <small>{evento.actorId?.nombre || 'Administrador'} · {evento.usuarioAfectadoId?.email || (evento.accion === 'eliminar_usuario' ? 'Cuenta eliminada' : 'Cuenta')} · {new Date(evento.createdAt).toLocaleString('es-CO')}</small>
                  </article>
                ))}
              </div>
            ) : <p className="eg-ayuda">Los cambios de rol aparecerán aquí.</p>}
          </section>
        </div>
      )}

      <DialogoConfirmacionEnergest
        abierto={Boolean(confirmacion)}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        confirmar={confirmacion?.confirmar || 'Continuar'}
        peligro
        onCancelar={() => setConfirmacion(null)}
        onConfirmar={ejecutarConfirmacion}
      />
    </MarcoPrivado>
  );
}
