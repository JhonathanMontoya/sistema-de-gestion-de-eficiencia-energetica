import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LamparaInteractiva from '../components/LamparaInteractiva';
import OndaDeCarga from '../components/OndaDeCarga';
import '../styles/Auth.css';

const DESTINOS_PERMITIDOS = ['/consumo', '/dispositivos'];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [lamparaEncendida, setLamparaEncendida] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const temporizador = useRef(null);
  const emailRef = useRef(null);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const redireccionSolicitada = new URLSearchParams(window.location.search).get('redirect');
  const destino = DESTINOS_PERMITIDOS.includes(redireccionSolicitada) ? redireccionSolicitada : '/dispositivos';

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  useEffect(() => {
    if (!mostrarFormulario) return undefined;
    const cuadro = window.requestAnimationFrame(() => emailRef.current?.focus());
    return () => window.cancelAnimationFrame(cuadro);
  }, [mostrarFormulario]);

  function encenderLampara() {
    if (lamparaEncendida) return;
    setLamparaEncendida(true);
    temporizador.current = window.setTimeout(() => setMostrarFormulario(true), 850);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await api.post('/auth/login', { email, password });
      iniciarSesion(respuesta.data);
      navigate(destino);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className={'auth auth--lamp' + (mostrarFormulario ? ' auth--lit' : '') + (lamparaEncendida ? ' auth--ignited' : '')}>
      <section className="auth__brand" aria-label="Bienvenida a EnerGest">
        <Link to="/" className="auth__brand-mark" aria-label="EnerGest, volver al inicio">
          <span className="auth__brand-mark-icon" aria-hidden="true">✳</span>
          <span>Ener<strong>Gest</strong></span>
          <small>GESTIÓN ENERGÉTICA PERSONAL</small>
        </Link>

        <div className="auth__brand-content">
          <div className="auth__intro">
            <span className="auth__eyebrow"><i /> ENERGÍA · DATOS · DECISIONES</span>
            <h1>{mostrarFormulario ? <>La energía <span>empieza contigo.</span></> : <>Enciende una nueva forma de <span>entender tu energía.</span></>}</h1>
            <p>Organiza tus dispositivos, registra consumos y descubre qué puedes mejorar en tu hogar.</p>
            {!mostrarFormulario && <div className="auth__pull-instruction"><span className="auth__pull-icon" aria-hidden="true">↧</span><span>Enciende la lámpara tirando de la cuerda para iniciar sesión</span></div>}
            {mostrarFormulario && <div className="auth__light-confirmation" role="status"><span aria-hidden="true">✦</span> Circuito activado. Tu espacio está listo.</div>}
            <div className="auth__wave"><OndaDeCarga /></div>
            <div className="auth__metrics" aria-label="Herramientas de EnerGest">
              <span><b>01</b> Dispositivos</span><span><b>02</b> Consumo</span><span><b>03</b> Eficiencia</span>
            </div>
          </div>
          <LamparaInteractiva encendida={lamparaEncendida} onEncender={encenderLampara} />
        </div>
        <div className="auth__footer-note"><span className="auth__live-dot" /> DATOS PERSONALES · ESPACIO PRIVADO</div>
      </section>

      {mostrarFormulario && <section className="auth__form-side" aria-label="Formulario de inicio de sesión">
        <form className="auth__form" onSubmit={manejarEnvio} noValidate>
          <div className="auth__form-mark" aria-hidden="true">✳</div>
          <span className="auth__form-kicker">BIENVENIDO DE NUEVO</span>
          <h2>Inicia sesión</h2>
          <p className="auth__form-sub">Entra a tu espacio y revisa la energía de tus dispositivos y tu hogar.</p>

          <label className="auth__label" htmlFor="email">Correo electrónico</label>
          <input
            ref={emailRef}
            id="email"
            type="email"
            className="auth__input"
            placeholder="tu correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="auth__label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="auth__input"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="auth__error" role="alert">{error}</p>}

          <button type="submit" className="auth__submit" disabled={cargando}>
            {cargando ? <><span className="auth__spinner" aria-hidden="true" /> Verificando…</> : <>Entrar a EnerGest <span aria-hidden="true">→</span></>}
          </button>

          <p className="auth__hint">¿Aún no tienes cuenta? <Link to={`/register?redirect=${encodeURIComponent(destino)}`}>Crea tu cuenta</Link></p>
          <p className="auth__privacy"><span aria-hidden="true">▣</span> Tus consumos solo son visibles desde tu cuenta.</p>
        </form>
      </section>}
    </main>
  );
}
