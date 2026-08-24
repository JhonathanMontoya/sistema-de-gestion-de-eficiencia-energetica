import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OndaDeCarga from '../components/OndaDeCarga';
import '../styles/Auth.css';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    try {
      // El backend, al registrar, ya devuelve token + usuario,
      // asi que iniciamos sesion automaticamente sin pedirle
      // que ademas haga login por separado.
      const respuesta = await api.post('/auth/register', { nombre, email, password });
      iniciarSesion(respuesta.data);
      navigate('/dashboard');
    } catch (err) {
      const mensaje =
        err.response?.data?.mensaje || 'No se pudo completar el registro. Intenta de nuevo.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth">
      <section className="auth__brand">
        <div className="auth__brand-content">
          <span className="auth__eyebrow">Producción y consumo responsable</span>
          <h1 className="auth__logo">
            Ener<span>Gest</span>
          </h1>
          <p className="auth__tagline">
            Crea tu cuenta para empezar a monitorear el consumo energético de
            tu operación.
          </p>
          <OndaDeCarga />
          <span className="auth__caption">Carga en tiempo real — planta demo</span>
        </div>
      </section>

      <section className="auth__form-side">
        <form className="auth__form" onSubmit={manejarEnvio} noValidate>
          <h2>Crear cuenta</h2>
          <p className="auth__form-sub">
            Regístrate para acceder al panel de gestión energética.
          </p>

          <label className="auth__label" htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            className="auth__input"
            placeholder="Ana Torres"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            required
          />

          <label className="auth__label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className="auth__input"
            placeholder="analista@energest.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="auth__label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="auth__input"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <label className="auth__label" htmlFor="confirmarPassword">
            Confirmar contraseña
          </label>
          <input
            id="confirmarPassword"
            type="password"
            className="auth__input"
            placeholder="Repite tu contraseña"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="auth__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth__submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="auth__hint">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </form>
      </section>
    </div>
  );
}