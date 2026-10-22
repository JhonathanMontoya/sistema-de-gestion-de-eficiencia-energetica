const ConfiguracionAcceso = require('../models/ConfiguracionAcceso');
const DOMINIOS_POR_DEFECTO = ['gmail.com', 'unac.edu.co'];

async function obtenerConfiguracionPublica(req, res) {
  try {
    const configuracion = await ConfiguracionAcceso.findOne({ clave: 'registro' }).lean();
    return res.json({ dominios: configuracion?.dominios?.length ? configuracion.dominios : DOMINIOS_POR_DEFECTO });
  } catch (error) {
    console.error('[configuracionController.obtenerConfiguracionPublica]', error);
    return res.status(500).json({ mensaje: 'No se pudo cargar la configuración' });
  }
}

async function actualizarDominios(req, res) {
  const recibidos = req.body?.dominios;
  if (!Array.isArray(recibidos) || recibidos.length === 0 || recibidos.length > 20) {
    return res.status(400).json({ mensaje: 'Indica entre 1 y 20 dominios permitidos' });
  }
  const dominios = [...new Set(recibidos.map((valor) => typeof valor === 'string' ? valor.trim().toLowerCase().replace(/^@/, '') : ''))];
  const patron = /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
  if (dominios.some((dominio) => !patron.test(dominio))) {
    return res.status(400).json({ mensaje: 'Uno o más dominios no tienen un formato válido' });
  }
  try {
    const configuracion = await ConfiguracionAcceso.findOneAndUpdate(
      { clave: 'registro' }, { $set: { dominios } }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json({ mensaje: 'Dominios permitidos actualizados', dominios: configuracion.dominios });
  } catch (error) {
    console.error('[configuracionController.actualizarDominios]', error);
    return res.status(500).json({ mensaje: 'No se pudo guardar la configuración' });
  }
}

module.exports = { obtenerConfiguracionPublica, actualizarDominios };
