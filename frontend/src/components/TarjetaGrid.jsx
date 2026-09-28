import '../styles/Dashboard.css';

// Cuadricula reutilizable de tarjetas.
//
// items: [{ id?, titulo, descripcion, imagen?, meta? }]
// onSeleccionar(item): opcional. Si se pasa, la tarjeta completa es clicable.
// renderAcciones(item): opcional. Devuelve botones que se muestran al pie de la tarjeta.
export default function TarjetaGrid({ items, onSeleccionar, renderAcciones }) {
  return (
    <div className="dashboard__grid">
      {items.map((item) => {
        const clicable = Boolean(onSeleccionar);

        return (
          <article
            key={item.id ?? item.titulo}
            className={clicable ? 'dashboard__card' : 'dashboard__card dashboard__card--estatica'}
            onClick={clicable ? () => onSeleccionar(item) : undefined}
            onKeyDown={
              clicable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSeleccionar(item);
                    }
                  }
                : undefined
            }
            role={clicable ? 'button' : undefined}
            tabIndex={clicable ? 0 : undefined}
          >
            {item.imagen && (
              <img className="dashboard__card-imagen" src={item.imagen} alt={item.titulo} />
            )}
            <div className="dashboard__card-texto">
              <h3>{item.titulo}</h3>
              <p>{item.descripcion}</p>
              {item.meta && <span className="dashboard__card-meta">{item.meta}</span>}
            </div>
            {renderAcciones && (
              <div className="dashboard__card-acciones" onClick={(e) => e.stopPropagation()}>
                {renderAcciones(item)}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}