// Elemento "firma" del diseño: simula la onda de carga de una red electrica
// (como la que verias en un SCADA), no es un grafico decorativo generico.
export default function OndaDeCarga() {
  return (
    <svg
      className="onda-carga"
      viewBox="0 0 600 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fadeOnda" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f2b705" stopOpacity="0" />
          <stop offset="15%" stopColor="#f2b705" stopOpacity="1" />
          <stop offset="85%" stopColor="#00c2a8" stopOpacity="1" />
          <stop offset="100%" stopColor="#00c2a8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="onda-carga__linea"
        d="M0,80 L60,80 L90,30 L120,130 L150,80 L220,80 L250,50 L280,110 L310,80 L380,80 L410,20 L440,140 L470,80 L600,80"
        fill="none"
        stroke="url(#fadeOnda)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
