import { useState } from 'react'
import styles from './FiltrosCategorias.module.css'

const FILTROS_INICIALES = {
  codigo_categoria_vehiculo: '',
  nombre_categoria_vehiculo: '',
  estado_categoria_vehiculo: '',
}

function FiltrosCategorias({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      codigo_categoria_vehiculo: filtros.codigo_categoria_vehiculo || undefined,
      nombre_categoria_vehiculo: filtros.nombre_categoria_vehiculo || undefined,
      estado_categoria_vehiculo: filtros.estado_categoria_vehiculo || undefined,
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
            name="codigo_categoria_vehiculo"
            value={filtros.codigo_categoria_vehiculo}
            onChange={handleChange}
            placeholder="ECO, SUV..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            name="nombre_categoria_vehiculo"
            value={filtros.nombre_categoria_vehiculo}
            onChange={handleChange}
            placeholder="Económico, Lujo..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select
            className={styles.input}
            name="estado_categoria_vehiculo"
            value={filtros.estado_categoria_vehiculo}
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

export default FiltrosCategorias