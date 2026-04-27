import styles from './Paginacion.module.css'

function Paginacion({ paginaActual, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null

  const paginas = []
  const rango = 2

  for (let i = 1; i <= totalPaginas; i++) {
    if (
      i === 1 ||
      i === totalPaginas ||
      (i >= paginaActual - rango && i <= paginaActual + rango)
    ) {
      paginas.push(i)
    } else if (
      i === paginaActual - rango - 1 ||
      i === paginaActual + rango + 1
    ) {
      paginas.push('...')
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        onClick={() => onCambiar(paginaActual - 1)}
        disabled={paginaActual === 1}
      >
        ← Anterior
      </button>

      <div className={styles.paginas}>
        {paginas.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>...</span>
          ) : (
            <button
              key={p}
              className={`${styles.pagina} ${p === paginaActual ? styles.activa : ''}`}
              onClick={() => onCambiar(p)}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        className={styles.btn}
        onClick={() => onCambiar(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
      >
        Siguiente →
      </button>
    </div>
  )
}

export default Paginacion