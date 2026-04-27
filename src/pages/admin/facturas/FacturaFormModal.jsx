import { useState, useEffect } from 'react'
import { actualizarFactura } from '../../../api/facturasApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import styles from './FacturaFormModal.module.css'

function FacturaFormModal({ factura, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState({
    observaciones_factura: '',
    origen_canal_factura: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (factura) {
      setForm({
        observaciones_factura: factura.observaciones_factura || '',
        origen_canal_factura: factura.origen_canal_factura || '',
      })
    }
  }, [factura])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await actualizarFactura(factura.id_factura, form, usuario)
      onGuardado()
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
          <h2 className={styles.modalTitulo}>Editar factura</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.infoCard}>
            <div className={styles.infoFila}>
              <span className={styles.infoLabel}>Número</span>
              <span className={styles.infoValor}>{factura.numero_factura}</span>
            </div>
            <div className={styles.infoFila}>
              <span className={styles.infoLabel}>ID Reserva</span>
              <span className={styles.infoValor}>{factura.id_reserva}</span>
            </div>
            <div className={styles.infoFila}>
              <span className={styles.infoLabel}>Total</span>
              <span className={styles.infoValor}>${factura.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Canal de factura</label>
            <select
              className={styles.input}
              name="origen_canal_factura"
              value={form.origen_canal_factura}
              onChange={handleChange}
            >
              <option value="">— Selecciona —</option>
              <option value="ADMIN">Administrativo</option>
              <option value="WEB">Web</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Observaciones</label>
            <textarea
              className={styles.input}
              name="observaciones_factura"
              value={form.observaciones_factura}
              onChange={handleChange}
              rows={3}
              placeholder="Observaciones de la factura..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Actualizar factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FacturaFormModal