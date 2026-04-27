import { useState } from 'react'
import { CIUDADES } from '../../constants/ciudades'
import styles from './FiltrosLocalizaciones.module.css'

const FILTROS_INICIALES = {
  codigo_localizacion: '',
  nombre_localizacion: '',
  id_ciudad: '',
  estado_localizacion: '',
}

function FiltrosLocalizaciones({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      codigo_localizacion: filtros.codigo_localizacion || undefined,
      nombre_localizacion: filtros.nombre_localizacion || undefined,
      id_ciudad: filtros.id_ciudad ? parseInt(filtros.id_ciudad) : undefined,
      estado_localizacion: filtros.estado_localizacion || undefined,
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
            name="codigo_localizacion"
            value={filtros.codigo_localizacion}
            onChange={handleChange}
            placeholder="LOC-001..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            name="nombre_localizacion"
            value={filtros.nombre_localizacion}
            onChange={handleChange}
            placeholder="Aeropuerto, Centro..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Ciudad</label>
          <select
            className={styles.input}
            name="id_ciudad"
            value={filtros.id_ciudad}
            onChange={handleChange}
          >
            <option value="">Todas</option>
            {CIUDADES.map(c => (
              <option key={c.id_ciudad} value={c.id_ciudad}>
                {c.nombre} (ID {c.id_ciudad})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select
            className={styles.input}
            name="estado_localizacion"
            value={filtros.estado_localizacion}
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

export default FiltrosLocalizaciones