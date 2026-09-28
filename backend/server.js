require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dispositivoRoutes = require('./routes/dispositivoRoutes');
const lecturaRoutes = require('./routes/lecturaRoutes');
const contenidoRoutes = require('./routes/contenidoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// Middlewares base
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origen) => origen.trim());
app.use(cors({ origin: origenesPermitidos }));
app.use(express.json({ limit: '100kb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/dispositivos', dispositivoRoutes);
app.use('/api/lecturas', lecturaRoutes);
app.use('/api/contenido', contenidoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta de salud, util para confirmar que el backend esta vivo
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'energia-mvp-backend' });
});

const PORT = process.env.PORT || 5000;

// Primero conectamos a la BD, y solo si eso funciona levantamos el servidor.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Backend corriendo en http://localhost:${PORT}`);
  });
});
