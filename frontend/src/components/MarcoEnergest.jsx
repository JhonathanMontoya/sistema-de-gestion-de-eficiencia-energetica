import NavegacionEnergest from './NavegacionEnergest';

export default function MarcoEnergest({ children, titulo, descripcion }) {
  return (
    <div className="eg-app">
      <NavegacionEnergest />
      <main className="eg-contenido">
        <div className="eg-pagina-titulo">
          <span className="eg-etiqueta">Tu espacio de energía</span>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>
        {children}
      </main>
      <footer className="eg-footer"><span>EnerGest</span><span>Los datos de tu cuenta son privados.</span></footer>
    </div>
  );
}
