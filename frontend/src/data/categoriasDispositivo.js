// Categorias de dispositivos y su potencia tipica en watts.
// El "valor" debe coincidir con las categorías del modelo backend Dispositivo.
export const CATEGORIAS = [
  { valor: 'aire_acondicionado', etiqueta: 'Aire acondicionado', wattsTipicos: 1200 },
  { valor: 'nevera', etiqueta: 'Nevera', wattsTipicos: 200 },
  { valor: 'iluminacion', etiqueta: 'Iluminación (bombillo LED)', wattsTipicos: 10 },
  { valor: 'computador', etiqueta: 'Computador', wattsTipicos: 250 },
  { valor: 'televisor', etiqueta: 'Televisor', wattsTipicos: 100 },
  { valor: 'lavadora', etiqueta: 'Lavadora', wattsTipicos: 500 },
  { valor: 'otro', etiqueta: 'Otro', wattsTipicos: null },
];

export function buscarCategoria(valor) {
  return CATEGORIAS.find((categoria) => categoria.valor === valor);
}
