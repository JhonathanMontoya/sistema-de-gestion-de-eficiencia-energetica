const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI no esta definida en el archivo .env');
    }

    await mongoose.connect(uri);

    console.log(`[DB] Conectado a MongoDB -> ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[DB] Error al conectar a MongoDB:', error.message);
    // Sin base de datos el sistema no puede funcionar, así que detenemos el proceso.
    process.exit(1);
  }
}

module.exports = connectDB;
