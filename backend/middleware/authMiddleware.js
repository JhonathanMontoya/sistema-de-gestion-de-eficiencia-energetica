const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifica que la peticion traiga un token valido en el header:
// Authorization: Bearer <token>
async function protegerRuta(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado, falta el token' });
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }

  try {
    const usuario = await User.findById(payload.id).select('_id rol');
    if (!usuario) {
      return res.status(401).json({ mensaje: 'La cuenta ya no está disponible' });
    }
    req.usuarioId = usuario._id.toString();
    // El rol se consulta en MongoDB para que un cambio de permisos sea efectivo
    // aunque el usuario todavía conserve un token anterior.
    req.usuarioRol = usuario.rol;
    next();
  } catch (error) {
    console.error('[authMiddleware.protegerRuta]', error);
    return res.status(500).json({ mensaje: 'No se pudo validar la sesión' });
  }
}

function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuarioRol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
}

module.exports = protegerRuta;
module.exports.permitirRoles = permitirRoles;
