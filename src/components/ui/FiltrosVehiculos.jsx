import { useState, useEffect } from 'react'
import { getMarcas } from '../../api/marcasApi'
import { getCategorias } from '../../api/categoriasApi'
import styles from './FiltrosVehiculos.module.css'

const FILTROS_INICIALES = {
  codigo_interno_vehiculo: '',
  placa_vehiculo: '',
  modelo_vehiculo: '',
  tipo_transmision: '',
  tipo_combustible: '',
  estado_vehiculo: '',
  id_marca_vehiculo: '',
  id_categoria_vehiculo: '',
  precio_base_dia_min: '',
  precio_base_dia_max: '',
}

function FiltrosVehiculos({ onBuscar, onLimpiar }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [marcas, setMarcas] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    async function cargar() {
      try {
        const [mars, cats] = await Promise.all([getMarcas(), getCategorias()])
        setMarcas(mars.filter(m => !m.es_eliminado))
        setCategorias(cats.filter(c => !c.es_eliminado))
      } catch {}
    }
    cargar()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function handleBuscar() {
    const payload = {
      codigo_interno_vehiculo: filtros.codigo_interno_vehiculo || undefined,
      placa_vehiculo: filtros.placa_vehiculo || undefined,
      modelo_vehiculo: filtros.modelo_vehiculo || undefined,
      tipo_transmision: filtros.tipo_transmision || undefined,
      tipo_combustible: filtros.tipo_combustible || undefined,
      estado_vehiculo: filtros.estado_vehiculo || undefined,
      id_marca_vehiculo: filtros.id_marca_vehiculo ? parseInt(filtros.id_marca_vehiculo) : undefined,
      id_categoria_vehiculo: filtros.id_categoria_vehiculo ? parseInt(filtros.id_categoria_vehiculo) : undefined,
      precio_base_dia_min: filtros.precio_base_dia_min ? parseFloat(filtros.precio_base_dia_min) : undefined,
      precio_base_dia_max: filtros.precio_base_dia_max ? parseFloat(filtros.precio_base_dia_max) : undefined,
      page_number: 1,
      page_size: 100,
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
            name="codigo_interno_vehiculo"
            value={filtros.codigo_interno_vehiculo}
            onChange={handleChange}
            placeholder="VEH-UIO-001"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Placa</label>
          <input
            className={styles.input}
            name="placa_vehiculo"
            value={filtros.placa_vehiculo}
            onChange={handleChange}
            placeholder="PCD-1201"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Modelo</label>
          <input
            className={styles.input}
            name="modelo_vehiculo"
            value={filtros.modelo_vehiculo}
            onChange={handleChange}
            placeholder="Corolla"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Marca</label>
          <select className={styles.input} name="id_marca_vehiculo"
            value={filtros.id_marca_vehiculo} onChange={handleChange}>
            <option value="">Todas</option>
            {marcas.map(m => (
              <option key={m.id_marca_vehiculo} value={m.id_marca_vehiculo}>
                {m.nombre_marca_vehiculo}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Categoría</label>
          <select className={styles.input} name="id_categoria_vehiculo"
            value={filtros.id_categoria_vehiculo} onChange={handleChange}>
            <option value="">Todas</option>
            {categorias.map(c => (
              <option key={c.id_categoria_vehiculo} value={c.id_categoria_vehiculo}>
                {c.nombre_categoria_vehiculo}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Transmisión</label>
          <select className={styles.input} name="tipo_transmision"
            value={filtros.tipo_transmision} onChange={handleChange}>
            <option value="">Todas</option>
            <option value="AUTOMATICA">Automática</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Combustible</label>
          <select className={styles.input} name="tipo_combustible"
            value={filtros.tipo_combustible} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="GASOLINA">Gasolina</option>
            <option value="DIESEL">Diésel</option>
            <option value="HIBRIDO">Híbrido</option>
            <option value="ELECTRICO">Eléctrico</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Estado</label>
          <select className={styles.input} name="estado_vehiculo"
            value={filtros.estado_vehiculo} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="ACT">Activo</option>
            <option value="INA">Inactivo</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Precio mín. ($)</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            name="precio_base_dia_min"
            value={filtros.precio_base_dia_min}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Precio máx. ($)</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            name="precio_base_dia_max"
            value={filtros.precio_base_dia_max}
            onChange={handleChange}
            placeholder="999"
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

export default FiltrosVehiculos