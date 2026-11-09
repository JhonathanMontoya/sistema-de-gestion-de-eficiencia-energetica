import '../styles/LamparaParedRegistro.css';

export default function LamparaParedRegistro({ encendida, onAlternar }) {
  return (
    <div className={'registro-lampara' + (encendida ? ' registro-lampara--encendida' : '')}>
      <svg className="registro-lampara__dibujo" viewBox="0 0 440 420" role="img" aria-label={encendida ? 'Lámpara de pared encendida' : 'Lámpara de pared apagada con cuerda'}>
        <defs>
          <radialGradient id="registro-resplandor"><stop stopColor="#fff5c1" stopOpacity=".86" /><stop offset=".48" stopColor="#ffe19a" stopOpacity=".35" /><stop offset="1" stopColor="#ffe19a" stopOpacity="0" /></radialGradient>
          <linearGradient id="registro-pantalla" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#303632" /><stop offset=".48" stopColor="#111714" /><stop offset="1" stopColor="#5d6258" /></linearGradient>
          <linearGradient id="registro-metal" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#111613" /><stop offset=".5" stopColor="#454a43" /><stop offset="1" stopColor="#171c18" /></linearGradient>
          <filter id="registro-desenfoque"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="registro-sombra"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#1c281e" floodOpacity=".24" /></filter>
        </defs>
        <ellipse className="registro-lampara__luz" cx="283" cy="241" rx="146" ry="155" fill="url(#registro-resplandor)" filter="url(#registro-desenfoque)" />
        <path d="M48 191v52c0 8 7 14 15 14h28v-80H63c-8 0-15 6-15 14Z" fill="url(#registro-metal)" filter="url(#registro-sombra)" />
        <circle cx="76" cy="217" r="5" fill="#aeb0a6" />
        <path d="M77 205V157c0-47 34-80 77-80h76c22 0 39 17 39 39v42" fill="none" stroke="#101613" strokeWidth="13" strokeLinecap="round" />
        <path d="M77 205V157c0-47 34-80 77-80h76c22 0 39 17 39 39v42" fill="none" stroke="#68716a" strokeOpacity=".42" strokeWidth="3" strokeLinecap="round" />
        <g filter="url(#registro-sombra)">
          <path d="M229 131h81l31 49c-29 19-113 19-142 0l30-49Z" fill="url(#registro-pantalla)" />
          <ellipse cx="269.5" cy="180" rx="71.5" ry="10" fill="#161b17" />
          <path d="M251 131c0-12 8-21 19-21s19 9 19 21" fill="#252b26" />
          <path d="M251 124h38v9h-38z" fill="#161b18" />
        </g>
        <path className="registro-lampara__haz" d="M209 184h121l91 179H126l83-179Z" fill="#ffedbb" opacity=".18" />
        <path d="M310 182c0 37-6 52-12 78" fill="none" stroke="#343a34" strokeWidth="2.5" />
        <circle cx="296" cy="265" r="5" fill="#343a34" />
        <rect x="291" y="268" width="10" height="20" rx="4" fill="#343a34" />
      </svg>
      <button type="button" className="registro-lampara__cuerda" onClick={onAlternar} aria-label={encendida ? 'Apagar la lámpara tirando de la cuerda' : 'Encender la lámpara tirando de la cuerda'} aria-pressed={encendida}>
        <span />
      </button>
      <span className="registro-lampara__instruccion" aria-live="polite">{encendida ? 'Luz encendida' : 'Tira de la cuerda para encender'}</span>
    </div>
  );
}
