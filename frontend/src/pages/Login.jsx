import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OndaDeCarga from '../components/OndaDeCarga';
import '../styles/Login.css';

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
    <div className="login">
      <section className="login__brand">
        <div className="login__brand-content">
          <span className="login__eyebrow">Producción y consumo responsable</span>
          <h1 className="login__logo">
            Ener<span>Gest</span>
          </h1>
          <p className="login__tagline">
            Monitorea el consumo, detecta desperdicio y reduce la huella
            energética de tu operación.
          </p>
          <OndaDeCarga />
          <span className="login__caption">Carga en tiempo real — planta demo</span>
        </div>
      </section>

      <section className="login__form-side">
        <form className="login__form" onSubmit={manejarEnvio} noValidate>
          <h2>Iniciar sesión</h2>
          <p className="login__form-sub">
            Ingresa con tu cuenta para acceder al panel de gestión energética.
          </p>

          <label className="login__label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className="login__input"
            placeholder="analista@energest.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="login__label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="login__input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login__submit" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Entrar'}
          </button>

          <p className="login__hint">
            ¿Aún no tienes una cuenta de prueba? Créala con el endpoint{' '}
            <code>POST /api/auth/register</code> (ver README).
          </p>
        </form>
      </section>
    </div>
  );
}
