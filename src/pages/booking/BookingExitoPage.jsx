import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './BookingExitoPage.module.css'

function BookingExitoPage() {
  const navigate = useNavigate()
  const [exito, setExito] = useState(null)

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem('redcar_exito') || 'null')
    if (!datos) {
      navigate('/booking')
      return
    }
    setExito(datos)
    // Limpiar después de leer
    localStorage.removeItem('redcar_exito')
  }, [])

  if (!exito) return null

  const { codigoReserva, vehiculo, cliente, totales, fechaRecogida, fechaDevolucion, dias } = exito

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src="/LOGO_REDCAR.png" alt="RedCar" className={styles.logo} />
      </header>

      <main className={styles.main}>
        {/* Ícono de éxito animado */}
        <div className={styles.iconoExito}>
          <div className={styles.circulo}>
            <span className={styles.check}>✓</span>
          </div>
        </div>

        <h1 className={styles.titulo}>¡Reserva confirmada!</h1>
        <p className={styles.sub}>
          Tu reserva ha sido generada exitosamente. Recibirás los detalles en tu correo.
        </p>

        {/* Código de reserva destacado */}
        <div className={styles.codigoBox}>
          <p className={styles.codigoLabel}>Código de reserva</p>
          <p className={styles.codigoValor}>{codigoReserva}</p>
          <p className={styles.codigoSub}>Guarda este código para cualquier consulta</p>
        </div>

        {/* Detalles */}
        <div className={styles.detallesCard}>
          <h2 className={styles.detallesTitle}>Detalle de tu reserva</h2>

          <div className={styles.detallesGrid}>
            <div className={styles.detalleItem}>
              <span className={styles.detalleIcon}>🚗</span>
              <div>
                <p className={styles.detalleLabel}>Vehículo</p>
                <p className={styles.detalleValor}>{vehiculo?.modelo_vehiculo}</p>
                <p className={styles.detalleSub}>{vehiculo?.anio_fabricacion} · Cat. {vehiculo?.id_categoria_vehiculo}</p>
              </div>
            </div>

            <div className={styles.detalleItem}>
              <span className={styles.detalleIcon}>📅</span>
              <div>
                <p className={styles.detalleLabel}>Fechas</p>
                <p className={styles.detalleValor}>{fechaRecogida?.split('T')[0]}</p>
                <p className={styles.detalleSub}>hasta {fechaDevolucion?.split('T')[0]} · {dias} {dias === 1 ? 'día' : 'días'}</p>
              </div>
            </div>

            <div className={styles.detalleItem}>
              <span className={styles.detalleIcon}>👤</span>
              <div>
                <p className={styles.detalleLabel}>Cliente</p>
                <p className={styles.detalleValor}>{cliente?.nombres} {cliente?.apellidos}</p>
                <p className={styles.detalleSub}>{cliente?.correo}</p>
              </div>
            </div>

            <div className={styles.detalleItem}>
              <span className={styles.detalleIcon}>💳</span>
              <div>
                <p className={styles.detalleLabel}>Total pagado</p>
                <p className={styles.detalleValorGrande}>${totales?.total?.toFixed(2)}</p>
                <p className={styles.detalleSub}>IVA incluido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className={styles.pasosCard}>
          <h3 className={styles.pasosTitle}>¿Qué sigue?</h3>
          <div className={styles.pasosList}>
            {[
              { num: '1', text: 'Recibirás un correo de confirmación con todos los detalles de tu reserva.' },
              { num: '2', text: 'Preséntate en la sucursal de recogida con tu identificación y licencia de conducir.' },
              { num: '3', text: 'Un agente RedCar te entregará el vehículo y la documentación de renta.' },
            ].map(p => (
              <div key={p.num} className={styles.pasoItem}>
                <span className={styles.pasoNum}>{p.num}</span>
                <p className={styles.pasoText}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.acciones}>
          <button
            className={styles.btnNuevaReserva}
            onClick={() => navigate('/booking')}
          >
            Hacer otra reserva
          </button>
          <button
            className={styles.btnImprimir}
            onClick={() => window.print()}
          >
            🖨️ Imprimir comprobante
          </button>
        </div>
      </main>
    </div>
  )
}

export default BookingExitoPage