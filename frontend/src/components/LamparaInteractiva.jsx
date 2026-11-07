import { useEffect, useRef, useState } from 'react';

const ANCHO = 720;
const ALTO = 640;
const ANCLA = { x: 394, y: 421 };
const LARGO_REPOSO = 118;
const LARGO_MINIMO = 86;
const LARGO_MAXIMO = 205;

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

export default function LamparaInteractiva({ encendida, onEncender }) {
  const escenario = useRef(null);
  const estadoFisico = useRef({ angulo: 0, velocidadAngular: 0, largo: LARGO_REPOSO, velocidadLargo: 0, arrastrando: false, ultimoAngulo: 0, ultimoLargo: LARGO_REPOSO, ultimoTiempo: 0, movimientoX: 0 });
  const [angulo, setAngulo] = useState(0);
  const [largo, setLargo] = useState(LARGO_REPOSO);
  const [balanceando, setBalanceando] = useState(false);
  const [movimientoReducido, setMovimientoReducido] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)');
    const actualizar = () => setMovimientoReducido(consulta.matches);
    consulta.addEventListener?.('change', actualizar);
    return () => consulta.removeEventListener?.('change', actualizar);
  }, []);

  useEffect(() => {
    if (!balanceando || movimientoReducido) {
      if (movimientoReducido) {
        estadoFisico.current.angulo = 0;
        estadoFisico.current.velocidadAngular = 0;
        estadoFisico.current.largo = LARGO_REPOSO;
        estadoFisico.current.velocidadLargo = 0;
        setAngulo(0);
        setLargo(LARGO_REPOSO);
      }
      return undefined;
    }

    let cuadro;
    let tiempoAnterior = performance.now();
    function avanzar(tiempo) {
      const delta = limitar((tiempo - tiempoAnterior) / 1000, 0, 0.032);
      tiempoAnterior = tiempo;
      const fisica = estadoFisico.current;
      const aceleracionAngular = -(1962 / fisica.largo) * Math.sin(fisica.angulo) - 1.55 * fisica.velocidadAngular;
      const aceleracionLargo = -36 * (fisica.largo - LARGO_REPOSO) - 12 * fisica.velocidadLargo;
      fisica.velocidadAngular += aceleracionAngular * delta;
      fisica.angulo += fisica.velocidadAngular * delta;
      fisica.velocidadLargo += aceleracionLargo * delta;
      fisica.largo += fisica.velocidadLargo * delta;
      if (fisica.largo < LARGO_MINIMO) {
        fisica.largo = LARGO_MINIMO;
        fisica.velocidadLargo = Math.max(0, fisica.velocidadLargo);
      } else if (fisica.largo > LARGO_MAXIMO) {
        fisica.largo = LARGO_MAXIMO;
        fisica.velocidadLargo = Math.min(0, fisica.velocidadLargo);
      }

      if (Math.abs(fisica.angulo) < 0.009 && Math.abs(fisica.velocidadAngular) < 0.035 && Math.abs(fisica.largo - LARGO_REPOSO) < 0.8 && Math.abs(fisica.velocidadLargo) < 1.2) {
        fisica.angulo = 0;
        fisica.velocidadAngular = 0;
        fisica.largo = LARGO_REPOSO;
        fisica.velocidadLargo = 0;
        setAngulo(0);
        setLargo(LARGO_REPOSO);
        setBalanceando(false);
        return;
      }

      setAngulo(fisica.angulo);
      setLargo(fisica.largo);
      cuadro = requestAnimationFrame(avanzar);
    }
    cuadro = requestAnimationFrame(avanzar);
    return () => cancelAnimationFrame(cuadro);
  }, [balanceando, movimientoReducido]);

  function puntoDelPuntero(evento) {
    const rect = escenario.current.getBoundingClientRect();
    return {
      x: ((evento.clientX - rect.left) / rect.width) * ANCHO,
      y: ((evento.clientY - rect.top) / rect.height) * ALTO,
    };
  }

  function iniciarTiron(evento) {
    evento.preventDefault();
    if (encendida) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    const ahora = performance.now();
    const fisica = estadoFisico.current;
    fisica.arrastrando = true;
    fisica.velocidadAngular = 0;
    fisica.velocidadLargo = 0;
    fisica.ultimoAngulo = fisica.angulo;
    fisica.ultimoLargo = fisica.largo;
    fisica.ultimoTiempo = ahora;
    fisica.movimientoX = 0;
    setBalanceando(false);
  }

  function moverTiron(evento) {
    const fisica = estadoFisico.current;
    if (!fisica.arrastrando) return;
    const punto = puntoDelPuntero(evento);
    const dx = punto.x - ANCLA.x;
    const dy = punto.y - ANCLA.y;
    const nuevoLargo = limitar(Math.hypot(dx, dy), LARGO_MINIMO, LARGO_MAXIMO);
    const nuevoAngulo = limitar(Math.atan2(dx, Math.max(1, dy)), -0.92, 0.92);
    const ahora = performance.now();
    const delta = Math.max((ahora - fisica.ultimoTiempo) / 1000, 0.012);

    fisica.movimientoX = punto.x - (ANCLA.x + fisica.ultimoLargo * Math.sin(fisica.ultimoAngulo));
    fisica.velocidadAngular = limitar((nuevoAngulo - fisica.ultimoAngulo) / delta, -8, 8);
    fisica.velocidadLargo = limitar((nuevoLargo - fisica.ultimoLargo) / delta, -420, 420);
    fisica.angulo = nuevoAngulo;
    fisica.largo = nuevoLargo;
    fisica.ultimoAngulo = nuevoAngulo;
    fisica.ultimoLargo = nuevoLargo;
    fisica.ultimoTiempo = ahora;
    setAngulo(nuevoAngulo);
    setLargo(nuevoLargo);
  }

  function terminarTiron(evento) {
    const fisica = estadoFisico.current;
    if (!fisica.arrastrando) return;
    fisica.arrastrando = false;
    const tiroSuficiente = Math.abs(fisica.angulo) > 0.18 || Math.abs(fisica.largo - LARGO_REPOSO) > 28;
    if (tiroSuficiente && !encendida) onEncender();
    if (Math.abs(fisica.angulo) < 0.08 && Math.abs(fisica.largo - LARGO_REPOSO) > 18) {
      fisica.angulo = 0.11 * Math.sign(fisica.movimientoX || 1);
      fisica.velocidadAngular = 0.45 * Math.sign(fisica.movimientoX || 1);
    }
    fisica.velocidadAngular = limitar(fisica.velocidadAngular, -7, 7);
    fisica.velocidadLargo = limitar(fisica.velocidadLargo, -360, 360);
    setAngulo(fisica.angulo);
    setBalanceando(true);
    if (evento.currentTarget.hasPointerCapture?.(evento.pointerId)) evento.currentTarget.releasePointerCapture(evento.pointerId);
  }

  function tirarConTeclado() {
    if (encendida) return;
    const fisica = estadoFisico.current;
    fisica.angulo = 0.44;
    fisica.velocidadAngular = 1.25;
    fisica.largo = LARGO_REPOSO;
    fisica.velocidadLargo = 0;
    setAngulo(fisica.angulo);
    setLargo(fisica.largo);
    setBalanceando(true);
    onEncender();
  }

  const tiradorX = ANCLA.x + largo * Math.sin(angulo);
  const tiradorY = ANCLA.y + largo * Math.cos(angulo);

  return (
    <div className={'auth__lamp-stage' + (encendida ? ' auth__lamp-stage--on' : '') + (balanceando ? ' auth__lamp-stage--moving' : '')} ref={escenario}>
      <svg className="auth__lamp-svg" viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={encendida ? 'Lámpara encendida' : 'Lámpara con cuerda para tirar'}>
        <defs>
          <radialGradient id="brilloLampara"><stop offset="0" stopColor="#fff5bc" stopOpacity=".9" /><stop offset=".48" stopColor="#f8d46f" stopOpacity=".3" /><stop offset="1" stopColor="#f8d46f" stopOpacity="0" /></radialGradient>
          <linearGradient id="vidrioLampara" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".45" stopColor="#dff7ec" stopOpacity=".32" /><stop offset="1" stopColor="#9bd8b8" stopOpacity=".16" /></linearGradient>
          <linearGradient id="metalLampara" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3d68d" /><stop offset=".45" stopColor="#9c824a" /><stop offset="1" stopColor="#ead69f" /></linearGradient>
          <filter id="desenfoqueBrillo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="sombraVidrio" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#071910" floodOpacity=".26" /></filter>
        </defs>

        <g className="auth__orbita" fill="none" stroke="#b4e7c8" strokeOpacity=".14">
          <circle cx="360" cy="323" r="244" strokeDasharray="2 12" />
          <ellipse cx="360" cy="323" rx="292" ry="122" transform="rotate(-28 360 323)" />
          <path d="M52 540H668M91 566H629" strokeDasharray="3 11" />
        </g>
        <g className="auth__circuito" fill="none" stroke="#74d59d" strokeOpacity=".36" strokeWidth="1.5">
          <path d="M49 235h108l28-28h68M564 182h55v55h53M67 443h86l24 24h44M557 490h70v-33h47" />
          <circle cx="49" cy="235" r="4" fill="#8ce9b0" /><circle cx="672" cy="237" r="4" fill="#8ce9b0" /><circle cx="67" cy="443" r="4" fill="#8ce9b0" /><circle cx="674" cy="457" r="4" fill="#8ce9b0" />
        </g>

        <circle className="auth__lamp-glow" cx="359" cy="292" r="195" fill="url(#brilloLampara)" filter="url(#desenfoqueBrillo)" />
        <g className="auth__bulb" filter="url(#sombraVidrio)">
          <rect x="326" y="24" width="68" height="14" rx="7" fill="#18352b" stroke="#8eb99b" strokeOpacity=".75" />
          <path d="M360 38V116" stroke="#d0aa50" strokeWidth="5" />
          <path d="M319 112h82v22h-82z" rx="8" fill="#c49e4a" />
          <path d="M315 132h90c0 17-8 28-22 35h-46c-14-7-22-18-22-35Z" fill="url(#metalLampara)" />
          <path d="M329 160c-31 17-50 45-49 81 1 36 20 59 40 82 10 11 15 23 15 39h50c0-16 5-28 15-39 20-23 39-46 40-82 1-36-18-64-49-81-19-10-43-10-62 0Z" fill="url(#vidrioLampara)" stroke="#e4fff0" strokeOpacity=".85" strokeWidth="3" />
          <path className="auth__bulb-reflection" d="M310 215c5-21 17-37 34-48M305 247c0-8 1-15 3-21" fill="none" stroke="#fff" strokeOpacity=".84" strokeWidth="7" strokeLinecap="round" />
          <path d="M333 362h54v13h-54z" fill="#d8c68f" />
          <path d="M333 375h54v11h-54z" fill="url(#metalLampara)" />
          <path d="M335 387h50v10h-50zM338 398h44v9h-44zM341 408h38v10h-38z" fill="url(#metalLampara)" stroke="#745d32" strokeOpacity=".45" />
          <path d="M360 365v-56m-17 13v-30c0-10 7-17 17-17s17 7 17 17v30m-34-18h34" fill="none" stroke="#bd9850" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path className="auth__filamento" d="M346 292l6-7 8 13 8-13 6 7" fill="none" stroke="#ffd978" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g className="auth__rayos" stroke="#ffe594" strokeWidth="3" strokeLinecap="round">
          <path d="M360 108V78M257 141l-19-20M463 141l19-20M243 278h-29M477 278h29M273 375l-17 17M447 375l17 17" />
        </g>
        <path className="auth__pull-cord" d={`M${ANCLA.x} ${ANCLA.y} Q${(ANCLA.x + tiradorX) / 2 + angulo * 12} ${(ANCLA.y + tiradorY) / 2} ${tiradorX} ${tiradorY}`} />
        <g className="auth__pull-handle" transform={`translate(${tiradorX} ${tiradorY}) rotate(${angulo * 7})`}>
          <circle r="13" fill="#d5b663" stroke="#fff1b5" strokeWidth="3" />
          <path d="M-4-5a6 6 0 1 1 9 7L1 7" fill="none" stroke="#fff7d7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <text className="auth__svg-label" x="360" y="600" textAnchor="middle">TIRA PARA ENCENDER</text>
      </svg>

      <button
        type="button"
        className={'auth__pull-target' + (estadoFisico.current.arrastrando ? ' auth__pull-target--dragging' : '')}
        style={{ left: `${(tiradorX / ANCHO) * 100}%`, top: `${(tiradorY / ALTO) * 100}%` }}
        aria-label={encendida ? 'La lámpara está encendida' : 'Enciende la lámpara tirando de la cuerda'}
        aria-pressed={encendida}
        disabled={encendida}
        onPointerDown={iniciarTiron}
        onPointerMove={moverTiron}
        onPointerUp={terminarTiron}
        onPointerCancel={terminarTiron}
        onClick={(evento) => { if (evento.detail === 0) tirarConTeclado(); }}
      ><span aria-hidden="true" /></button>
      <span className="auth__lamp-status" aria-live="polite">{encendida ? 'Circuito activado · sesión lista' : 'Arrastra el tirador para activar el circuito'}</span>
    </div>
  );
}
