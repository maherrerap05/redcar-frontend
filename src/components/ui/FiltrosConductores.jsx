import { useState } from 'react'
import styles from './FiltrosConductores.module.css'

const FILTROS_INICIALES = {
  codigo_conductor: '',
  numero_identificacion: '',
  con_nombre1: '',
  con_apellido1: '',
  numero_licencia: '',
  estado_conductor: '',
}

function FiltrosConductores({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      codigo_conductor: filtros.codigo_conductor || undefined,
      numero_identificacion: filtros.numero_identificacion || undefined,
      con_nombre1: filtros.con_nombre1 || undefined,
      con_apellido1: filtros.con_apellido1 || undefined,
      numero_licencia: filtros.numero_licencia || undefined,
      estado_conductor: filtros.estado_conductor || undefined,
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
            name="codigo_conductor"
            value={filtros.codigo_conductor}
            onChange={handleChange}
            placeholder="COND-001..."
          />
        </div>

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
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            name="con_nombre1"
            value={filtros.con_nombre1}
            onChange={handleChange}
            placeholder="Juan..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Apellido</label>
          <input
            className={styles.input}
            name="con_apellido1"
            value={filtros.con_apellido1}
            onChange={handleChange}
            placeholder="Pérez..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>N° Licencia</label>
          <input
            className={styles.input}
            name="numero_licencia"
            value={filtros.numero_licencia}
            onChange={handleChange}
            placeholder="LIC-001..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select
            className={styles.input}
            name="estado_conductor"
            value={filtros.estado_conductor}
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

export default FiltrosConductores