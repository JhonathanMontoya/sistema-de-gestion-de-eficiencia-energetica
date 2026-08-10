import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Este contexto guarda quien es el usuario que inicio sesion y expone
// funciones para iniciar/cerrar sesion, para que cualquier pantalla
// de la app pueda saber si hay alguien autenticado.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('energia_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  function iniciarSesion({ token, usuario: datosUsuario }) {
    localStorage.setItem('energia_token', token);
    localStorage.setItem('energia_usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }

  function cerrarSesion() {
    localStorage.removeItem('energia_token');
    localStorage.removeItem('energia_usuario');
    setUsuario(null);
  }

  const value = {
    usuario,
    estaAutenticado: Boolean(usuario),
    iniciarSesion,
    cerrarSesion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}
