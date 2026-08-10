const jwt = require('jsonwebtoken');

// Verifica que la peticion traiga un token valido en el header:
// Authorization: Bearer <token>
function protegerRuta(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado, falta el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    req.usuarioRol = payload.rol;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
}

module.exports = protegerRuta;
