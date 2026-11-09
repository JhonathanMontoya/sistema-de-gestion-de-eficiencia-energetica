class ErrorAplicacion extends Error {
  constructor(codigo, message) {
    super(message);
    this.name = 'ErrorAplicacion';
    this.codigo = codigo;
  }
}

module.exports = { ErrorAplicacion };
