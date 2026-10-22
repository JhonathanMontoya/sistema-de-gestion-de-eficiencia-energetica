import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavegacionEnergest from '../components/NavegacionEnergest';
import MarcoEnergest from '../components/MarcoEnergest';
import DialogoConfirmacionEnergest from '../components/DialogoConfirmacionEnergest';
import { CAMBIOS_EFICIENCIA } from '../data/cambiosEficiencia';
import { BENEFICIOS_GESTION } from '../data/beneficiosGestion';
import '../styles/PortalEnergest.css';

function ErrorMensaje({ children }) {
  return children ? <p className="eg-alerta" role="alert">{children}</p> : null;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
function resolverImagenUrl(url) { return url?.startsWith('/uploads/') ? `${API_BASE}${url}` : url; }

function Cargando() {
  return <div className="eg-cargando" role="status"><span />Cargando información…</div>;
}

function MarcoPrivado({ children, titulo, descripcion }) {
  return <MarcoEnergest titulo={titulo} descripcion={descripcion}>{children}</MarcoEnergest>;
}

export function InicioEnergest() {
  const [contenidos, setContenidos] = useState([]);
  const [error, setError] = useState('');
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    api.get('/contenido')
      .then(({ data }) => setContenidos(data.contenidos || []))
      .catch(() => setError('No pudimos cargar algunas publicaciones. Puedes seguir explorando la información general.'));
  }, []);

  const portada = contenidos.find((item) => item.categoria === 'portada');
  const destacados = contenidos.filter((item) => !['portada', 'cambio-eficiencia', 'beneficio-gestion'].includes(item.categoria));
  const cambiosEducativos = contenidos.filter((item) => item.categoria === 'cambio-eficiencia');
  const beneficiosEducativos = contenidos.filter((item) => item.categoria === 'beneficio-gestion');
  const actual = destacados.length ? destacados[indice % destacados.length] : null;

  useEffect(() => {
    if (destacados.length < 2) return undefined;
    const temporizador = window.setInterval(() => setIndice((valor) => (valor + 1) % destacados.length), 6500);
    return () => window.clearInterval(temporizador);
  }, [destacados.length]);

  return (
    <div className="eg-publico">
      <NavegacionEnergest />
      <main>
        <section className="eg-hero">
          <div className="eg-hero__texto">
            <span className="eg-etiqueta"><i /> Gestión energética para comprender tu consumo</span>
            <h1>{portada?.titulo || 'Conoce tu consumo. Elige qué mejorar.'}</h1>
            <p>{portada?.resumen || 'EnerGest te ayuda a registrar equipos, estimar su consumo a partir de la potencia y las horas de uso, y consultar cómo cambia con el tiempo.'}</p>
            <div className="eg-hero__acciones">
              <Link className="eg-boton" to="/register">Crear una cuenta <span aria-hidden="true">→</span></Link>
              <a className="eg-enlace" href="#como-funciona">Conoce cómo funciona ↓</a>
            </div>
            <div className="eg-nota"><span className="eg-nota__punto">✓</span> La página de inicio es pública; tu consumo y tus dispositivos son privados.</div>
          </div>
          <div className="eg-ilustracion" aria-label="Ilustración de una planta eficiente" role="img">
            {portada?.imagenUrl ? <img className="eg-portada-imagen" src={resolverImagenUrl(portada.imagenUrl)} alt="Imagen principal de EnerGest" /> : <>
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
            <div className="eg-flotante eg-flotante--dato"><span>Ejemplo de uso</span><strong>10 W × 5 h = 0,05 kWh</strong></div>
            <div className="eg-flotante eg-flotante--eco"><span className="eg-flotante__icono">✦</span><span>Pequeños cambios<br /><strong>hacen la diferencia</strong></span></div>
          </div>
        </section>

        <section className="eg-pasos" id="como-funciona">
          <div className="eg-seccion-titulo"><span className="eg-etiqueta">Sencillo desde el primer día</span><h2>Tu energía, en tres pasos</h2></div>
          <div className="eg-pasos__grid">
            {[
              ['01', 'Registra un dispositivo', 'Elige su categoría e ingresa la potencia que aparece en la etiqueta. Puedes comenzar con un ejemplo guiado.'],
              ['02', 'Anota las horas de uso', 'Indica cuánto tiempo lo utilizaste. EnerGest calcula una estimación en kWh con la potencia y las horas.'],
              ['03', 'Consulta y compara', 'Guarda cada uso con su fecha y revisa el total de los últimos siete días, por equipo y en conjunto.'],
            ].map(([numero, titulo, texto]) => <article className="eg-paso" key={numero}><span>{numero}</span><h3>{titulo}</h3><p>{texto}</p></article>)}
          </div>
          <div className="eg-ejemplo-publico"><div><span className="eg-etiqueta">Ejemplo ya resuelto</span><h3>Bombillo LED de 10 W</h3><p>Si se usa durante 5 horas: (10 W × 5 h) ÷ 1000 = <strong>0,05 kWh estimados</strong>.</p></div><p>La potencia sugerida es orientativa. Usa el dato de la etiqueta de tu equipo cuando lo tengas. El cálculo no reemplaza una medición del medidor.</p></div>
        </section>

        <section className="eg-funciones-publicas">
          <div className="eg-seccion-titulo"><span className="eg-etiqueta">Al crear tu cuenta</span><h2>Herramientas para entender tus equipos</h2></div>
          <div className="eg-pasos__grid">
            <article className="eg-paso"><span>01</span><h3>Inventario por dispositivo</h3><p>Registra nombre, categoría, potencia y horas habituales de uso.</p></article>
            <article className="eg-paso"><span>02</span><h3>Consumo por uso y periodo</h3><p>Consulta el cálculo por hora y los usos que registraste por día, semana y mes; la proyección anual se identifica como estimada.</p></article>
            <article className="eg-paso"><span>03</span><h3>Referencias de potencia</h3><p>Compara la potencia con un rango orientativo de la categoría, teniendo en cuenta que cada modelo puede variar.</p></article>
          </div>
        </section>

        <section className="eg-aprende" id="aprende">
          <div className="eg-aprende__cabecera"><div><span className="eg-etiqueta">Ideas para usar mejor la energía</span><h2>Información que te puede servir</h2></div>
            {destacados.length > 1 && <div className="eg-carrusel__controles"><button type="button" onClick={() => setIndice((actualIndice) => (actualIndice - 1 + destacados.length) % destacados.length)} aria-label="Anterior">←</button><button type="button" onClick={() => setIndice((actualIndice) => (actualIndice + 1) % destacados.length)} aria-label="Siguiente">→</button></div>}
          </div>
          <ErrorMensaje>{error}</ErrorMensaje>
          {actual ? <article className="eg-carrusel" key={actual.slug}>
            <div className="eg-carrusel__imagen" style={actual.imagenUrl ? { backgroundImage: 'linear-gradient(0deg, #133d2aaa, transparent), url("' + resolverImagenUrl(actual.imagenUrl) + '")' } : undefined}><span>ENERGEST · {actual.categoria.replace('-', ' ')}</span></div>
            <div className="eg-carrusel__texto"><h3>{actual.titulo}</h3><p>{actual.resumen}</p><p>{actual.texto}</p>{actual.fuenteUrl && <a className="eg-enlace" href={actual.fuenteUrl} target="_blank" rel="noreferrer">Fuente: {actual.fuente || 'Consultar referencia'} ↗</a>}<div className="eg-carrusel__puntos">{destacados.map((item, i) => <button type="button" key={item.slug} className={i === indice ? 'activo' : ''} onClick={() => setIndice(i)} aria-label={'Ver contenido ' + (i + 1)} aria-pressed={i === indice} />)}</div></div>
          </article> : <p className="eg-vacio">El contenido informativo aparecerá aquí cuando esté publicado.</p>}
        </section>

        <section className="eg-aprende eg-aprende--gerson">
          <div className="eg-seccion-titulo"><span className="eg-etiqueta">Aprende sobre eficiencia energética</span><h2>Qué está cambiando y por qué importa</h2></div>
          <div className="eg-info-grid">{(cambiosEducativos.length ? cambiosEducativos.map((item) => ({ titulo: item.titulo, descripcion: item.resumen, contenido: item.texto, imagenUrl: item.imagenUrl, slug: item.slug })) : CAMBIOS_EFICIENCIA).map((item) => <details className="eg-info-card" key={item.slug || item.titulo}>{item.imagenUrl && <img className="eg-info-card__imagen" src={resolverImagenUrl(item.imagenUrl)} alt="" />}<summary><strong>{item.titulo}</strong><span>{item.descripcion}</span><small>Leer más</small></summary><p>{item.contenido}</p></details>)}</div>
          <div className="eg-seccion-titulo eg-seccion-titulo--secundario"><span className="eg-etiqueta">Gestión energética</span><h2>Beneficios de gestionar mejor</h2></div>
          <div className="eg-info-grid">{(beneficiosEducativos.length ? beneficiosEducativos.map((item) => ({ titulo: item.titulo, descripcion: item.resumen, contenido: item.texto, imagenUrl: item.imagenUrl, slug: item.slug })) : BENEFICIOS_GESTION).map((item) => <details className="eg-info-card" key={item.slug || item.titulo}>{item.imagenUrl && <img className="eg-info-card__imagen" src={resolverImagenUrl(item.imagenUrl)} alt="" />}<summary><strong>{item.titulo}</strong><span>{item.descripcion}</span><small>Leer más</small></summary><p>{item.contenido}</p></details>)}</div>
        </section>

        <section className="eg-cta"><div><span className="eg-etiqueta">Tu información, organizada</span><h2>Empieza con lo que tienes hoy.</h2><p>Crea una cuenta para guardar tus dispositivos y construir un historial de consumo. El registro está disponible con los dominios autorizados por administración.</p></div><Link className="eg-boton eg-boton--claro" to="/register">Crear mi cuenta <span aria-hidden="true">→</span></Link></section>
      </main>
      <footer className="eg-footer"><Link className="eg-marca" to="/"><span className="eg-marca__icono">✳</span><span>Ener<strong>Gest</strong></span></Link><span>Gestión energética sencilla · Proyecto académico</span></footer>
    </div>
  );
}

const NUEVO_CONTENIDO = { slug: '', categoria: 'informativo', titulo: '', resumen: '', texto: '', imagenUrl: '', fuente: '', fuenteUrl: '', orden: 0, publicado: false };
export function AdministracionEnergest() {
  const { usuario } = useAuth();
  const [contenidos, setContenidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
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
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [datosCuenta, setDatosCuenta] = useState(null);
  const [auditoria, setAuditoria] = useState([]);
  const [dispositivoAdminEditando, setDispositivoAdminEditando] = useState(null);
  const [confirmacionAdmin, setConfirmacionAdmin] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const [respuestaContenido, respuestaUsuarios, respuestaAcceso] = await Promise.all([
        api.get('/contenido/administrar'), api.get('/usuarios'), api.get('/configuracion/publica'),
      ]);
      setContenidos(respuestaContenido.data.contenidos || []);
      setUsuarios(respuestaUsuarios.data.usuarios || []);
      const permitidos = respuestaAcceso.data.dominios || ['gmail.com', 'unac.edu.co'];
      setDominios(permitidos); setDominiosTexto(permitidos.join(', ')); setError('');
    } catch { setError('No se pudo cargar la administración. Comprueba que tu cuenta tenga rol administrador.'); }
    finally { setCargando(false); }
  }
  useEffect(() => { cargar(); }, []);
  useEffect(() => { if (pestana !== 'cuentas') return; api.get('/usuarios/auditoria').then(({data}) => setAuditoria(data.eventos || [])).catch(() => setAuditoria([])); }, [pestana]);
  async function cargarCuenta(id) { setCuentaActiva(id); setDispositivoAdminEditando(null); try { const {data}=await api.get('/usuarios/'+id+'/datos'); setDatosCuenta(data); } catch(err) { setError(err.response?.data?.mensaje || 'No se pudieron cargar los datos de esa cuenta.'); } }
  async function refrescarCuenta() { if (cuentaActiva) await cargarCuenta(cuentaActiva); const {data}=await api.get('/usuarios/auditoria'); setAuditoria(data.eventos || []); }
  async function guardarDispositivoAdmin(evento) { evento.preventDefault(); const {id, ...cambios}=dispositivoAdminEditando; try { await api.put('/usuarios/'+cuentaActiva+'/dispositivos/'+id,cambios); setMensaje('Dispositivo actualizado para la cuenta seleccionada.'); await refrescarCuenta(); } catch(err) { setError(err.response?.data?.mensaje || 'No se pudo actualizar el dispositivo.'); } }
  async function ejecutarAccionAdmin() { const accion=confirmacionAdmin; setConfirmacionAdmin(null); if(!accion) return; try { await accion.ejecutar(); setMensaje(accion.mensajeExito); await refrescarCuenta(); } catch(err) { setError(err.response?.data?.mensaje || 'No se pudo completar la acción.'); } }
  if (usuario?.rol !== 'administrador') return <Navigate to="/consumo" replace />;

  function empezarEdicion(contenido) {
    setEditando(contenido._id);
    setFormulario({ slug: contenido.slug, categoria: contenido.categoria, titulo: contenido.titulo, resumen: contenido.resumen || '', texto: contenido.texto, imagenUrl: contenido.imagenUrl || '', fuente: contenido.fuente || '', fuenteUrl: contenido.fuenteUrl || '', orden: contenido.orden || 0, publicado: contenido.publicado });
  }
  function limpiar() { setEditando(''); setFormulario(NUEVO_CONTENIDO); }
  async function guardar(evento) {
    evento.preventDefault(); setError(''); setMensaje('');
    try {
      if (editando) await api.put('/contenido/' + editando, formulario);
      else await api.post('/contenido', formulario);
      limpiar(); setMensaje('Contenido guardado.'); await cargar();
    } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo guardar. Revisa el identificador y los campos obligatorios.'); }
  }
  async function subirImagen(evento) {
    const archivo = evento.target.files?.[0]; evento.target.value = '';
    if (!archivo) return;
    setError(''); setMensaje(''); setSubiendoImagen(true);
    try {
      const respuesta = await api.post('/contenido/imagenes', archivo, { headers: { 'Content-Type': archivo.type } });
      setFormulario((actual) => ({ ...actual, imagenUrl: respuesta.data.imagenUrl }));
      setMensaje('Imagen subida al servidor. Guarda la publicación para mostrarla en Inicio.');
    } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo subir la imagen. Usa JPG, PNG o WebP de máximo 5 MB.'); }
    finally { setSubiendoImagen(false); }
  }
  async function borrar(id) {
    setConfirmacionAdmin({ titulo: 'Eliminar contenido', mensaje: 'La publicación dejará de estar disponible en Inicio. Esta acción no se puede deshacer.', mensajeExito: 'Contenido eliminado.', ejecutar: async () => { await api.delete('/contenido/' + id); await cargar(); } });
    return;
  }
  async function cambiarRol(id, rol) {
    setError(''); setMensaje('');
    try { await api.patch('/usuarios/' + id + '/rol', { rol }); setMensaje('Rol de cuenta actualizado.'); await cargar(); }
    catch (err) { setError(err.response?.data?.mensaje || 'No se pudo cambiar el rol.'); }
  }
  async function guardarDominios(evento) {
    evento.preventDefault(); setError(''); setMensaje(''); setGuardandoDominios(true);
    const lista = dominiosTexto.split(/[\n,;]+/).map((valor) => valor.trim().replace(/^@/, '')).filter(Boolean);
    try {
      const respuesta = await api.put('/configuracion/dominios', { dominios: lista });
      setDominios(respuesta.data.dominios); setDominiosTexto(respuesta.data.dominios.join(', '));
      setMensaje('Los dominios de registro fueron actualizados.');
    } catch (err) { setError(err.response?.data?.mensaje || 'No se pudieron guardar los dominios.'); }
    finally { setGuardandoDominios(false); }
  }

  return <MarcoPrivado titulo="Administración" descripcion="Gestiona la información pública, las imágenes, los dominios de registro y las cuentas.">
    <ErrorMensaje>{error}</ErrorMensaje>{mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
    <div className="eg-tabs" role="tablist" aria-label="Herramientas de administración">
      <button className={pestana === 'contenido' ? 'activo' : ''} onClick={() => setPestana('contenido')} role="tab">Contenido e imágenes</button>
      <button className={pestana === 'dominios' ? 'activo' : ''} onClick={() => setPestana('dominios')} role="tab">Dominios de registro</button>
      <button className={pestana === 'usuarios' ? 'activo' : ''} onClick={() => setPestana('usuarios')} role="tab">Usuarios y roles</button>
      <button className={pestana === 'cuentas' ? 'activo' : ''} onClick={() => setPestana('cuentas')} role="tab">Cuentas y registros</button>
    </div>
    {cargando ? <Cargando /> : pestana === 'contenido' ? <div className="eg-admin-layout">
      <section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Página pública</span><h2>Textos publicados</h2></div><span className="eg-contador">{contenidos.length}</span></div>
        {contenidos.length ? contenidos.map((contenido) => <article className="eg-contenido-item" key={contenido._id}><div><span className={'eg-estado ' + (contenido.publicado ? 'eg-estado--publicado' : '')}>{contenido.publicado ? 'Publicado' : 'Borrador'}</span><h3>{contenido.titulo}</h3><p>{contenido.resumen || contenido.texto}</p><small>{contenido.categoria} · orden {contenido.orden}{contenido.imagenUrl ? ' · con imagen' : ''}</small></div><div className="eg-dispositivo__acciones"><button onClick={() => empezarEdicion(contenido)}>Editar</button><button className="eg-texto-peligro" onClick={() => borrar(contenido._id)}>Eliminar</button></div></article>) : <div className="eg-vacio"><strong>No hay contenido todavía</strong><p>Crea la primera sección informativa para la página pública.</p></div>}
      </section>
      <form className="eg-panel eg-formulario" onSubmit={guardar}><span className="eg-etiqueta">{editando ? 'Editar publicación' : 'Nueva publicación'}</span><h2>{editando ? 'Actualizar texto' : 'Crear contenido'}</h2>
        <label>Identificador único<input required maxLength="100" value={formulario.slug} onChange={(e) => setFormulario({ ...formulario, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="ejemplo-de-contenido" /></label>
        <label>Sección<select value={formulario.categoria} onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}><option value="portada">Portada</option><option value="informativo">Informativo</option><option value="consejo">Consejo</option><option value="pregunta-frecuente">Pregunta frecuente</option><option value="cambio-eficiencia">Tendencias de eficiencia energética</option><option value="beneficio-gestion">Beneficios de gestionar energía</option></select></label>
        <label>Título<input required maxLength="120" value={formulario.titulo} onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })} /></label>
        <label>Resumen<input maxLength="240" value={formulario.resumen} onChange={(e) => setFormulario({ ...formulario, resumen: e.target.value })} /></label>
        <label>Texto<textarea required rows="5" maxLength="4000" value={formulario.texto} onChange={(e) => setFormulario({ ...formulario, texto: e.target.value })} /></label>
        <label>Imagen para este espacio <span className="eg-opcional">Opcional · JPG, PNG o WebP · máximo 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={subirImagen} disabled={subiendoImagen} /></label>
        <label>O dirección de imagen <span className="eg-opcional">Opcional</span><input type="text" maxLength="500" value={formulario.imagenUrl} onChange={(e) => setFormulario({ ...formulario, imagenUrl: e.target.value })} placeholder="URL externa o ruta de imagen subida" /></label>
        {formulario.imagenUrl && <div className="eg-admin-vista-imagen"><img src={resolverImagenUrl(formulario.imagenUrl)} alt="Vista previa de la imagen del contenido" /><button type="button" className="eg-texto-peligro" onClick={() => setFormulario({ ...formulario, imagenUrl: '' })}>Quitar imagen</button></div>}
        <label>Nombre de la fuente <span className="eg-opcional">Opcional</span><input maxLength="160" value={formulario.fuente} onChange={(e) => setFormulario({ ...formulario, fuente: e.target.value })} placeholder="Ej. Ministerio de Minas y Energía" /></label>
        <label>Enlace de la fuente <span className="eg-opcional">Opcional</span><input type="url" maxLength="500" value={formulario.fuenteUrl} onChange={(e) => setFormulario({ ...formulario, fuenteUrl: e.target.value })} placeholder="https://…" /></label>
        <label>Orden<input type="number" min="0" value={formulario.orden} onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })} /></label>
        <label className="eg-check"><input type="checkbox" checked={formulario.publicado} onChange={(e) => setFormulario({ ...formulario, publicado: e.target.checked })} /> Mostrar en la página pública</label>
        <div className="eg-formulario__acciones"><button className="eg-boton" type="submit" disabled={subiendoImagen}>{subiendoImagen ? 'Subiendo imagen…' : 'Guardar'}</button>{editando && <button className="eg-boton eg-boton--suave" type="button" onClick={limpiar}>Cancelar</button>}</div>
      </form>
    </div> : pestana === 'dominios' ? <section className="eg-panel eg-panel--dominios"><span className="eg-etiqueta">Control de acceso</span><h2>Dominios autorizados para crear cuenta</h2><p>Solo podrán registrarse correos cuyo dominio exacto esté en esta lista. El servidor aplica esta regla aunque alguien modifique el formulario del navegador. Escribe dominios separados por comas o líneas; puedes incluirlos con o sin @.</p><form onSubmit={guardarDominios}><label>Dominios permitidos<textarea rows="5" value={dominiosTexto} onChange={(e) => setDominiosTexto(e.target.value)} placeholder="gmail.com, unac.edu.co" /></label><div className="eg-dominios-actuales">{dominios.map((dominio) => <span key={dominio}>@{dominio}</span>)}</div><button className="eg-boton" type="submit" disabled={guardandoDominios}>{guardandoDominios ? 'Guardando…' : 'Guardar dominios'}</button></form></section> : pestana === 'usuarios' ? <section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Acceso a EnerGest</span><h2>Cuentas registradas</h2></div><span className="eg-contador">{usuarios.length}</span></div><div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody>{usuarios.map((u) => <tr key={u._id}><td>{u.nombre}</td><td>{u.email}</td><td><select aria-label={'Rol de ' + u.nombre} value={u.rol} disabled={u._id === usuario.id} onChange={(e) => cambiarRol(u._id, e.target.value)}><option value="cliente">Cliente</option><option value="analista">Analista</option><option value="administrador">Administrador</option></select></td></tr>)}</tbody></table></div><p className="eg-ayuda">Para tener dos administradores, primero registra dos cuentas personales con los dominios permitidos y luego cambia su rol a Administrador aquí. No se asignan contraseñas comunes desde el sistema.</p></section> : <div className="eg-admin-cuentas"><section className="eg-panel"><span className="eg-etiqueta">Gestión de cuentas</span><h2>Selecciona una cuenta</h2><label>Usuario<select value={cuentaActiva || ''} onChange={(e) => e.target.value && cargarCuenta(e.target.value)}><option value="">Elige una cuenta…</option>{usuarios.map((u) => <option key={u._id} value={u._id}>{u.nombre} · {u.email}</option>)}</select></label>{datosCuenta && <><div className="eg-cuenta-seleccionada"><strong>{datosCuenta.usuario.nombre}</strong><span>{datosCuenta.usuario.email} · {datosCuenta.usuario.rol}</span></div><h3>Dispositivos</h3>{datosCuenta.dispositivos.map((d) => dispositivoAdminEditando?.id===d._id ? <form className="eg-formulario eg-edicion-admin" key={d._id} onSubmit={guardarDispositivoAdmin}><strong>Editar {d.nombre}</strong><label>Nombre<input required value={dispositivoAdminEditando.nombre} onChange={e=>setDispositivoAdminEditando({...dispositivoAdminEditando,nombre:e.target.value})}/></label><label>Potencia (W)<input type="number" min="1" value={dispositivoAdminEditando.potenciaWatts} onChange={e=>setDispositivoAdminEditando({...dispositivoAdminEditando,potenciaWatts:Number(e.target.value)})}/></label><label>Horas habituales al día<input type="number" min="0" max="24" step="0.25" value={dispositivoAdminEditando.horasUsoDiarias} onChange={e=>setDispositivoAdminEditando({...dispositivoAdminEditando,horasUsoDiarias:Number(e.target.value)})}/></label><div className="eg-formulario__acciones"><button className="eg-boton">Guardar cambios</button><button className="eg-boton eg-boton--suave" type="button" onClick={()=>setDispositivoAdminEditando(null)}>Cancelar</button></div></form> : <article className="eg-contenido-item" key={d._id}><div><h3>{d.nombre}</h3><p>{d.categoria} · {d.potenciaWatts} W · {d.horasUsoDiarias} h/día</p></div><div className="eg-dispositivo__acciones"><button onClick={()=>setDispositivoAdminEditando({id:d._id,nombre:d.nombre,potenciaWatts:d.potenciaWatts,horasUsoDiarias:d.horasUsoDiarias})}>Editar</button><button className="eg-texto-peligro" onClick={()=>setConfirmacionAdmin({titulo:'Archivar dispositivo',mensaje:'Se archivará '+d.nombre+'. Sus registros históricos se conservarán.',confirmar:'Archivar',peligro:true,mensajeExito:'Dispositivo archivado.',ejecutar:()=>api.delete('/usuarios/'+cuentaActiva+'/dispositivos/'+d._id)})}>Archivar</button></div></article>)}<h3>Registros recientes</h3>{datosCuenta.lecturas.length ? <div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Dispositivo</th><th>Fecha</th><th>Uso</th><th>Consumo</th><th>Acción</th></tr></thead><tbody>{datosCuenta.lecturas.map(l=><tr key={l._id}><td>{l.dispositivoId?.nombre || 'Archivado'}</td><td>{new Date(l.fecha).toLocaleDateString('es-CO')}</td><td>{l.horasUso ?? '—'}</td><td>{l.consumoKwh} kWh</td><td><button className="eg-accion-peligro" onClick={()=>setConfirmacionAdmin({titulo:'Eliminar registro',mensaje:'Se eliminará este registro de consumo de la cuenta.',confirmar:'Eliminar registro',peligro:true,mensajeExito:'Registro de consumo eliminado.',ejecutar:()=>api.delete('/usuarios/'+cuentaActiva+'/lecturas/'+l._id)})}>Eliminar</button></td></tr>)}</tbody></table></div> : <p className="eg-ayuda">Esta cuenta no tiene registros recientes.</p>}</>}</section><section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Trazabilidad</span><h2>Actividad administrativa</h2></div></div>{auditoria.length ? <div className="eg-auditoria">{auditoria.map(e=><article key={e._id}><strong>{e.descripcion}</strong><small>{e.actorId?.nombre || 'Administrador'} · {e.usuarioAfectadoId?.email || 'Cuenta'} · {new Date(e.createdAt).toLocaleString('es-CO')}</small></article>)}</div> : <p className="eg-ayuda">Las modificaciones administrativas quedarán registradas aquí.</p>}</section></div>}
      <DialogoConfirmacionEnergest abierto={Boolean(confirmacionAdmin)} titulo={confirmacionAdmin?.titulo} mensaje={confirmacionAdmin?.mensaje} confirmar={confirmacionAdmin?.confirmar || 'Eliminar'} peligro={confirmacionAdmin?.peligro ?? true} onCancelar={()=>setConfirmacionAdmin(null)} onConfirmar={ejecutarAccionAdmin}/>
  </MarcoPrivado>;
}
