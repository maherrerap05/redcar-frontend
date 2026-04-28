import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  crearClientePublico,
  crearConductorPublico,
  crearReservaPublica,
  confirmarReservaPublica,
  crearFacturaPublica,
  verificarDisponibilidad,
} from '../../api/bookingApi'
import { getExtras } from '../../api/bookingApi'
import styles from './BookingConfirmacionPage.module.css'

function BookingNavBar({ paso }) {
  return (
    <div className={styles.navbar}>
      <img src="/LOGO_REDCAR.png" alt="RedCar" className={styles.navLogo} />
      <div className={styles.pasos}>
        {['Búsqueda', 'Vehículo', 'Extras', 'Datos', 'Confirmar'].map((p, i) => (
          <div key={p} className={`${styles.paso} ${i + 1 === paso ? styles.pasoActivo : ''} ${i + 1 < paso ? styles.pasoDone : ''}`}>
            <span className={styles.pasoNum}>{i + 1 < paso ? '✓' : i + 1}</span>
            <span className={styles.pasoLabel}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function generarCodigoReserva() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RC-${ts}-${rand}`
}

function InfoFila({ label, valor }) {
  return (
    <div className={styles.infoFila}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function BookingConfirmacionPage() {
  const navigate = useNavigate()
  // Leer UNA sola vez al montar — useState evita que se pierdan al borrar localStorage
  const [busqueda] = useState(() => JSON.parse(localStorage.getItem('redcar_busqueda') || '{}'))
  const [reserva] = useState(() => JSON.parse(localStorage.getItem('redcar_reserva') || '{}'))

  const [procesando, setProcesando] = useState(false)
  const [paso, setPaso] = useState(null)
  const [error, setError] = useState(null)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const [codigoExito, setCodigoExito] = useState('')
  const [extrasDisponibles, setExtrasDisponibles] = useState([])

  useEffect(() => {
    getExtras().then(d => setExtrasDisponibles(Array.isArray(d) ? d : Object.values(d || {}))).catch(() => {})
  }, [])

  // Helper: obtener nombre del extra por id
  function nombreExtra(idExtra) {
    // Primero buscar en el payload guardado (tiene nombre_extra si fue guardado después del fix)
    const extraGuardado = extras.find(e => e.id_extra === idExtra)
    if (extraGuardado?.nombre_extra) return extraGuardado.nombre_extra
    // Si no, buscar en el catálogo cargado
    const extraCatalogo = extrasDisponibles.find(e => e.id_extra === idExtra)
    if (extraCatalogo?.nombre_extra) return extraCatalogo.nombre_extra
    return `Extra ID ${idExtra}`
  }

  const vehiculo = reserva?.vehiculo
  const cliente = reserva?.cliente
  const conductores = reserva?.conductores || []
  const extras = reserva?.extras || []
  const totales = reserva?.totales || {}

  async function confirmarReserva() {
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones para continuar.')
      return
    }
    setProcesando(true)
    setError(null)

    try {
      // ── PASO 1: Verificar disponibilidad ──────────────────────────────────
      // El controller devuelve ApiResponse<bool> — data es true/false directamente
      setPaso('Verificando disponibilidad del vehículo…')
      const disponible = await verificarDisponibilidad(vehiculo.id_vehiculo ?? vehiculo.id, {
        fechaRecogida: busqueda.fechaRecogida,
        fechaDevolucion: busqueda.fechaDevolucion,
      })
      if (!disponible) {
        setError('El vehículo ya no está disponible para las fechas seleccionadas. Por favor, elige otro.')
        setProcesando(false)
        setPaso(null)
        return
      }

      // ── PASO 2: Crear cliente nuevo si no existe ──────────────────────────
      let idCliente = reserva.id_cliente
      if (!idCliente) {
        setPaso('Registrando tu información…')
        const resCliente = await crearClientePublico(cliente)
        idCliente = resCliente?.data?.id_cliente || resCliente?.id_cliente
        if (!idCliente) throw new Error('No se pudo registrar el cliente.')
      }

      // ── PASO 3: Crear conductores nuevos ──────────────────────────────────
      setPaso('Registrando conductores…')
      const conductoresConId = await Promise.all(
        conductores.map(async (c) => {
          if (c._nuevo && c._datosCompletos) {
            const resCond = await crearConductorPublico(c._datosCompletos)
            const idCond = resCond?.data?.id_conductor || resCond?.id_conductor
            return { ...c, id_conductor: idCond }
          }
          return c
        })
      )

      // ── PASO 4: Crear la reserva ──────────────────────────────────────────
      setPaso('Generando tu reserva…')
      const codigoReserva = generarCodigoReserva()

      // Helpers de formato — el backend espera fecha como ISO y hora como "HH:mm:ss"
      const formatHora = (h) => h ? (h.length === 5 ? `${h}:00` : h) : '09:00:00'
      // fechaRecogida viene como "2026-04-27T09:00:00" — separamos solo la parte de fecha
      const soloFechaRecogida = busqueda.fechaRecogida?.split('T')[0] ?? busqueda.fechaRecogida
      const soloFechaDevolucion = busqueda.fechaDevolucion?.split('T')[0] ?? busqueda.fechaDevolucion

      const reservaPayload = {
        codigo_reserva: codigoReserva,
        id_cliente: idCliente,
        id_vehiculo: vehiculo.id_vehiculo ?? vehiculo.id,
        id_localizacion_recogida: Number(busqueda.idLocalizacionRecogida),
        id_localizacion_devolucion: Number(busqueda.idLocalizacionDevolucion || busqueda.idLocalizacionRecogida),
        fecha_recogida: soloFechaRecogida,
        hora_recogida: formatHora(busqueda.horaRecogida),
        fecha_devolucion: soloFechaDevolucion,
        hora_devolucion: formatHora(busqueda.horaDevolucion),
        edad_conductor_principal: reserva.edad_conductor_principal || conductores[0]?.edad_conductor || 30,
        observaciones_reserva: '',
        conductores: conductoresConId.map((c, i) => ({
          id_conductor: c.id_conductor,
          tipo_conductor: i === 0 ? 'PRINCIPAL' : 'ADICIONAL',
          es_principal: i === 0,
          estado_reserva_conductor: 'ACT',
        })),
        extras: (reserva.extras || []).map(e => ({
          id_extra: e.id_extra,
          cantidad: e.cantidad,
          estado_reserva_extra: 'ACT',
        })),
      }

      const resReserva = await crearReservaPublica(reservaPayload)
      const idReserva = resReserva?.data?.id_reserva || resReserva?.id_reserva
      if (!idReserva) throw new Error('No se pudo crear la reserva.')

      // ── PASO 5: Confirmar la reserva (PEN → CON) ──────────────────────────
      setPaso('Confirmando tu reserva…')
      await confirmarReservaPublica(idReserva)

      // ── PASO 6: Crear la factura ──────────────────────────────────────────
      setPaso('Generando tu factura…')
      const facturaPayload = {
        numero_factura: `FAC-${codigoReserva}`,
        id_reserva: idReserva,
        observaciones_factura: `Reserva generada desde el portal web. Código: ${codigoReserva}`,
        origen_canal_factura: 'WEB',
        estado: 'ABI',
      }
      await crearFacturaPublica(facturaPayload)

      // ── PASO 6: Guardar resultado y limpiar ───────────────────────────────
      localStorage.setItem('redcar_exito', JSON.stringify({
        codigoReserva,
        idReserva,
        vehiculo,
        cliente,
        totales,
        fechaRecogida: busqueda.fechaRecogida,
        fechaDevolucion: busqueda.fechaDevolucion,
        dias: busqueda.dias,
      }))
      // Limpiar localStorage DESPUÉS de guardar lo que necesitamos
      localStorage.removeItem('redcar_busqueda')
      localStorage.removeItem('redcar_reserva')
      localStorage.removeItem('redcar_exito')

      // Mostrar overlay — setProcesando(false) va ANTES para desbloquear UI
      setCodigoExito(codigoReserva)
      setProcesando(false)
      setPaso(null)
      setExitoso(true)

      setTimeout(() => navigate('/booking'), 5000)

    } catch (err) {
      console.error(err)
      setError(err?.message || 'Ocurrió un error al procesar tu reserva. Por favor intenta de nuevo.')
      setProcesando(false)
      setPaso(null)
    }
  }

  if (!vehiculo || !cliente) {
    return (
      <div className={styles.page}>
        <BookingNavBar paso={5} />
        <div className={styles.errorCentral}>
          <p>No se encontró información de la reserva.</p>
          <button onClick={() => navigate('/booking')} className={styles.btnPrimary}>Iniciar nueva búsqueda</button>
        </div>
      </div>
    )
  }

  // Overlay de éxito
  if (exitoso) {
    return (
      <div className={styles.overlayExito}>
        <div className={styles.overlayCard}>
          <div className={styles.overlayCirculo}>✓</div>
          <h2 className={styles.overlayTitulo}>¡Reserva Exitosa!</h2>
          <p className={styles.overlayMensaje}>
            Tu reserva ha sido confirmada. La factura será enviada a tu correo electrónico.
          </p>
          <p className={styles.overlayCodigo}>{codigoExito}</p>
          <p className={styles.overlayRedirigiendo}>Redirigiendo al inicio en unos segundos…</p>
          <div className={styles.overlayBarra} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <BookingNavBar paso={5} />

      <div className={styles.container}>
        <div className={styles.layout}>
          <main className={styles.content}>

            {/* Vehículo */}
            <section className={styles.seccion}>
              <h3 className={styles.seccionTitle}>🚗 Vehículo seleccionado</h3>
              <div className={styles.vehiculoResumen}>
                <div className={styles.vehiculoInfo}>
                  <p className={styles.vehiculoNombre}>{vehiculo.modelo_vehiculo}</p>
                  <p className={styles.vehiculoSub}>{vehiculo.anio_fabricacion} · Cat. {vehiculo.id_categoria_vehiculo} · {vehiculo.tipo_transmision}</p>
                  <div className={styles.vehiculoSpecs}>
                    <span>👥 {vehiculo.capacidad_pasajeros} pas.</span>
                    <span>⛽ {vehiculo.tipo_combustible}</span>
                    {vehiculo.aire_acondicionado && <span>❄️ A/C</span>}
                  </div>
                </div>
              </div>
            </section>

            {/* Fechas */}
            <section className={styles.seccion}>
              <h3 className={styles.seccionTitle}>📅 Fechas de renta</h3>
              <div className={styles.grid2}>
                <InfoFila label="Sucursal recogida" valor={busqueda.nombreLocalizacionRecogida || `Sucursal ${busqueda.idLocalizacionRecogida}`} />
                <InfoFila label="Recogida" valor={`${busqueda.fechaRecogida?.split('T')[0]} a las ${busqueda.horaRecogida}`} />
                <InfoFila label="Sucursal devolución" valor={
                  busqueda.mismaLocalizacion
                    ? (busqueda.nombreLocalizacionRecogida || `Sucursal ${busqueda.idLocalizacionRecogida}`)
                    : (busqueda.nombreLocalizacionDevolucion || `Sucursal ${busqueda.idLocalizacionDevolucion}`)
                } />
                <InfoFila label="Devolución" valor={`${busqueda.fechaDevolucion?.split('T')[0]} a las ${busqueda.horaDevolucion}`} />
                <InfoFila label="Duración" valor={`${busqueda.dias} ${busqueda.dias === 1 ? 'día' : 'días'}`} />
              </div>
            </section>

            {/* Conductores */}
            {conductores.length > 0 && (
              <section className={styles.seccion}>
                <h3 className={styles.seccionTitle}>👤 Conductores</h3>
                {conductores.map((c, i) => (
                  <div key={i} className={styles.conductorItem}>
                    <span className={styles.conductorBadge}>{i === 0 ? '⭐ Principal' : `Adicional ${i}`}</span>
                    <span className={styles.conductorNombre}>{c.con_nombre1} {c.con_apellido1}</span>
                    <span className={styles.conductorLicencia}>Lic: {c.numero_licencia}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Datos del cliente */}
            <section className={styles.seccion}>
              <h3 className={styles.seccionTitle}>👤 Tus datos</h3>
              <div className={styles.grid2}>
                <InfoFila label="Nombre" valor={`${cliente.nombres} ${cliente.apellidos}`} />
                <InfoFila label="Correo" valor={cliente.correo} />
                <InfoFila label="Teléfono" valor={cliente.telefono} />
                <InfoFila label="Identificación" valor={`${cliente.tipo_identificacion}: ${cliente.numero_identificacion}`} />
              </div>
            </section>

            {/* Extras */}
            {extras.length > 0 && (
              <section className={styles.seccion}>
                <h3 className={styles.seccionTitle}>🎒 Extras incluidos</h3>
                {extras.map((e, i) => (
                  <div key={i} className={styles.extraItem}>
                    <span>{nombreExtra(e.id_extra)}</span>
                    <span>×{e.cantidad}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Términos */}
            <section className={styles.seccion}>
              <label className={styles.terminosRow}>
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={e => { setAceptaTerminos(e.target.checked); setError(null) }}
                  className={styles.checkbox}
                />
                <span>
                  Acepto los <a href="#" className={styles.link}>términos y condiciones</a> de renta de RedCar.
                  Entiendo que al confirmar se generará una reserva y factura a mi nombre.
                </span>
              </label>
            </section>

            {error && (
              <div className={styles.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.botonesRow}>
              <button
                className={styles.btnVolver}
                onClick={() => navigate('/booking/cliente')}
                disabled={procesando}
              >
                ← Volver
              </button>
              <button
                className={styles.btnConfirmar}
                onClick={confirmarReserva}
                disabled={procesando}
              >
                {procesando ? (
                  <span className={styles.procesandoContent}>
                    <span className={styles.spinnerBtn} />
                    {paso || 'Procesando…'}
                  </span>
                ) : (
                  '🔒 Confirmar Reserva y Pagar'
                )}
              </button>
            </div>
          </main>

          {/* Resumen de precios */}
          <aside className={styles.resumen}>
            <div className={styles.resumenCard}>
              <h3 className={styles.resumenTitle}>Resumen de pago</h3>
              <div className={styles.resumenRow}>
                <span>Vehículo ({busqueda.dias} día(s))</span>
                <span>${(totales.subtotalVehiculo || 0).toFixed(2)}</span>
              </div>
              {totales.subtotalExtras > 0 && (
                <div className={styles.resumenRow}>
                  <span>Extras</span>
                  <span>${totales.subtotalExtras?.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.resumenRow}>
                <span>Subtotal</span>
                <span>${totales.subtotal?.toFixed(2)}</span>
              </div>
              <div className={styles.resumenRow}>
                <span>IVA 15%</span>
                <span>${totales.iva?.toFixed(2)}</span>
              </div>
              <div className={styles.resumenDivider} />
              <div className={`${styles.resumenRow} ${styles.resumenTotal}`}>
                <span>Total a pagar</span>
                <span>${totales.total?.toFixed(2)}</span>
              </div>

              <div className={styles.seguridadBox}>
                <span>🔒</span>
                <span>Reserva segura y confirmada al instante</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmacionPage