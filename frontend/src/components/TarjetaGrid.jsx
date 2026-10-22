export default function TarjetaGrid({ items, renderAcciones }) {
  if (!items.length) return null;
  return (
    <div className="eg-tarjeta-grid">
      {items.map((item) => (
        <article className="eg-tarjeta" key={item.id}>
          <span className="eg-tarjeta__icono" aria-hidden="true">⌁</span>
          <div className="eg-tarjeta__contenido">
            <h3>{item.titulo}</h3>
            <p>{item.descripcion}</p>
            {item.meta && <strong className="eg-tarjeta__meta">{item.meta}</strong>}
          </div>
          {renderAcciones && <div className="eg-tarjeta__acciones">{renderAcciones(item)}</div>}
        </article>
      ))}
    </div>
  );
}
