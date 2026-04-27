import { useState, useEffect } from 'react'
import { crearMarca, actualizarMarca } from '../../../api/marcasVehiculoApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import styles from './MarcaFormModal.module.css'

const ESTADO_INICIAL = {
  codigo_marca_vehiculo: '',
  nombre_marca_vehiculo: '',
  descripcion_marca_vehiculo: '',
  estado_marca_vehiculo: 'ACT',
}

function MarcaFormModal({ marca, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const esEdicion = !!marca

  useEffect(() => {
    if (marca) {
      setForm({
        codigo_marca_vehiculo: marca.codigo_marca_vehiculo || '',
        nombre_marca_vehiculo: marca.nombre_marca_vehiculo || '',
        descripcion_marca_vehiculo: marca.descripcion_marca_vehiculo || '',
        estado_marca_vehiculo: marca.estado_marca_vehiculo || 'ACT',
      })
    }
  }, [marca])

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
        await actualizarMarca(marca.id_marca_vehiculo, form, usuario)
      } else {
        await crearMarca(form, usuario)
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
            {esEdicion ? 'Editar marca' : 'Nueva marca'}
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
                name="codigo_marca_vehiculo"
                value={form.codigo_marca_vehiculo}
                onChange={handleChange}
                placeholder="TOY, KIA, SUZ..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                name="nombre_marca_vehiculo"
                value={form.nombre_marca_vehiculo}
                onChange={handleChange}
                placeholder="Toyota, Kia, Suzuki..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select
                className={styles.input}
                name="estado_marca_vehiculo"
                value={form.estado_marca_vehiculo}
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
              name="descripcion_marca_vehiculo"
              value={form.descripcion_marca_vehiculo}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción de la marca..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear marca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MarcaFormModal