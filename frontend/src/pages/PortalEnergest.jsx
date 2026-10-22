import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavegacionEnergest from '../components/NavegacionEnergest';
import MarcoEnergest from '../components/MarcoEnergest';
import { CAMBIOS_EFICIENCIA } from '../data/cambiosEficiencia';
import { BENEFICIOS_GESTION } from '../data/beneficiosGestion';
import '../styles/PortalEnergest.css';

function ErrorMensaje({ children }) {
  return children ? <p className="eg-alerta" role="alert">{children}</p> : null;
}

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
  const destacados = contenidos.filter((item) => item.categoria !== 'portada');
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
            <div className="eg-carrusel__imagen" style={actual.imagenUrl ? { backgroundImage: 'linear-gradient(0deg, #133d2aaa, transparent), url("' + actual.imagenUrl + '")' } : undefined}><span>ENERGEST · {actual.categoria.replace('-', ' ')}</span></div>
            <div className="eg-carrusel__texto"><h3>{actual.titulo}</h3><p>{actual.resumen}</p><p>{actual.texto}</p>{actual.fuenteUrl && <a className="eg-enlace" href={actual.fuenteUrl} target="_blank" rel="noreferrer">Fuente: {actual.fuente || 'Consultar referencia'} ↗</a>}<div className="eg-carrusel__puntos">{destacados.map((item, i) => <button type="button" key={item.slug} className={i === indice ? 'activo' : ''} onClick={() => setIndice(i)} aria-label={'Ver contenido ' + (i + 1)} aria-pressed={i === indice} />)}</div></div>
          </article> : <p className="eg-vacio">El contenido informativo aparecerá aquí cuando esté publicado.</p>}
        </section>

        <section className="eg-aprende eg-aprende--gerson">
          <div className="eg-seccion-titulo"><span className="eg-etiqueta">Aprende sobre eficiencia energética</span><h2>Qué está cambiando y por qué importa</h2></div>
          <div className="eg-info-grid">{CAMBIOS_EFICIENCIA.map((item) => <details className="eg-info-card" key={item.titulo}><summary><strong>{item.titulo}</strong><span>{item.descripcion}</span><small>Leer más</small></summary><p>{item.contenido}</p></details>)}</div>
          <div className="eg-seccion-titulo eg-seccion-titulo--secundario"><span className="eg-etiqueta">Gestión energética</span><h2>Beneficios de gestionar mejor</h2></div>
          <div className="eg-info-grid">{BENEFICIOS_GESTION.map((item) => <details className="eg-info-card" key={item.titulo}><summary><strong>{item.titulo}</strong><span>{item.descripcion}</span><small>Leer más</small></summary><p>{item.contenido}</p></details>)}</div>
        </section>

        <section className="eg-cta"><div><span className="eg-etiqueta">Tu información, organizada</span><h2>Empieza con lo que tienes hoy.</h2><p>Crea una cuenta para guardar tus dispositivos y construir un historial de consumo. Solo se aceptan correos @gmail.com y @unac.edu.co.</p></div><Link className="eg-boton eg-boton--claro" to="/register">Crear mi cuenta <span aria-hidden="true">→</span></Link></section>
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
  async function cargar() { setCargando(true); try { const [c, u] = await Promise.all([api.get('/contenido/administrar'), api.get('/usuarios')]); setContenidos(c.data.contenidos || []); setUsuarios(u.data.usuarios || []); setError(''); } catch { setError('No se pudo cargar la administración. Comprueba que tu cuenta tenga rol administrador.'); } finally { setCargando(false); } }
  useEffect(() => { cargar(); }, []);
  if (usuario?.rol !== 'administrador') return <Navigate to="/dashboard" replace />;
  function empezarEdicion(c) { setEditando(c._id); setFormulario({ slug: c.slug, categoria: c.categoria, titulo: c.titulo, resumen: c.resumen || '', texto: c.texto, imagenUrl: c.imagenUrl || '', fuente: c.fuente || '', fuenteUrl: c.fuenteUrl || '', orden: c.orden || 0, publicado: c.publicado }); }
  function limpiar() { setEditando(''); setFormulario(NUEVO_CONTENIDO); }
  async function guardar(evento) { evento.preventDefault(); setError(''); setMensaje(''); try { if (editando) await api.put(`/contenido/${editando}`, formulario); else await api.post('/contenido', formulario); limpiar(); setMensaje('Contenido guardado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo guardar. Revisa el identificador y los campos obligatorios.'); } }
  async function borrar(id) { if (!window.confirm('¿Eliminar este contenido editorial?')) return; try { await api.delete(`/contenido/${id}`); setMensaje('Contenido eliminado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo eliminar el contenido.'); } }
  async function cambiarRol(id, rol) { setError(''); setMensaje(''); try { await api.patch(`/usuarios/${id}/rol`, { rol }); setMensaje('Rol de cuenta actualizado.'); await cargar(); } catch (err) { setError(err.response?.data?.mensaje || 'No se pudo cambiar el rol.'); } }
  return <MarcoPrivado titulo="Administración" descripcion="Actualiza el contenido público y los roles de las cuentas.">
    <ErrorMensaje>{error}</ErrorMensaje>{mensaje && <p className="eg-exito" role="status">{mensaje}</p>}
    <div className="eg-tabs" role="tablist"><button className={pestana === 'contenido' ? 'activo' : ''} onClick={() => setPestana('contenido')} role="tab">Contenido editorial</button><button className={pestana === 'usuarios' ? 'activo' : ''} onClick={() => setPestana('usuarios')} role="tab">Usuarios y roles</button></div>
    {cargando ? <Cargando /> : pestana === 'contenido' ? <div className="eg-admin-layout"><section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Página pública</span><h2>Textos publicados</h2></div><span className="eg-contador">{contenidos.length}</span></div>{contenidos.length ? contenidos.map((c) => <article className="eg-contenido-item" key={c._id}><div><span className={`eg-estado ${c.publicado ? 'eg-estado--publicado' : ''}`}>{c.publicado ? 'Publicado' : 'Borrador'}</span><h3>{c.titulo}</h3><p>{c.resumen || c.texto}</p><small>{c.categoria} · orden {c.orden}</small></div><div className="eg-dispositivo__acciones"><button onClick={() => empezarEdicion(c)}>Editar</button><button className="eg-texto-peligro" onClick={() => borrar(c._id)}>Eliminar</button></div></article>) : <div className="eg-vacio"><strong>No hay contenido todavía</strong><p>Crea la primera sección informativa para la página pública.</p></div>}</section>
      <form className="eg-panel eg-formulario" onSubmit={guardar}><span className="eg-etiqueta">{editando ? 'Editar publicación' : 'Nueva publicación'}</span><h2>{editando ? 'Actualizar texto' : 'Crear contenido'}</h2><label>Identificador único<input required maxLength="100" value={formulario.slug} onChange={(e) => setFormulario({ ...formulario, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="ejemplo-de-contenido" /></label><label>Sección<select value={formulario.categoria} onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}><option value="portada">Portada</option><option value="informativo">Informativo</option><option value="consejo">Consejo</option><option value="pregunta-frecuente">Pregunta frecuente</option></select></label><label>Título<input required maxLength="120" value={formulario.titulo} onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })} /></label><label>Resumen<input maxLength="240" value={formulario.resumen} onChange={(e) => setFormulario({ ...formulario, resumen: e.target.value })} /></label><label>Texto<textarea required rows="5" maxLength="4000" value={formulario.texto} onChange={(e) => setFormulario({ ...formulario, texto: e.target.value })} /></label><label>Nombre de la fuente <span className="eg-opcional">Opcional</span><input maxLength="160" value={formulario.fuente} onChange={(e) => setFormulario({ ...formulario, fuente: e.target.value })} placeholder="Ej. Ministerio de Minas y Energía" /></label><label>Enlace de la fuente <span className="eg-opcional">Opcional</span><input type="url" maxLength="500" value={formulario.fuenteUrl} onChange={(e) => setFormulario({ ...formulario, fuenteUrl: e.target.value })} placeholder="https://…" /></label><label>Dirección de imagen <span className="eg-opcional">Opcional</span><input type="url" maxLength="500" value={formulario.imagenUrl} onChange={(e) => setFormulario({ ...formulario, imagenUrl: e.target.value })} placeholder="https://…" /></label><label>Orden<input type="number" min="0" value={formulario.orden} onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })} /></label><label className="eg-check"><input type="checkbox" checked={formulario.publicado} onChange={(e) => setFormulario({ ...formulario, publicado: e.target.checked })} /> Mostrar en la página pública</label><div className="eg-formulario__acciones"><button className="eg-boton" type="submit">Guardar</button>{editando && <button className="eg-boton eg-boton--suave" type="button" onClick={limpiar}>Cancelar</button>}</div></form></div> : <section className="eg-panel"><div className="eg-panel__cabecera"><div><span className="eg-etiqueta">Acceso a EnerGest</span><h2>Cuentas registradas</h2></div><span className="eg-contador">{usuarios.length}</span></div><div className="eg-tabla-wrap"><table className="eg-tabla"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody>{usuarios.map((u) => <tr key={u._id}><td>{u.nombre}</td><td>{u.email}</td><td><select aria-label={`Rol de ${u.nombre}`} value={u.rol} disabled={u._id === usuario.id} onChange={(e) => cambiarRol(u._id, e.target.value)}><option value="cliente">Cliente</option><option value="analista">Analista</option><option value="administrador">Administrador</option></select></td></tr>)}</tbody></table></div><p className="eg-ayuda">Los analistas pueden consultar sus propios datos. Los clientes pueden registrar equipos y lecturas.</p></section>}
  </MarcoPrivado>;
}
