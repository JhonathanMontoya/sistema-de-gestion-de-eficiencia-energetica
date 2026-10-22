import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OndaDeCarga from '../components/OndaDeCarga';
import '../styles/Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await api.post('/auth/login', { email, password });
      iniciarSesion(respuesta.data);
      navigate('/dashboard');
    } catch (err) {
      const mensaje =
        err.response?.data?.mensaje || 'No se pudo iniciar sesion. Intenta de nuevo.';
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
            Monitorea el consumo, detecta desperdicio y reduce la huella
            energética de tu operación.
          </p>
          <OndaDeCarga />
          <span className="auth__caption">Carga en tiempo real — planta demo</span>
        </div>
      </section>

      <section className="auth__form-side">
        <form className="auth__form" onSubmit={manejarEnvio} noValidate>
          <h2>Iniciar sesión</h2>
          <p className="auth__form-sub">
            Ingresa con tu cuenta para acceder al panel de gestión energética.
          </p>

          <label className="auth__label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className="auth__input"
            placeholder="tu correo registrado"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="auth__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth__submit" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Entrar'}
          </button>

          <p className="auth__hint">
            ¿Aún no tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </form>
      </section>
    </div>
  );
}