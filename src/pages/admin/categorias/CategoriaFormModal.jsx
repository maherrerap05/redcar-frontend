import { useState, useEffect } from 'react'
import { crearCategoria, actualizarCategoria } from '../../../api/categoriasVehiculoApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import styles from './CategoriaFormModal.module.css'

const ESTADO_INICIAL = {
  codigo_categoria_vehiculo: '',
  nombre_categoria_vehiculo: '',
  descripcion_categoria_vehiculo: '',
  estado_categoria_vehiculo: 'ACT',
}

function CategoriaFormModal({ categoria, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const esEdicion = !!categoria

  useEffect(() => {
    if (categoria) {
      setForm({
        codigo_categoria_vehiculo: categoria.codigo_categoria_vehiculo || '',
        nombre_categoria_vehiculo: categoria.nombre_categoria_vehiculo || '',
        descripcion_categoria_vehiculo: categoria.descripcion_categoria_vehiculo || '',
        estado_categoria_vehiculo: categoria.estado_categoria_vehiculo || 'ACT',
      })
    }
  }, [categoria])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      if (esEdicion) {
        await actualizarCategoria(categoria.id_categoria_vehiculo, form, usuario)
      } else {
        await crearCategoria(form, usuario)
      }
      onGuardado(esEdicion)
    } catch (err) {
      setError(leerMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>
            {esEdicion ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Código</label>
              <input
                className={styles.input}
                name="codigo_categoria_vehiculo"
                value={form.codigo_categoria_vehiculo}
                onChange={handleChange}
                placeholder="ECO, SUV, LUX..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                name="nombre_categoria_vehiculo"
                value={form.nombre_categoria_vehiculo}
                onChange={handleChange}
                placeholder="Económico, SUV, Lujo..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select
                className={styles.input}
                name="estado_categoria_vehiculo"
                value={form.estado_categoria_vehiculo}
                onChange={handleChange}
              >
                <option value="ACT">Activo</option>
                <option value="INA">Inactivo</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descripción</label>
            <textarea
              className={styles.input}
              name="descripcion_categoria_vehiculo"
              value={form.descripcion_categoria_vehiculo}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción de la categoría..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoriaFormModal