const lecturaHogarService = require('../services/lecturaHogarService');
const manejarError = require('./manejarError');

function lecturaPublica(lectura) {
  const objeto = lectura.toObject ? lectura.toObject() : lectura;
  const { usuarioId, ...respuesta } = objeto;
  return respuesta;
}

async function listar(req, res) {
  try {
    const lecturas = await lecturaHogarService.listar(req.usuarioId, req.query);
    return res.json({ lecturas: lecturas.map(lecturaPublica) });
  } catch (error) {
    return manejarError(res, error, { contexto: 'lecturaHogarController.listar', mensaje: 'No se pudieron cargar las lecturas del hogar' });
  }
}

async function crear(req, res) {
  try {
    const lectura = await lecturaHogarService.crear(req.usuarioId, req.body);
    return res.status(201).json({ mensaje: 'Lectura del hogar registrada', lectura: lecturaPublica(lectura) });
  } catch (error) {
    return manejarError(res, error, {
      contexto: 'lecturaHogarController.crear', mensaje: 'No se pudo registrar la lectura del hogar',
      validacion: 'Revisa el consumo, el periodo, la fuente y el valor de la factura',
      duplicado: 'Ya existe una lectura del hogar para ese periodo exacto',
    });
  }
}

async function reemplazar(req, res) {
  try {
    const lectura = await lecturaHogarService.reemplazar(req.usuarioId, req.params.id, req.body);
    return res.json({ mensaje: 'Lectura del hogar actualizada', lectura: lecturaPublica(lectura) });
  } catch (error) {
    return manejarError(res, error, {
      contexto: 'lecturaHogarController.reemplazar', mensaje: 'No se pudo actualizar la lectura del hogar',
      validacion: 'Revisa el identificador, el consumo, el periodo, la fuente y el valor de la factura',
      duplicado: 'Ya existe una lectura del hogar para ese periodo exacto',
    });
  }
}

async function eliminar(req, res) {
  try {
    await lecturaHogarService.eliminar(req.usuarioId, req.params.id);
    return res.json({ mensaje: 'Lectura del hogar eliminada' });
  } catch (error) {
    return manejarError(res, error, { contexto: 'lecturaHogarController.eliminar', mensaje: 'No se pudo eliminar la lectura del hogar' });
  }
}

module.exports = { listar, crear, reemplazar, eliminar };
