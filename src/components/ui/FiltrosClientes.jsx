import { useState } from 'react'
import styles from './FiltrosClientes.module.css'

const FILTROS_INICIALES = {
  numero_identificacion: '',
  nombres: '',
  apellidos: '',
  correo: '',
  estado: '',
}

function FiltrosClientes({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      numero_identificacion: filtros.numero_identificacion || undefined,
      nombres: filtros.nombres || undefined,
      apellidos: filtros.apellidos || undefined,
      correo: filtros.correo || undefined,
      estado: filtros.estado || undefined,
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
          <label className={styles.label}>Identificación</label>
          <input
            className={styles.input}
            name="numero_identificacion"
            value={filtros.numero_identificacion}
            onChange={handleChange}
            placeholder="1234567890"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nombres</label>
          <input
            className={styles.input}
            name="nombres"
            value={filtros.nombres}
            onChange={handleChange}
            placeholder="Juan..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Apellidos</label>
          <input
            className={styles.input}
            name="apellidos"
            value={filtros.apellidos}
            onChange={handleChange}
            placeholder="Pérez..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Correo</label>
          <input
            className={styles.input}
            name="correo"
            value={filtros.correo}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
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
            <option value="ACT">Activo</option>
            <option value="INA">Inactivo</option>
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

export default FiltrosClientes