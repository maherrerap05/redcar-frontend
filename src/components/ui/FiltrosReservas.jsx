import { useState } from 'react'
import styles from './FiltrosReservas.module.css'

const FILTROS_INICIALES = {
  codigo_reserva: '',
  estado_reserva: '',
  origen_canal_reserva: '',
}

function FiltrosReservas({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      codigo_reserva: filtros.codigo_reserva || undefined,
      estado_reserva: filtros.estado_reserva || undefined,
      origen_canal_reserva: filtros.origen_canal_reserva || undefined,
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
          <label className={styles.label}>Código reserva</label>
          <input
            className={styles.input}
            name="codigo_reserva"
            value={filtros.codigo_reserva}
            onChange={handleChange}
            placeholder="RES-0001..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select
            className={styles.input}
            name="estado_reserva"
            value={filtros.estado_reserva}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="PEN">Pendiente</option>
            <option value="CON">Confirmada</option>
            <option value="CAN">Cancelada</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Canal</label>
          <select
            className={styles.input}
            name="origen_canal_reserva"
            value={filtros.origen_canal_reserva}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            <option value="WEB">Web</option>
            <option value="ADMIN">Administrativo</option>
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

export default FiltrosReservas