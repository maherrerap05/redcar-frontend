import { useState } from 'react'
import styles from './FiltrosExtras.module.css'

const FILTROS_INICIALES = {
  codigo_extra: '',
  nombre_extra: '',
  estado_extra: '',
  valor_fijo_desde: '',
  valor_fijo_hasta: '',
}

const BLOQUEAR_LETRAS = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

function FiltrosExtras({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      codigo_extra: filtros.codigo_extra || undefined,
      nombre_extra: filtros.nombre_extra || undefined,
      estado_extra: filtros.estado_extra || undefined,
      valor_fijo_desde: filtros.valor_fijo_desde ? parseFloat(filtros.valor_fijo_desde) : undefined,
      valor_fijo_hasta: filtros.valor_fijo_hasta ? parseFloat(filtros.valor_fijo_hasta) : undefined,
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
          <label className={styles.label}>Código</label>
          <input
            className={styles.input}
            name="codigo_extra"
            value={filtros.codigo_extra}
            onChange={handleChange}
            placeholder="GPS, SILLA-BEBE..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            name="nombre_extra"
            value={filtros.nombre_extra}
            onChange={handleChange}
            placeholder="GPS, Silla..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select
            className={styles.input}
            name="estado_extra"
            value={filtros.estado_extra}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="ACT">Activo</option>
            <option value="INA">Inactivo</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Valor desde ($)</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            name="valor_fijo_desde"
            value={filtros.valor_fijo_desde}
            onChange={handleChange}
            onKeyDown={BLOQUEAR_LETRAS}
            placeholder="0.00"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Valor hasta ($)</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            name="valor_fijo_hasta"
            value={filtros.valor_fijo_hasta}
            onChange={handleChange}
            onKeyDown={BLOQUEAR_LETRAS}
            placeholder="999.00"
          />
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

export default FiltrosExtras