import { useEffect } from 'react'
import styles from './Toast.module.css'

function Toast({ mensaje, tipo = 'exito', onCerrar }) {
  useEffect(() => {
    const timer = setTimeout(onCerrar, 3500)
    return () => clearTimeout(timer)
  }, [onCerrar])

  return (
    <div className={`${styles.toast} ${styles[tipo]}`}>
      <span className={styles.icono}>
        {tipo === 'exito' ? '✓' : '✕'}
      </span>
      <span className={styles.mensaje}>{mensaje}</span>
      <button className={styles.cerrar} onClick={onCerrar}>✕</button>
    </div>
  )
}

export default Toast