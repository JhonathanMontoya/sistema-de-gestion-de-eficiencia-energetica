require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function promoverAdministrador() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Uso: npm run promover-administrador -- correo@ejemplo.com');
    process.exitCode = 1;
    return;
  }

  await connectDB();
  try {
    const usuario = await User.findOneAndUpdate(
      { email },
      { rol: 'administrador' },
      { new: true, runValidators: true }
    ).select('nombre email rol');

    if (!usuario) {
      console.error('No se encontró una cuenta con ese correo. Regístrala primero como cliente.');
      process.exitCode = 1;
      return;
    }

    console.log(`Rol actualizado: ${usuario.email} ahora es administrador.`);
  } catch (error) {
    console.error('No se pudo asignar el rol de administrador:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

promoverAdministrador();
