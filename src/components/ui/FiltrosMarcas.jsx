import { useState } from 'react'
import styles from './FiltrosMarcas.module.css'

const FILTROS_INICIALES = {
  codigo_marca_vehiculo: '',
  nombre_marca_vehiculo: '',
  estado_marca_vehiculo: '',
}

function FiltrosMarcas({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      codigo_marca_vehiculo: filtros.codigo_marca_vehiculo || undefined,
      nombre_marca_vehiculo: filtros.nombre_marca_vehiculo || undefined,
      estado_marca_vehiculo: filtros.estado_marca_vehiculo || undefined,
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
            name="codigo_marca_vehiculo"
            value={filtros.codigo_marca_vehiculo}
            onChange={handleChange}
            placeholder="TOY, KIA..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            name="nombre_marca_vehiculo"
            value={filtros.nombre_marca_vehiculo}
            onChange={handleChange}
            placeholder="Toyota, Kia..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select
            className={styles.input}
            name="estado_marca_vehiculo"
            value={filtros.estado_marca_vehiculo}
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

export default FiltrosMarcas