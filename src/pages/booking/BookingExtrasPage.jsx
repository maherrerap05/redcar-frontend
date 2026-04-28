import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExtras } from '../../api/bookingApi'
import { getConductorPorIdentificacion, crearConductorBooking } from '../../api/conductoresApi'
import styles from './BookingExtrasPage.module.css'

function BookingNavBar({ paso }) {
  return (
    <div className={styles.navbar}>
      <img src="/LOGO_REDCAR.png" alt="RedCar" className={styles.navLogo} />
      <div className={styles.pasos}>
        {['Búsqueda', 'Vehículo', 'Extras', 'Datos', 'Confirmar'].map((p, i) => (
          <div key={`paso-${p}`} className={`${styles.paso} ${i + 1 === paso ? styles.pasoActivo : ''} ${i + 1 < paso ? styles.pasoDone : ''}`}>
            <span className={styles.pasoNum}>{i + 1 < paso ? '✓' : i + 1}</span>
            <span className={styles.pasoLabel}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const FORM_CONDUCTOR_VACIO = {
  numero_identificacion: '',
  tipo_identificacion: 'CED',
  con_nombre1: '',
  con_nombre2: '',
  con_apellido1: '',
  con_apellido2: '',
  fecha_vencimiento_licencia: '',
  edad_conductor: '',
  con_telefono: '',
  con_correo: '',
  // Control interno
  _encontrado: false,
  _bloqueado: false,
  _id_conductor: null,
}

// Sanitiza input: elimina caracteres peligrosos para SQL injection y XSS
function sanitizar(valor) {
  return valor
    .replace(/['"`;\\<>{}()|]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\s{2,}/g, ' ')
}

// Solo letras, tildes, espacios y guiones (para nombres y apellidos)
function soloLetras(valor) {
  return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s-]/g, '')
}

// Solo dígitos (para cédula/RUC — en Ecuador la identificación es numérica)
function soloNumerico(valor) {
  return valor.replace(/[^0-9]/g, '')
}

// Solo dígitos y + para teléfonos
function soloTelefono(valor) {
  return valor.replace(/[^0-9+\-\s]/g, '')
}

function FormConductor({ index, conductor, onChange, onRemove, esPrincipal }) {
  const [buscando, setBuscando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState(null)
  const [errorVencimiento, setErrorVencimiento] = useState(null)
  const [identificacionInput, setIdentificacionInput] = useState(
    conductor.numero_identificacion || ''
  )

  async function buscarPorIdentificacion() {
    if (!identificacionInput.trim()) return
    setBuscando(true)
    setErrorBusqueda(null)
    try {
      const data = await getConductorPorIdentificacion(identificacionInput.trim())
      if (data) {
        // Verificar que el conductor esté activo y no eliminado
        if (data.estado_conductor !== 'ACT' || data.es_eliminado) {
          setErrorBusqueda(
            'Este conductor no está disponible. Por favor ingresa una identificación diferente o registra un nuevo conductor.'
          )
          onChange(index, {
            ...FORM_CONDUCTOR_VACIO,
            numero_identificacion: identificacionInput.trim(),
            _encontrado: false,
            _bloqueado: true,
            _id_conductor: null,
          })
          return
        }
        // Conductor activo — autocompletar formulario
        onChange(index, {
          ...conductor,
          numero_identificacion: data.numero_identificacion,
          tipo_identificacion: data.tipo_identificacion,
          con_nombre1: data.con_nombre1,
          con_nombre2: data.con_nombre2 || '',
          con_apellido1: data.con_apellido1,
          con_apellido2: data.con_apellido2 || '',
          fecha_vencimiento_licencia: data.fecha_vencimiento_licencia?.split('T')[0] || '',
          edad_conductor: data.edad_conductor,
          con_telefono: data.con_telefono || '',
          con_correo: data.con_correo || '',
          _encontrado: true,
          _id_conductor: data.id_conductor,
        })
      }
    } catch {
      setErrorBusqueda('Conductor no encontrado. Puedes registrarlo manualmente.')
      onChange(index, {
        ...FORM_CONDUCTOR_VACIO,
        numero_identificacion: identificacionInput.trim(),
        _encontrado: false,
        _bloqueado: false,
        _id_conductor: null,
      })
    } finally {
      setBuscando(false)
    }
  }

  function cambiar(e) {
    const { name, value } = e.target
    let valorLimpio = value

    if (['con_nombre1', 'con_nombre2', 'con_apellido1', 'con_apellido2'].includes(name)) {
      valorLimpio = soloLetras(value)
    } else if (name === 'tipo_identificacion') {
      // Al cambiar tipo, limpiar número de identificación
      onChange(index, { ...conductor, tipo_identificacion: value, numero_identificacion: '' })
      return
    } else if (name === 'numero_identificacion') {
      valorLimpio = soloNumerico(value)
    } else if (name === 'con_telefono') {
      valorLimpio = soloTelefono(value)
    } else if (name === 'con_correo') {
      valorLimpio = value.replace(/\s/g, '').replace(/['"`;\\<>{}()|]/g, '')
    } else {
      valorLimpio = sanitizar(value)
    }

    if (!['con_correo', 'con_telefono'].includes(name)) {
      valorLimpio = valorLimpio.trimStart()
    }

    onChange(index, { ...conductor, [name]: valorLimpio })
  }

  return (
    <div className={styles.conductorCard}>
      <div className={styles.conductorHeader}>
        <span className={styles.conductorBadge}>
          {esPrincipal ? '⭐ Conductor principal' : `Conductor ${index + 1}`}
        </span>
        {!esPrincipal && (
          <button className={styles.btnRemove} onClick={() => onRemove(index)}>✕ Eliminar</button>
        )}
      </div>

      {/* Búsqueda por número de identificación */}
      <div className={styles.busquedaRow}>
        <div className={styles.fieldGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Número de identificación *</label>
          <input
            className={styles.input}
            value={identificacionInput}
            onChange={e => {
              const limpio = soloNumerico(e.target.value).trimStart()
              setIdentificacionInput(limpio)
              setErrorBusqueda(null)
              onChange(index, {
                ...conductor,
                _bloqueado: false,
                _encontrado: false,
                _id_conductor: null,
              })
            }}
            onKeyDown={e => e.key === 'Enter' && buscarPorIdentificacion()}
            placeholder={
              conductor.tipo_identificacion === 'RUC'
                ? 'Ej: 0102030405001'
                : 'Ej: 0102030405'
            }
            maxLength={conductor.tipo_identificacion === 'RUC' ? 13 : 10}
          />
        </div>
        <button
          className={styles.btnBuscarLicencia}
          onClick={buscarPorIdentificacion}
          disabled={buscando || !identificacionInput.trim()}
        >
          {buscando ? '…' : '🔍 Buscar'}
        </button>
      </div>

      {errorBusqueda && (
        <p className={styles.infoMsg}>{errorBusqueda}</p>
      )}
      {conductor._encontrado && (
        <p className={styles.successMsg}>✓ Conductor encontrado en el sistema</p>
      )}

      {/* Formulario conductor */}
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Tipo de identificación *</label>
          <select
            name="tipo_identificacion"
            value={conductor.tipo_identificacion}
            onChange={cambiar}
            className={styles.select}
            disabled={conductor._encontrado || conductor._bloqueado}
          >
            <option value="CED">Cédula</option>
            <option value="RUC">RUC</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Número de identificación *</label>
          <input
            name="numero_identificacion"
            value={conductor.numero_identificacion}
            onChange={cambiar}
            className={styles.input}
            disabled={conductor._encontrado || conductor._bloqueado}
            placeholder={conductor.tipo_identificacion === 'CED' ? '0102030405' : '0123456789001'}
            maxLength={conductor.tipo_identificacion === 'CED' ? 10 : 13}
            onKeyDown={e => /[^0-9]/.test(e.key) && e.key.length === 1 && e.preventDefault()}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Primer nombre *</label>
          <input name="con_nombre1" value={conductor.con_nombre1} onChange={cambiar} className={styles.input} disabled={conductor._encontrado || conductor._bloqueado} maxLength={80} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Segundo nombre</label>
          <input name="con_nombre2" value={conductor.con_nombre2} onChange={cambiar} className={styles.input} disabled={conductor._encontrado || conductor._bloqueado} maxLength={80} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Primer apellido *</label>
          <input name="con_apellido1" value={conductor.con_apellido1} onChange={cambiar} className={styles.input} disabled={conductor._encontrado || conductor._bloqueado} maxLength={80} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Segundo apellido</label>
          <input name="con_apellido2" value={conductor.con_apellido2} onChange={cambiar} className={styles.input} disabled={conductor._encontrado || conductor._bloqueado} maxLength={80} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Edad *</label>
          <select
            name="edad_conductor"
            value={conductor.edad_conductor}
            onChange={cambiar}
            className={styles.select}
            disabled={conductor._encontrado || conductor._bloqueado}
          >
            <option value="">Selecciona edad...</option>
            {Array.from({ length: 83 }, (_, i) => i + 18).map(edad => (
              <option key={`edad-${edad}`} value={edad}>{edad} años</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Vencimiento licencia *</label>
          <input
            type="date"
            name="fecha_vencimiento_licencia"
            value={conductor.fecha_vencimiento_licencia}
            onChange={e => {
              const fechaElegida = e.target.value
              const hoy = new Date().toISOString().split('T')[0]
              const fechaDevolucion = JSON.parse(localStorage.getItem('redcar_busqueda') || '{}')
                ?.fechaDevolucion?.split('T')[0] || hoy

              if (fechaElegida < hoy) {
                setErrorVencimiento('La licencia ya está vencida. El conductor no es elegible.')
              } else if (fechaElegida < fechaDevolucion) {
                setErrorVencimiento(
                  `La licencia vence antes de la devolución del vehículo (${fechaDevolucion}). El conductor no es elegible para esta reserva.`
                )
              } else {
                setErrorVencimiento(null)
              }
              cambiar(e)
            }}
            min={new Date().toISOString().split('T')[0]}
            className={`${styles.input} ${errorVencimiento ? styles.inputError : ''}`}
            disabled={conductor._encontrado || conductor._bloqueado}
          />
          {errorVencimiento && (
            <span className={styles.errorVencimiento}>{errorVencimiento}</span>
          )}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Teléfono *</label>
          <input name="con_telefono" value={conductor.con_telefono} onChange={cambiar} className={styles.input} disabled={conductor._encontrado || conductor._bloqueado} maxLength={20} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Correo electrónico *</label>
          <input type="email" name="con_correo" value={conductor.con_correo} onChange={cambiar} className={styles.input} disabled={conductor._encontrado || conductor._bloqueado} maxLength={120} />
        </div>
      </div>
    </div>
  )
}

function BookingExtrasPage() {
  const navigate = useNavigate()
  const busqueda = JSON.parse(localStorage.getItem('redcar_busqueda') || 'null')
  const reserva = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')

  const [extrasDisponibles, setExtrasDisponibles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errores, setErrores] = useState([])
  const [extrasExpandido, setExtrasExpandido] = useState(false)

  const [extrasSeleccionados, setExtrasSeleccionados] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    if (!guardado.extras?.length) return {}
    return guardado.extras.reduce((acc, e) => ({ ...acc, [e.id_extra]: e.cantidad }), {})
  })

  const [conductores, setConductores] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    if (!guardado.conductores?.length) return [{ ...FORM_CONDUCTOR_VACIO }]
    return guardado.conductores.map(c => ({
      ...FORM_CONDUCTOR_VACIO,
      tipo_identificacion: c.tipo_identificacion || 'CED',
      numero_identificacion: c.numero_identificacion || '',
      con_nombre1: c.con_nombre1 || '',
      con_nombre2: c.con_nombre2 || '',
      con_apellido1: c.con_apellido1 || '',
      con_apellido2: c.con_apellido2 || '',
      fecha_vencimiento_licencia: c.fecha_vencimiento_licencia
        ? c.fecha_vencimiento_licencia.split('T')[0]
        : '',
      edad_conductor: c.edad_conductor || '',
      con_telefono: c.con_telefono || '',
      con_correo: c.con_correo || '',
      _encontrado: c._nuevo === false || !!c._id_conductor,
      _bloqueado: false,
      _id_conductor: c.id_conductor || c._id_conductor || null,
      _nuevo: c._nuevo ?? true,
      _datosCompletos: c._datosCompletos || c,
    }))
  })

  useEffect(() => {
    if (!reserva?.vehiculo) { navigate('/booking/vehiculos'); return }
    getExtras()
      .then(d => setExtrasDisponibles(Array.isArray(d) ? d : Object.values(d || {})))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  function toggleExtra(extra) {
    setExtrasSeleccionados(prev => {
      const existe = prev[extra.id_extra]
      if (existe) {
        const copia = { ...prev }
        delete copia[extra.id_extra]
        return copia
      }
      return { ...prev, [extra.id_extra]: 1 }
    })
  }

  function cambiarCantidad(extraId, cantidad) {
    if (cantidad < 1) return
    setExtrasSeleccionados(prev => ({ ...prev, [extraId]: Math.max(1, cantidad) }))
  }

  function cambiarConductor(index, datos) {
    setConductores(prev => {
      const copia = [...prev]
      copia[index] = datos
      return copia
    })
  }

  function agregarConductor() {
    setConductores(prev => [...prev, { ...FORM_CONDUCTOR_VACIO }])
  }

  function eliminarConductor(index) {
    setConductores(prev => prev.filter((_, i) => i !== index))
  }

  function validar() {
    const errs = []
    const hoy = new Date().toISOString().split('T')[0]
    const fechaDevolucion = JSON.parse(localStorage.getItem('redcar_busqueda') || '{}')
      ?.fechaDevolucion?.split('T')[0] || hoy

    conductores.forEach((c, i) => {
      const n = i + 1

      // Número de identificación
      if (!c.numero_identificacion?.trim()) {
        errs.push(`Conductor ${n}: número de identificación requerido`)
      } else if (c.tipo_identificacion === 'CED' && !/^\d{10}$/.test(c.numero_identificacion)) {
        errs.push(`Conductor ${n}: la cédula debe tener exactamente 10 dígitos`)
      } else if (c.tipo_identificacion === 'RUC' && !/^\d{13}$/.test(c.numero_identificacion)) {
        errs.push(`Conductor ${n}: el RUC debe tener exactamente 13 dígitos`)
      }

      // Primer nombre
      if (!c.con_nombre1?.trim())
        errs.push(`Conductor ${n}: primer nombre requerido`)
      else if (c.con_nombre1.trim().length < 2)
        errs.push(`Conductor ${n}: el nombre debe tener al menos 2 caracteres`)
      else if (c.con_nombre1.length > 80)
        errs.push(`Conductor ${n}: el nombre no puede exceder 80 caracteres`)

      // Primer apellido
      if (!c.con_apellido1?.trim())
        errs.push(`Conductor ${n}: primer apellido requerido`)
      else if (c.con_apellido1.trim().length < 2)
        errs.push(`Conductor ${n}: el apellido debe tener al menos 2 caracteres`)
      else if (c.con_apellido1.length > 80)
        errs.push(`Conductor ${n}: el apellido no puede exceder 80 caracteres`)

      // Edad
      if (!c.edad_conductor || Number(c.edad_conductor) < 18)
        errs.push(`Conductor ${n}: edad mínima 18 años`)

      // Teléfono
      if (!c.con_telefono?.trim())
        errs.push(`Conductor ${n}: teléfono requerido`)
      else if (c.con_telefono.replace(/[^0-9]/g, '').length < 7)
        errs.push(`Conductor ${n}: el teléfono debe tener al menos 7 dígitos`)
      else if (c.con_telefono.length > 20)
        errs.push(`Conductor ${n}: el teléfono no puede exceder 20 caracteres`)

      // Correo
      if (!c.con_correo?.trim())
        errs.push(`Conductor ${n}: correo electrónico requerido`)
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.con_correo))
        errs.push(`Conductor ${n}: formato de correo inválido`)
      else if (c.con_correo.length > 120)
        errs.push(`Conductor ${n}: el correo no puede exceder 120 caracteres`)

      // Vencimiento licencia
      if (!c.fecha_vencimiento_licencia) {
        errs.push(`Conductor ${n}: vencimiento de licencia requerido`)
      } else if (c.fecha_vencimiento_licencia < hoy) {
        errs.push(`Conductor ${n}: la licencia está vencida, no es elegible`)
      } else if (c.fecha_vencimiento_licencia < fechaDevolucion) {
        errs.push(`Conductor ${n}: la licencia vence antes de la devolución del vehículo`)
      }
    })

    setErrores(errs)
    return errs.length === 0
  }

  function calcularTotales() {
    const dias = busqueda?.dias || 1
    const baseVehiculo = reserva?.vehiculo?.precio_base_dia || 0
    const subtotalVehiculo = baseVehiculo * dias
    const subtotalExtras = Object.entries(extrasSeleccionados).reduce((acc, [id, cant]) => {
      const extra = extrasDisponibles.find(e => String(e.id_extra) === String(id))
      return acc + (extra?.valor_fijo || 0) * cant
    }, 0)
    const subtotal = subtotalVehiculo + subtotalExtras
    const iva = subtotal * 0.15
    const total = subtotal + iva
    return { subtotalVehiculo, subtotalExtras, subtotal, iva, total, dias }
  }

  function continuar() {
    if (!validar()) return

    const totales = calcularTotales()

    const extrasPayload = Object.entries(extrasSeleccionados).map(([id, cantidad]) => {
      const extra = extrasDisponibles.find(e => String(e.id_extra) === String(id))
      return {
        id_extra: Number(id),
        cantidad: Number(cantidad),
        estado_reserva_extra: 'ACT',
        nombre_extra: extra?.nombre_extra ?? '',
      }
    })

    const conductoresPayload = conductores.map((c, i) => ({
      id_conductor: c._id_conductor || null,
      // numero_licencia = numero_identificacion por equivalencia en Ecuador
      numero_licencia: c.numero_identificacion,
      tipo_identificacion: c.tipo_identificacion,
      numero_identificacion: c.numero_identificacion,
      con_nombre1: c.con_nombre1,
      con_nombre2: c.con_nombre2 || '',
      con_apellido1: c.con_apellido1,
      con_apellido2: c.con_apellido2 || '',
      fecha_vencimiento_licencia: c.fecha_vencimiento_licencia
        ? new Date(c.fecha_vencimiento_licencia).toISOString()
        : null,
      edad_conductor: Number(c.edad_conductor),
      con_telefono: c.con_telefono || '',
      con_correo: c.con_correo || '',
      tipo_conductor: i === 0 ? 'PRINCIPAL' : 'ADICIONAL',
      es_principal: i === 0,
      estado_reserva_conductor: 'ACT',
      _nuevo: !c._id_conductor,
      _datosCompletos: c,
    }))

    localStorage.setItem('redcar_reserva', JSON.stringify({
      ...reserva,
      extras: extrasPayload,
      conductores: conductoresPayload,
      totales,
      edad_conductor_principal: conductores[0]?.edad_conductor || 30,
    }))

    navigate('/booking/cliente')
  }

  const totales = calcularTotales()

  return (
    <div className={styles.page}>
      <BookingNavBar paso={3} />

      <div className={styles.container}>
        <div className={styles.layout}>
          <main className={styles.content}>
            {/* Conductores */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>👤</span>
                <div>
                  <h2 className={styles.sectionTitle}>Conductores autorizados</h2>
                  <p className={styles.sectionSub}>
                    Registra las personas autorizadas a conducir el vehículo durante la reserva. El primero será el conductor principal.
                  </p>
                </div>
              </div>

              {conductores.map((c, i) => (
                <FormConductor
                  key={`conductor-${i}`}
                  index={i}
                  conductor={c}
                  onChange={cambiarConductor}
                  onRemove={eliminarConductor}
                  esPrincipal={i === 0}
                />
              ))}

              <button className={styles.btnAgregarConductor} onClick={agregarConductor}>
                + Agregar conductor adicional
              </button>

              {errores.length > 0 && (
                <div className={styles.erroresBox}>
                  {errores.map((e, i) => <p key={i} className={styles.errorMsg}>• {e}</p>)}
                </div>
              )}
            </section>

            {/* Extras — colapsable */}
            <section className={styles.section}>
              <div
                className={styles.sectionHeaderColapsable}
                onClick={() => setExtrasExpandido(prev => !prev)}
              >
                <div className={styles.sectionHeaderLeft}>
                  <span className={styles.sectionIcon}>🎒</span>
                  <div>
                    <h2 className={styles.sectionTitle}>Extras opcionales</h2>
                    <p className={styles.sectionSub}>
                      {Object.keys(extrasSeleccionados).length > 0
                        ? `${Object.keys(extrasSeleccionados).length} extra(s) seleccionado(s)`
                        : 'Haz clic para ver y agregar extras a tu reserva'}
                    </p>
                  </div>
                </div>
                <span className={styles.iconoColapsar}>
                  {extrasExpandido ? '▲' : '▼'}
                </span>
              </div>

              {extrasExpandido && (
                <>
                  {cargando ? (
                    <div className={styles.loadingInline}>
                      <div className={styles.spinner} /> Cargando extras…
                    </div>
                  ) : extrasDisponibles.length === 0 ? (
                    <p className={styles.noExtras}>No hay extras disponibles.</p>
                  ) : (
                    <div className={styles.extrasGrid}>
                      {extrasDisponibles.map(extra => {
                        const seleccionado = !!extrasSeleccionados[extra.id_extra]
                        return (
                          <div
                            key={extra.id_extra}
                            className={`${styles.extraCard} ${seleccionado ? styles.extraCardActivo : ''}`}
                            onClick={() => toggleExtra(extra)}
                          >
                            <div className={styles.extraCardTop}>
                              <div className={styles.extraCheck}>{seleccionado ? '✓' : '+'}</div>
                              <div>
                                <p className={styles.extraNombre}>{extra.nombre_extra}</p>
                              </div>
                              <p className={styles.extraPrecio}>${(extra.valor_fijo ?? 0).toFixed(2)}</p>
                            </div>
                            {seleccionado && (
                              <div className={styles.extraCantidadRow} onClick={e => e.stopPropagation()}>
                                <span className={styles.extraCantLabel}>Cantidad:</span>
                                <button className={styles.btnCant} onClick={() => cambiarCantidad(extra.id_extra, (extrasSeleccionados[extra.id_extra] || 1) - 1)}>−</button>
                                <span className={styles.extraCantNum}>{extrasSeleccionados[extra.id_extra]}</span>
                                <button className={styles.btnCant} onClick={() => cambiarCantidad(extra.id_extra, (extrasSeleccionados[extra.id_extra] || 1) + 1)}>+</button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </section>
          </main>

          {/* Resumen lateral */}
          <aside className={styles.resumen}>
            <div className={styles.resumenCard}>
              <h3 className={styles.resumenTitle}>Resumen</h3>

              {reserva?.vehiculo && (
                <div className={styles.resumenVehiculo}>
                  <p className={styles.resumenVehNombre}>{reserva.vehiculo.modelo_vehiculo}</p>
                  <p className={styles.resumenVehAnio}>{reserva.vehiculo.anio_fabricacion} · Cat. {reserva.vehiculo.id_categoria_vehiculo}</p>
                  <div className={styles.resumenRow}>
                    <span>${(reserva.vehiculo.precio_base_dia || 0).toFixed(2)}/día × {totales.dias} día(s)</span>
                    <span>${(totales.subtotalVehiculo || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {Object.entries(extrasSeleccionados).length > 0 && (
                <div className={styles.resumenExtras}>
                  <p className={styles.resumenSubtitle}>Extras</p>
                  {Object.entries(extrasSeleccionados).map(([id, cant]) => {
                    const extra = extrasDisponibles.find(e => String(e.id_extra) === String(id))
                    if (!extra) return null
                    return (
                      <div key={id} className={styles.resumenRow}>
                        <span>{extra.nombre_extra} ×{cant}</span>
                        <span>${((extra.valor_fijo || 0) * cant).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className={styles.resumenDivider} />
              <div className={styles.resumenRow}><span>Subtotal</span><span>${totales.subtotal.toFixed(2)}</span></div>
              <div className={styles.resumenRow}><span>IVA (15%)</span><span>${totales.iva.toFixed(2)}</span></div>
              <div className={`${styles.resumenRow} ${styles.resumenTotal}`}>
                <span>Total</span>
                <span>${totales.total.toFixed(2)}</span>
              </div>

              <button className={styles.btnContinuar} onClick={continuar}>
                Continuar con mis datos →
              </button>
              <button className={styles.btnVolver} onClick={() => navigate('/booking/vehiculos')}>
                ← Volver
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default BookingExtrasPage