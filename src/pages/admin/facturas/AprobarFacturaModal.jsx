import { useState } from 'react'
import styles from './AprobarFacturaModal.module.css'

function AprobarFacturaModal({ factura, onCerrar, onAprobar }) {
  const [procesando, setProcesando] = useState(false)

  async function handleAprobar() {
    setProcesando(true)
    await onAprobar(factura)
    setProcesando(false)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.titulo}>Aprobar factura</h2>

        <p className={styles.descripcion}>
          Estás por aprobar la factura <strong>{factura.numero_factura}</strong>.
          Esta acción cambiará el estado a <strong>Aprobada</strong> y no podrá revertirse.
        </p>

        <div className={styles.resumen}>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>Número</span>
            <span className={styles.resumenValor}>{factura.numero_factura}</span>
          </div>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>ID Reserva</span>
            <span className={styles.resumenValor}>{factura.id_reserva}</span>
          </div>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>Subtotal</span>
            <span className={styles.resumenValor}>${factura.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>IVA</span>
            <span className={styles.resumenValor}>${factura.valor_iva?.toFixed(2) || '0.00'}</span>
          </div>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>Total</span>
            <span className={styles.resumenTotal}>${factura.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.btnCancelar}
            onClick={onCerrar}
            disabled={procesando}
          >
            Cancelar
          </button>
          <button
            className={styles.btnAprobar}
            onClick={handleAprobar}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : 'Aprobar factura'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AprobarFacturaModal