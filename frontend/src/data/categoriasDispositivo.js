// Categorías, potencias típicas y rangos de referencia orientativos en watts.
// El "valor" debe coincidir con las categorías del modelo backend Dispositivo.
export const CATEGORIAS = [
  { valor: 'aire_acondicionado', etiqueta: 'Aire acondicionado', wattsTipicos: 1200, wattsMin: 700, wattsMax: 2000 },
  { valor: 'nevera', etiqueta: 'Nevera', wattsTipicos: 200, wattsMin: 80, wattsMax: 400 },
  { valor: 'iluminacion', etiqueta: 'Iluminación (bombillo LED)', wattsTipicos: 10, wattsMin: 5, wattsMax: 20 },
  { valor: 'computador', etiqueta: 'Computador', wattsTipicos: 250, wattsMin: 50, wattsMax: 500 },
  { valor: 'televisor', etiqueta: 'Televisor', wattsTipicos: 100, wattsMin: 30, wattsMax: 300 },
  { valor: 'lavadora', etiqueta: 'Lavadora', wattsTipicos: 500, wattsMin: 300, wattsMax: 1000 },
  { valor: 'otro', etiqueta: 'Otro', wattsTipicos: null, wattsMin: null, wattsMax: null },
];

export function buscarCategoria(valor) {
  return CATEGORIAS.find((categoria) => categoria.valor === valor);
}
