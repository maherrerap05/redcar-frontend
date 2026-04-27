import { useState, useEffect } from 'react'
import { crearExtra, actualizarExtra } from '../../../api/extrasApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import styles from './ExtraFormModal.module.css'

const BLOQUEAR_LETRAS = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

const ESTADO_INICIAL = {
  codigo_extra: '',
  nombre_extra: '',
  descripcion_extra: '',
  valor_fijo: '',
  estado_extra: 'ACT',
}

function ExtraFormModal({ extra, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const esEdicion = !!extra

  useEffect(() => {
    if (extra) {
      setForm({
        codigo_extra: extra.codigo_extra || '',
        nombre_extra: extra.nombre_extra || '',
        descripcion_extra: extra.descripcion_extra || '',
        valor_fijo: extra.valor_fijo || '',
        estado_extra: extra.estado_extra || 'ACT',
      })
    }
  }, [extra])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      const datos = {
        ...form,
        valor_fijo: parseFloat(form.valor_fijo),
      }
      if (esEdicion) {
        await actualizarExtra(extra.id_extra, datos, usuario)
      } else {
        await crearExtra(datos, usuario)
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
            {esEdicion ? 'Editar extra' : 'Nuevo extra'}
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
                name="codigo_extra"
                value={form.codigo_extra}
                onChange={handleChange}
                placeholder="GPS, SILLA-BEBE..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                name="nombre_extra"
                value={form.nombre_extra}
                onChange={handleChange}
                placeholder="GPS, Silla de bebé..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Valor fijo ($)</label>
              <input
                className={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                name="valor_fijo"
                value={form.valor_fijo}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                placeholder="5.00"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select
                className={styles.input}
                name="estado_extra"
                value={form.estado_extra}
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
              name="descripcion_extra"
              value={form.descripcion_extra}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción del extra..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear extra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExtraFormModal