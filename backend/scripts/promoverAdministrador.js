require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function promoverAdministradores() {
  const correos = [...new Set(process.argv.slice(2).map((correo) => correo.trim().toLowerCase()).filter(Boolean))];
  if (correos.length < 1 || correos.length > 2) {
    console.error('Uso: npm run promover-administrador -- correo1@ejemplo.com [correo2@ejemplo.com]');
    process.exitCode = 1;
    return;
  }

  await connectDB();
  try {
    const usuarios = await User.find({ email: { $in: correos } }).select('nombre email rol');
    const encontrados = new Set(usuarios.map((usuario) => usuario.email));
    const faltantes = correos.filter((correo) => !encontrados.has(correo));
    if (faltantes.length) {
      console.error('No se encontraron estas cuentas: ' + faltantes.join(', ') + '. Regístralas primero como clientes.');
      process.exitCode = 1;
      return;
    }

    await User.updateMany({ email: { $in: correos } }, { $set: { rol: 'administrador' } }, { runValidators: true });
    for (const usuario of usuarios) console.log('Rol actualizado: ' + usuario.email + ' ahora es administrador.');
  } catch (error) {
    console.error('No se pudo asignar el rol de administrador:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

promoverAdministradores();
