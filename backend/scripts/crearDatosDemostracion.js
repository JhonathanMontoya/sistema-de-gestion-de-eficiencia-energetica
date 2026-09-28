require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');

async function asegurarCuenta({ nombre, email, rol }) {
  let usuario = await User.findOne({ email });
  if (usuario) {
    if (rol === 'administrador' && usuario.rol !== 'administrador') {
      usuario.rol = 'administrador';
      await usuario.save();
    }
    return { usuario, password: null };
  }

  const password = crypto.randomBytes(18).toString('base64url');
  const hash = await bcrypt.hash(password, 10);
  usuario = await User.create({ nombre, email, password: hash, rol: 'cliente' });
  if (rol === 'administrador') {
    usuario.rol = 'administrador';
    await usuario.save();
  }
  return { usuario, password };
}

async function asegurarDispositivo(usuarioId, datos) {
  let dispositivo = await Dispositivo.findOne({ usuarioId, nombre: datos.nombre });
  if (!dispositivo) dispositivo = await Dispositivo.create({ usuarioId, ...datos });
  return dispositivo;
}

async function crearDatosDemostracion() {
  await connectDB();
  try {
    const admin = await asegurarCuenta({
      nombre: 'Administración EnerGest',
      email: 'administrador@energest.test',
      rol: 'administrador',
    });
    const cliente = await asegurarCuenta({
      nombre: 'Cliente Demostración',
      email: 'cliente@energest.test',
      rol: 'cliente',
    });

    const usuarioId = cliente.usuario._id;
    const dispositivos = await Promise.all([
      asegurarDispositivo(usuarioId, {
        nombre: 'Portátil de estudio', tipo: 'Computador', categoria: 'computador',
        potenciaWatts: 65, horasUsoDiarias: 6, consumoEstimadoKwhDia: 0.39, ubicacion: 'Escritorio',
      }),
      asegurarDispositivo(usuarioId, {
        nombre: 'Televisor de la sala', tipo: 'Televisor', categoria: 'televisor',
        potenciaWatts: 90, horasUsoDiarias: 4, consumoEstimadoKwhDia: 0.36, ubicacion: 'Sala',
      }),
      asegurarDispositivo(usuarioId, {
        nombre: 'Iluminación del dormitorio', tipo: 'Iluminación', categoria: 'iluminacion',
        potenciaWatts: 24, horasUsoDiarias: 5, consumoEstimadoKwhDia: 0.12, ubicacion: 'Dormitorio',
      }),
    ]);

    let lecturasCreadas = 0;
    if (await Lectura.countDocuments({ usuarioId }) === 0) {
      const consumos = [
        [0.36, 0.35, 0.38],
        [0.34, 0.4, 0.33],
        [0.11, 0.12, 0.1],
      ];
      const lecturas = [];
      dispositivos.forEach((dispositivo, i) => {
        for (let diasAtras = 0; diasAtras < 3; diasAtras += 1) {
          const fecha = new Date();
          fecha.setDate(fecha.getDate() - diasAtras);
          fecha.setHours(12, 0, 0, 0);
          lecturas.push({
            usuarioId,
            dispositivoId: dispositivo._id,
            consumoKwh: consumos[i][diasAtras],
            fecha,
            nota: 'Registro de demostración',
          });
        }
      });
      await Lectura.insertMany(lecturas);
      lecturasCreadas = lecturas.length;
    }

    console.log('Datos de demostración disponibles: 1 administrador, 1 cliente, 3 dispositivos y 9 lecturas.');
    if (admin.password) console.log(`ADMIN ${admin.usuario.email} / ${admin.password}`);
    else console.log(`ADMIN ${admin.usuario.email} (ya existía; contraseña conservada)`);
    if (cliente.password) console.log(`CLIENTE ${cliente.usuario.email} / ${cliente.password}`);
    else console.log(`CLIENTE ${cliente.usuario.email} (ya existía; contraseña conservada)`);
    if (lecturasCreadas === 0) console.log('El cliente ya tenía lecturas; no se duplicaron.');
  } catch (error) {
    console.error('No se pudieron preparar los datos de demostración:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

crearDatosDemostracion();
