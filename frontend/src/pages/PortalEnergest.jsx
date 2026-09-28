import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/PortalEnergest.css';

function ErrorMensaje({ children }) {
  return children ? <p className="eg-alerta" role="alert">{children}</p> : null;
}

function Cargando({ texto = 'Cargando información…' }) {
  return <div className="eg-cargando" role="status"><span />{texto}</div>;
}

export function InicioEnergest() {
  const [contenidos, setContenidos] = useState([]);
  const [error, setError] = useState('');
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    api.get('/contenido')
      .then(({ data }) => setContenidos(data.contenidos || []))
      .catch(() => setError('No pudimos cargar el contenido. Comprueba que el servidor esté activo.'));
  }, []);

  const portada = contenidos.find((item) => item.categoria === 'portada');
  const destacados = contenidos.filter((item) => item.categoria !== 'portada');
  const actual = destacados.length ? destacados[indice % destacados.length] : null;

  useEffect(() => {
    if (destacados.length < 2) return undefined;
    const temporizador = window.setInterval(() => setIndice((valor) => (valor + 1) % destacados.length), 6500);
    return () => window.clearInterval(temporizador);
  }, [destacados.length]);

  return (
    <div className="eg-publico">
      <header className="eg-nav eg-nav--publica">
        <Link className="eg-marca" to="/" aria-label="EnerGest, inicio">
          <span className="eg-marca__icono">✳</span><span>Ener<strong>Gest</strong></span>
        </Link>
        <nav aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#aprende">Aprende</a>
        </nav>
        <div className="eg-nav__acciones">
          <Link className="eg-enlace" to="/login">Iniciar sesión</Link>
          <Link className="eg-boton eg-boton--compacto" to="/register">Crear cuenta <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <main>
        <section className="eg-hero">
          <div className="eg-hero__texto">
            <span className="eg-etiqueta"><i /> Energía mejor entendida</span>
            <h1>{portada?.titulo || 'Conoce tu consumo. Elige qué mejorar.'}</h1>
            <p>{portada?.resumen || 'Una forma sencilla de registrar tus equipos y entender cómo usan la energía.'}</p>
            <div className="eg-hero__acciones">
              <Link className="eg-boton" to="/register">Empieza gratis <span aria-hidden="true">→</span></Link>
              <a className="eg-enlace" href="#como-funciona">Conoce la plataforma ↓</a>
            </div>
            <div className="eg-nota"><span className="eg-nota__punto">✓</span> Registro claro, datos bajo tu control</div>
          </div>

          <div className="eg-ilustracion" aria-label="Ilustración de una planta eficiente" role="img">
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
            <div className="eg-flotante eg-flotante--dato"><span>Consumo registrado</span><strong>+ claridad <i>↗</i></strong></div>
            <div className="eg-flotante eg-flotante--eco"><span className="eg-flotante__icono">✦</span><span>Pequeños cambios<br /><strong>hacen la diferencia</strong></span></div>
          </div>
        </section>

        <section className="eg-pasos" id="como-funciona">
          <div className="eg-seccion-titulo"><span className="eg-etiqueta">Sencillo desde el primer día</span><h2>Tu energía, en tres pasos</h2></div>
          <div className="eg-pasos__grid">
            {[
              ['01', 'Registra tus equipos', 'Organiza tus dispositivos por nombre, tipo y ubicación.'],
              ['02', 'Anota una lectura', 'Ingresa manualmente el consumo en kWh cuando lo tengas.'],
              ['03', 'Observa el cambio', 'Consulta tu historial y compara el consumo en el tiempo.'],
            ].map(([numero, titulo, texto]) => <article className="eg-paso" key={numero}><span>{numero}</span><h3>{titulo}</h3><p>{texto}</p></article>)}
          </div>
        </section>

        <section className="eg-aprende" id="aprende">
          <div className="eg-aprende__cabecera"><div><span className="eg-etiqueta">Ideas para usar mejor la energía</span><h2>Información que te puede servir</h2></div>
            {destacados.length > 1 && <div className="eg-carrusel__controles"><button type="button" onClick={() => setIndice((indice - 1 + destacados.length) % destacados.length)} aria-label="Anterior">←</button><button type="button" onClick={() => setIndice((indice + 1) % destacados.length)} aria-label="Siguiente">→</button></div>}
          </div>
          <ErrorMensaje>{error}</ErrorMensaje>
          {actual ? <article className="eg-carrusel" key={actual.slug}>
            <div className="eg-carrusel__imagen" style={actual.imagenUrl ? { backgroundImage: `linear-gradient(0deg, #133d2aaa, transparent), url("${actual.imagenUrl}")` } : undefined}><span>ENERGEST · {actual.categoria.replace('-', ' ')}</span></div>
            <div className="eg-carrusel__texto"><h3>{actual.titulo}</h3><p>{actual.resumen || actual.texto}</p><div className="eg-carrusel__puntos">{destacados.map((item, i) => <button type="button" key={item.slug} className={i === indice ? 'activo' : ''} onClick={() => setIndice(i)} aria-label={`Ver contenido ${i + 1}`} />)}</div></div>
          </article> : <p className="eg-vacio">El contenido informativo aparecerá aquí.</p>}
        </section>

        <section className="eg-cta"><div><span className="eg-etiqueta">Tu información, organizada</span><h2>Empieza con lo que tienes hoy.</h2><p>Una cuenta gratuita te permite guardar tus equipos y construir un historial de consumo.</p></div><Link className="eg-boton eg-boton--claro" to="/register">Crear mi cuenta <span aria-hidden="true">→</span></Link></section>
      </main>
      <footer className="eg-footer"><Link className="eg-marca" to="/"><span className="eg-marca__icono">✳</span><span>Ener<strong>Gest</strong></span></Link><span>Gestión energética sencilla · Proyecto académico</span></footer>
    </div>
  );
}

function MarcoPrivado({ children, titulo, descripcion }) {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  function salir() { cerrarSesion(); navigate('/'); }
  return <div className="eg-app"><header className="eg-nav eg-nav--privada">
    <Link className="eg-marca" to="/dashboard"><span className="eg-marca__icono">✳</span><span>Ener<strong>Gest</strong></span></Link>
    <nav aria-label="Menú de gestión">
      <NavLink to="/dashboard">Resumen</NavLink><NavLink to="/dispositivos">Dispositivos</NavLink><NavLink to="/lecturas">Consumo</NavLink>
      {usuario?.rol === 'administrador' && <NavLink to="/administrar">Administración</NavLink>}
    </nav>
    <div className="eg-cuenta"><div><strong>{usuario?.nombre}</strong><span>{usuario?.rol}</span></div><button className="eg-enlace" onClick={salir}>Salir</button></div>
  </header><main className="eg-contenido"><div className="eg-pagina-titulo"><span className="eg-etiqueta">Tu espacio de energía</span><h1>{titulo}</h1><p>{descripcion}</p></div>{children}</main><footer className="eg-footer"><span>EnerGest</span><span>Los datos de tu cuenta son privados.</span></footer></div>;
}

export function PanelEnergest() {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard/resumen').then(({ data }) => setResumen(data.resumen)).catch(() => setError('No se pudo cargar el resumen. Intenta actualizar la página.')); }, []);
  const recientes = resumen?.lecturasRecientes || [];
  const maximo = Math.max(1, ...recientes.map((r) => r.consumoKwh));
  return <MarcoPrivado titulo={`Hola, ${usuario?.nombre?.split(' ')[0] || 'bienvenido'}`} descripcion="Este es un resumen de los datos que has registrado.">
    <ErrorMensaje>{error}</ErrorMensaje>{!resumen && !error ? <Cargando /> : <>
      <section className="eg-metricas"><article className="eg-metrica eg-metrica--verde"><span>Dispositivos activos</span><strong>{resumen?.totalDispositivos ?? 0}</strong><small>En tu inventario</small></article><article className="eg-metrica"><span>Consumo de hoy</span><strong>{Number(resumen?.consumoHoyKwh || 0).toFixed(1)} <small>kWh</small></strong><small>Suma de lecturas de hoy</small></article><article className="eg-metrica eg-metrica--amarilla"><span>Consumo del mes</span><strong>{Number(resumen?.consumoMesKwh || 0).toFixed(1)} <small>kWh</small></strong><small>Desde el inicio del mes</small></article></section>
      <div className="eg-columnas"><section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Actividad</span><h2>Lecturas recientes</h2></div><Link className="eg-enlace" to="/lecturas">Ver historial →</Link></div>
        {recientes.length ? <div className="eg-grafico" aria-label="Gráfico de las lecturas recientes">{[...recientes].reverse().map((lectura, i) => <div className="eg-barra" key={lectura._id || i} title={`${lectura.consumoKwh} kWh`}><span style={{ height: `${Math.max(8, (lectura.consumoKwh / maximo) * 100)}%` }} /><small>{new Date(lectura.fecha).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</small></div>)}</div> : <div className="eg-vacio"><span>◌</span><strong>Aún no hay lecturas</strong><p>Cuando registres consumos, aquí podrás ver cómo evolucionan.</p><Link className="eg-boton eg-boton--compacto" to="/lecturas">Registrar lectura</Link></div>}
      </section><aside className="eg-panel eg-panel--consejo"><span className="eg-consejo__icono">✦</span><span className="eg-etiqueta">Un buen comienzo</span><h2>Registra con regularidad</h2><p>Si anotas las lecturas en momentos parecidos, será más fácil comparar tus consumos.</p><Link className="eg-enlace" to="/lecturas">Añadir una lectura →</Link></aside></div>
      <section className="eg-atajos"><Link to="/dispositivos"><span>＋</span><div><strong>Gestionar dispositivos</strong><small>Agrega o actualiza tus equipos</small></div><b>→</b></Link><Link to="/lecturas"><span>↗</span><div><strong>Registrar consumo</strong><small>Guarda una nueva lectura en kWh</small></div><b>→</b></Link></section>
    </>}</MarcoPrivado>;
}

const FORM_DISPOSITIVO = { nombre: '', tipo: '', consumoEstimadoKwhDia: '', ubicacion: '' };
export function DispositivosEnergest() {
  const { usuario } = useAuth();
  const puedeEditar = usuario?.rol !== 'analista';
  const [dispositivos, setDispositivos] = useState([]);
  const [formulario, setFormulario] = useState(FORM_DISPOSITIVO);
  const [editando, setEditando] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  async function cargar() { setCargando(true); try { const { data } = await api.get('/dispositivos'); setDispositivos(data.dispositivos || []); setError(''); } catch { setError('No se pudieron cargar tus dispositivos.'); } finally { setCargando(false); } }
  useEffect(() => { cargar(); }, []);
  function cambiar(campo, valor) { setFormulario((actual) => ({ ...actual, [campo]: valor })); }
  function editar(dispositivo) { setEditando(dispositivo._id); setFormulario({ nombre: dispositivo.nombre, tipo: dispositivo.tipo, consumoEstimadoKwhDia: dispositivo.consumoEstimadoKwhDia, ubicacion: dispositivo.ubicacion || '' }); setMensaje(''); }
  function limpiar() { setEditando(''); setFormulario(FORM_DISPOSITIVO); }
  async function guardar(evento) { evento.preventDefault(); setError(''); setMensaje(''); const datos = { ...formulario, consumoEstimadoKwhDia: Number(formulario.consumoEstimadoKwhDia) }; try { if (editando) await api.put(`/dispositivos/${editando}`, datos); else await api.post('/dispositivos', datos); limpiar(); setMensaje(editando ? 'Cambios guardados.' : 'Dispositivo agregado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'Revisa los datos e inténtalo de nuevo.'); } }
  async function eliminar(id) { if (!window.confirm('¿Quitar este dispositivo de tu lista? Sus lecturas anteriores se conservarán.')) return; try { await api.delete(`/dispositivos/${id}`); setMensaje('Dispositivo archivado; su historial se conserva.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo archivar el dispositivo.'); } }
  return <MarcoPrivado titulo="Tus dispositivos" descripcion="Organiza tus equipos y guarda una referencia de su consumo diario estimado.">
    <ErrorMensaje>{error}</ErrorMensaje>{mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
    <div className="eg-dispositivos-layout"><section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Inventario personal</span><h2>Equipos registrados</h2></div><span className="eg-contador">{dispositivos.length}</span></div>
      {cargando ? <Cargando /> : dispositivos.length ? <div className="eg-lista-dispositivos">{dispositivos.map((d) => <article className="eg-dispositivo" key={d._id}><span className="eg-dispositivo__icono">⌁</span><div className="eg-dispositivo__info"><strong>{d.nombre}</strong><span>{d.tipo}{d.ubicacion ? ` · ${d.ubicacion}` : ''}</span></div><div className="eg-dispositivo__consumo"><strong>{Number(d.consumoEstimadoKwhDia).toLocaleString('es')} kWh</strong><small>estimados / día</small></div>{puedeEditar && <div className="eg-dispositivo__acciones"><button type="button" onClick={() => editar(d)}>Editar</button><button type="button" className="eg-texto-peligro" onClick={() => eliminar(d._id)}>Quitar</button></div>}</article>)}</div> : <div className="eg-vacio"><span>⌂</span><strong>Tu inventario está vacío</strong><p>Agrega tu primer equipo para empezar a organizar el consumo.</p></div>}
    </section>
    {puedeEditar && <form className="eg-panel eg-formulario" onSubmit={guardar}><span className="eg-etiqueta">{editando ? 'Actualizar equipo' : 'Nuevo equipo'}</span><h2>{editando ? 'Editar dispositivo' : 'Agregar dispositivo'}</h2>
      <label>Nombre<input required maxLength="80" value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} placeholder="Ej. Refrigerador principal" /></label>
      <label>Tipo de equipo<input required maxLength="50" value={formulario.tipo} onChange={(e) => cambiar('tipo', e.target.value)} placeholder="Ej. Refrigeración" /></label>
      <label>Consumo estimado (kWh / día)<input required type="number" min="0" step="0.1" value={formulario.consumoEstimadoKwhDia} onChange={(e) => cambiar('consumoEstimadoKwhDia', e.target.value)} placeholder="0.0" /></label>
      <label>Ubicación <span className="eg-opcional">Opcional</span><input maxLength="100" value={formulario.ubicacion} onChange={(e) => cambiar('ubicacion', e.target.value)} placeholder="Ej. Cocina" /></label>
      <div className="eg-formulario__acciones"><button className="eg-boton" type="submit">{editando ? 'Guardar cambios' : 'Agregar equipo'}</button>{editando && <button type="button" className="eg-boton eg-boton--suave" onClick={limpiar}>Cancelar</button>}</div>
    </form>}
    {!puedeEditar && <aside className="eg-panel eg-panel--consejo"><span className="eg-etiqueta">Acceso de consulta</span><h2>Solo lectura</h2><p>Tu rol puede revisar el inventario. Un cliente de la cuenta puede crear o actualizar equipos.</p></aside>}
    </div>
  </MarcoPrivado>;
}

export function LecturasEnergest() {
  const { usuario } = useAuth();
  const puedeEditar = usuario?.rol !== 'analista';
  const hoy = new Date();
  const hoyTexto = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const [dispositivos, setDispositivos] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [formulario, setFormulario] = useState({ dispositivoId: '', consumoKwh: '', fecha: hoyTexto, nota: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  async function cargar() { setCargando(true); try { const [d, l] = await Promise.all([api.get('/dispositivos'), api.get('/lecturas')]); setDispositivos(d.data.dispositivos || []); setLecturas(l.data.lecturas || []); setError(''); } catch { setError('No se pudieron cargar tus lecturas.'); } finally { setCargando(false); } }
  useEffect(() => { cargar(); }, []);
  async function guardar(evento) { evento.preventDefault(); setError(''); setMensaje(''); try { await api.post('/lecturas', { ...formulario, consumoKwh: Number(formulario.consumoKwh), fecha: new Date(`${formulario.fecha}T12:00:00`).toISOString() }); setFormulario((f) => ({ ...f, consumoKwh: '', nota: '' })); setMensaje('Lectura guardada.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo guardar la lectura.'); } }
  return <MarcoPrivado titulo="Historial de consumo" descripcion="Registra lecturas manuales y consulta el historial de tus equipos.">
    <ErrorMensaje>{error}</ErrorMensaje>{mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
    <div className="eg-lecturas-layout">{puedeEditar && <form className="eg-panel eg-formulario" onSubmit={guardar}><span className="eg-etiqueta">Nueva lectura</span><h2>Registrar consumo</h2>
      <label>Dispositivo<select required value={formulario.dispositivoId} onChange={(e) => setFormulario({ ...formulario, dispositivoId: e.target.value })}><option value="">Selecciona un equipo</option>{dispositivos.map((d) => <option key={d._id} value={d._id}>{d.nombre}</option>)}</select></label>
      <label>Consumo medido (kWh)<input required type="number" min="0" step="0.01" value={formulario.consumoKwh} onChange={(e) => setFormulario({ ...formulario, consumoKwh: e.target.value })} placeholder="0.00" /></label>
      <label>Fecha de lectura<input required type="date" max={hoyTexto} value={formulario.fecha} onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })} /></label>
      <label>Nota <span className="eg-opcional">Opcional</span><textarea maxLength="240" rows="3" value={formulario.nota} onChange={(e) => setFormulario({ ...formulario, nota: e.target.value })} placeholder="Contexto para recordar esta lectura" /></label>
      <button className="eg-boton" type="submit" disabled={!dispositivos.length}>Guardar lectura</button>{!dispositivos.length && <small>Primero agrega un dispositivo.</small>}
    </form>}
    <section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Registro manual</span><h2>Lecturas anteriores</h2></div><span className="eg-contador">{lecturas.length}</span></div>
      {cargando ? <Cargando /> : lecturas.length ? <div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Equipo</th><th>Fecha</th><th>Consumo</th><th>Nota</th></tr></thead><tbody>{lecturas.map((l) => <tr key={l._id}><td>{l.dispositivoId?.nombre || 'Equipo archivado'}</td><td>{new Date(l.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td><strong>{Number(l.consumoKwh).toLocaleString('es')} kWh</strong></td><td>{l.nota || '—'}</td></tr>)}</tbody></table></div> : <div className="eg-vacio"><span>◷</span><strong>No hay lecturas todavía</strong><p>Registra el primer dato para empezar a formar un historial.</p></div>}
    </section></div>
  </MarcoPrivado>;
}

const NUEVO_CONTENIDO = { slug: '', categoria: 'informativo', titulo: '', resumen: '', texto: '', imagenUrl: '', orden: 0, publicado: false };
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
  async function cargar() { setCargando(true); try { const [c, u] = await Promise.all([api.get('/contenido/administrar'), api.get('/usuarios')]); setContenidos(c.data.contenidos || []); setUsuarios(u.data.usuarios || []); setError(''); } catch { setError('No se pudo cargar la administración. Comprueba que tu cuenta tenga rol administrador.'); } finally { setCargando(false); } }
  useEffect(() => { cargar(); }, []);
  if (usuario?.rol !== 'administrador') return <Navigate to="/dashboard" replace />;
  function empezarEdicion(c) { setEditando(c._id); setFormulario({ slug: c.slug, categoria: c.categoria, titulo: c.titulo, resumen: c.resumen || '', texto: c.texto, imagenUrl: c.imagenUrl || '', orden: c.orden || 0, publicado: c.publicado }); }
  function limpiar() { setEditando(''); setFormulario(NUEVO_CONTENIDO); }
  async function guardar(evento) { evento.preventDefault(); setError(''); setMensaje(''); try { if (editando) await api.put(`/contenido/${editando}`, formulario); else await api.post('/contenido', formulario); limpiar(); setMensaje('Contenido guardado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo guardar. Revisa el identificador y los campos obligatorios.'); } }
  async function borrar(id) { if (!window.confirm('¿Eliminar este contenido editorial?')) return; try { await api.delete(`/contenido/${id}`); setMensaje('Contenido eliminado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo eliminar el contenido.'); } }
  async function cambiarRol(id, rol) { setError(''); setMensaje(''); try { await api.patch(`/usuarios/${id}/rol`, { rol }); setMensaje('Rol de cuenta actualizado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo cambiar el rol.'); } }
  return <MarcoPrivado titulo="Administración" descripcion="Actualiza el contenido público y los roles de las cuentas.">
    <ErrorMensaje>{error}</ErrorMensaje>{mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
    <div className="eg-tabs" role="tablist"><button className={pestana === 'contenido' ? 'activo' : ''} onClick={() => setPestana('contenido')} role="tab">Contenido editorial</button><button className={pestana === 'usuarios' ? 'activo' : ''} onClick={() => setPestana('usuarios')} role="tab">Usuarios y roles</button></div>
    {cargando ? <Cargando /> : pestana === 'contenido' ? <div className="eg-admin-layout"><section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Página pública</span><h2>Textos publicados</h2></div><span className="eg-contador">{contenidos.length}</span></div>{contenidos.length ? contenidos.map((c) => <article className="eg-contenido-item" key={c._id}><div><span className={`eg-estado ${c.publicado ? 'eg-estado--publicado' : ''}`}>{c.publicado ? 'Publicado' : 'Borrador'}</span><h3>{c.titulo}</h3><p>{c.resumen || c.texto}</p><small>{c.categoria} · orden {c.orden}</small></div><div className="eg-dispositivo__acciones"><button onClick={() => empezarEdicion(c)}>Editar</button><button className="eg-texto-peligro" onClick={() => borrar(c._id)}>Eliminar</button></div></article>) : <div className="eg-vacio"><strong>No hay contenido todavía</strong><p>Crea la primera sección informativa para la página pública.</p></div>}</section>
      <form className="eg-panel eg-formulario" onSubmit={guardar}><span className="eg-etiqueta">{editando ? 'Editar publicación' : 'Nueva publicación'}</span><h2>{editando ? 'Actualizar texto' : 'Crear contenido'}</h2><label>Identificador único<input required maxLength="100" value={formulario.slug} onChange={(e) => setFormulario({ ...formulario, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="ejemplo-de-contenido" /></label><label>Sección<select value={formulario.categoria} onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}><option value="portada">Portada</option><option value="informativo">Informativo</option><option value="consejo">Consejo</option><option value="pregunta-frecuente">Pregunta frecuente</option></select></label><label>Título<input required maxLength="120" value={formulario.titulo} onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })} /></label><label>Resumen<input maxLength="240" value={formulario.resumen} onChange={(e) => setFormulario({ ...formulario, resumen: e.target.value })} /></label><label>Texto<textarea required rows="5" maxLength="4000" value={formulario.texto} onChange={(e) => setFormulario({ ...formulario, texto: e.target.value })} /></label><label>Dirección de imagen <span className="eg-opcional">Opcional</span><input type="url" maxLength="500" value={formulario.imagenUrl} onChange={(e) => setFormulario({ ...formulario, imagenUrl: e.target.value })} placeholder="https://…" /></label><label>Orden<input type="number" min="0" value={formulario.orden} onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })} /></label><label className="eg-check"><input type="checkbox" checked={formulario.publicado} onChange={(e) => setFormulario({ ...formulario, publicado: e.target.checked })} /> Mostrar en la página pública</label><div className="eg-formulario__acciones"><button className="eg-boton">Guardar</button>{editando && <button className="eg-boton eg-boton--suave" type="button" onClick={limpiar}>Cancelar</button>}</div></form></div> : <section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Acceso a EnerGest</span><h2>Cuentas registradas</h2></div><span className="eg-contador">{usuarios.length}</span></div><div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody>{usuarios.map((u) => <tr key={u._id}><td>{u.nombre}</td><td>{u.email}</td><td><select aria-label={`Rol de ${u.nombre}`} value={u.rol} disabled={u._id === usuario.id} onChange={(e) => cambiarRol(u._id, e.target.value)}><option value="cliente">Cliente</option><option value="analista">Analista</option><option value="administrador">Administrador</option></select></td></tr>)}</tbody></table></div><p className="eg-ayuda">Los analistas pueden consultar sus propios datos. Los clientes pueden registrar equipos y lecturas.</p></section>}
  </MarcoPrivado>;
}