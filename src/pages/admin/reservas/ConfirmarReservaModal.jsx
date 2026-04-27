import { useState } from 'react'
import styles from './ConfirmarReservaModal.module.css'

function ConfirmarReservaModal({ reserva, onCerrar, onConfirmar }) {
  const [procesando, setProcesando] = useState(false)

  async function handleConfirmar() {
    setProcesando(true)
    await onConfirmar(reserva)
    setProcesando(false)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.titulo}>Confirmar reserva</h2>

        <p className={styles.descripcion}>
          Estás por confirmar la reserva <strong>{reserva.codigo_reserva}</strong>.
          Esta acción cambiará el estado a <strong>Confirmada</strong> y generará
          automáticamente una factura en estado <strong>Abierto</strong>.
        </p>

        <div className={styles.resumen}>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>Cliente ID</span>
            <span className={styles.resumenValor}>{reserva.id_cliente}</span>
          </div>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>Vehículo ID</span>
            <span className={styles.resumenValor}>{reserva.id_vehiculo}</span>
          </div>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>Total reserva</span>
            <span className={styles.resumenTotal}>${reserva.total_reserva?.toFixed(2) || '0.00'}</span>
          </div>
          <div className={styles.resumenFila}>
            <span className={styles.resumenLabel}>Número de factura</span>
            <span className={styles.resumenValor}>FAC-{reserva.codigo_reserva}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnCancelar} onClick={onCerrar} disabled={procesando}>
            Cancelar
          </button>
          <button
            className={styles.btnConfirmar}
            onClick={handleConfirmar}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : 'Confirmar y generar factura'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmarReservaModal