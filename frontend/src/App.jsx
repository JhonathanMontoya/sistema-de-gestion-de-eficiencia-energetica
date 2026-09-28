import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Register from './pages/Register';
import {
  InicioEnergest,
  PanelEnergest,
  DispositivosEnergest,
  LecturasEnergest,
  AdministracionEnergest,
} from './pages/PortalEnergest.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InicioEnergest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RutaProtegida><PanelEnergest /></RutaProtegida>} />
          <Route path="/dispositivos" element={<RutaProtegida><DispositivosEnergest /></RutaProtegida>} />
          <Route path="/lecturas" element={<RutaProtegida><LecturasEnergest /></RutaProtegida>} />
          <Route path="/administrar" element={<RutaProtegida><AdministracionEnergest /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}