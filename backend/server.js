require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

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
