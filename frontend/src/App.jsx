import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Register from './pages/Register';
import { InicioEnergest, AdministracionEnergest } from './pages/PortalEnergest.jsx';
import ConsumoEnergest from './pages/ConsumoEnergest';
import DispositivosEnergest from './pages/DispositivosEnergest';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InicioEnergest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/consumo" element={<RutaProtegida><ConsumoEnergest /></RutaProtegida>} />
          <Route path="/dispositivos" element={<RutaProtegida><DispositivosEnergest /></RutaProtegida>} />
          <Route path="/dashboard" element={<RutaProtegida><Navigate to="/consumo" replace /></RutaProtegida>} />
          <Route path="/lecturas" element={<RutaProtegida><Navigate to="/consumo" replace /></RutaProtegida>} />
          <Route path="/administrar" element={<RutaProtegida><AdministracionEnergest /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}