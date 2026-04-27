import { useState } from 'react'
import styles from './EliminarModal.module.css'

function EliminarModal({ nombre, onCerrar, onConfirmar }) {
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)

  async function handleConfirmar() {
    if (!motivo.trim()) return
    setProcesando(true)
    await onConfirmar(motivo)
    setProcesando(false)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.titulo}>Eliminar vehículo</h2>
        <p className={styles.descripcion}>
          Estás por eliminar <strong>{nombre}</strong>. Esta acción lo marcará como inactivo en el sistema.
        </p>
        <div className={styles.field}>
          <label className={styles.label}>Motivo de eliminación</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Describe el motivo..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <div className={styles.footer}>
          <button className={styles.btnCancelar} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className={styles.btnConfirmar}
            onClick={handleConfirmar}
            disabled={!motivo.trim() || procesando}
          >
            {procesando ? 'Eliminando...' : 'Confirmar eliminación'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EliminarModal