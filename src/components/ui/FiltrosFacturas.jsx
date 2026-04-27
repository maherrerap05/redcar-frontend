import { useState } from 'react'
import styles from './FiltrosFacturas.module.css'

const FILTROS_INICIALES = {
  numero_factura: '',
  estado: '',
  origen_canal_factura: '',
}

function FiltrosFacturas({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      numero_factura: filtros.numero_factura || undefined,
      estado: filtros.estado || undefined,
      origen_canal_factura: filtros.origen_canal_factura || undefined,
      page_number: 1,
      page_size: 10,
    }
    onBuscar(payload)
  }

  function handleLimpiar() {
    setFiltros(FILTROS_INICIALES)
    onLimpiar()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.fila}>

        <div className={styles.field}>
          <label className={styles.label}>Número factura</label>
          <input
            className={styles.input}
            name="numero_factura"
            value={filtros.numero_factura}
            onChange={handleChange}
            placeholder="FAC-RES-001..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select
            className={styles.input}
            name="estado"
            value={filtros.estado}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="ABI">Abierta</option>
            <option value="APR">Aprobada</option>
            <option value="INA">Eliminada</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Canal</label>
          <select
            className={styles.input}
            name="origen_canal_factura"
            value={filtros.origen_canal_factura}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="ADMIN">Administrativo</option>
            <option value="WEB">Web</option>
          </select>
        </div>

      </div>

      <div className={styles.acciones}>
        <button className={styles.btnLimpiar} onClick={handleLimpiar}>
          Limpiar filtros
        </button>
        <button className={styles.btnBuscar} onClick={handleBuscar}>
          Buscar
        </button>
      </div>
    </div>
  )
}

export default FiltrosFacturas