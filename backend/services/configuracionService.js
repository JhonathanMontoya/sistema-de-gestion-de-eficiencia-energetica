const ConfiguracionAcceso = require('../models/ConfiguracionAcceso');
const { ErrorAplicacion } = require('./errores');

const DOMINIOS_POR_DEFECTO = ['gmail.com', 'unac.edu.co'];
const PATRON_DOMINIO = /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

async function obtenerPublica() {
  const configuracion = await ConfiguracionAcceso.findOne({ clave: 'registro' }).lean();
  return { dominios: configuracion?.dominios?.length ? configuracion.dominios : DOMINIOS_POR_DEFECTO };
}

async function actualizarDominios(recibidos) {
  if (!Array.isArray(recibidos) || recibidos.length === 0 || recibidos.length > 20) {
    throw new ErrorAplicacion('VALIDACION', 'Indica entre 1 y 20 dominios permitidos');
  }
  const dominios = [...new Set(recibidos.map((valor) => typeof valor === 'string' ? valor.trim().toLowerCase().replace(/^@/, '') : ''))];
  if (dominios.some((dominio) => !PATRON_DOMINIO.test(dominio))) {
    throw new ErrorAplicacion('VALIDACION', 'Uno o más dominios no tienen un formato válido');
  }
  const configuracion = await ConfiguracionAcceso.findOneAndUpdate(
    { clave: 'registro' },
    { $set: { dominios } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return configuracion.dominios;
}

module.exports = { obtenerPublica, actualizarDominios };
