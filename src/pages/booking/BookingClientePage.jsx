import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientePorCorreo } from '../../api/bookingApi'
import styles from './BookingClientePage.module.css'

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

const FORM_VACIO = {
  tipo_identificacion: 'CED',
  numero_identificacion: '',
  razon_social: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  direccion: '',
}

function BookingClientePage() {
  const navigate = useNavigate()
  const reserva = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
  const busqueda = JSON.parse(localStorage.getItem('redcar_busqueda') || '{}')

  // Restaurar estado previo si el usuario volvió desde confirmación
  const [correoInput, setCorreoInput] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    return guardado.cliente?.correo || ''
  })
  const [buscando, setBuscando] = useState(false)
  const [clienteEncontrado, setClienteEncontrado] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    return !!guardado.cliente_existente
  })
  const [clienteExistente, setClienteExistente] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    return guardado.cliente_existente || null
  })
  const [form, setForm] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    return guardado.cliente ? { ...FORM_VACIO, ...guardado.cliente } : { ...FORM_VACIO }
  })
  const [errores, setErrores] = useState({})
  const [busquedaRealizada, setBusquedaRealizada] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    return !!guardado.cliente
  })
  const [clienteBloqueado, setClienteBloqueado] = useState(false)

  async function buscarCliente() {
    if (!correoInput.trim() || !correoInput.includes('@')) {
      setErrores({ correoInput: 'Ingresa un correo válido' })
      return
    }
    setBuscando(true)
    setErrores({})
    setBusquedaRealizada(false)
    setClienteBloqueado(false)
    try {
      const data = await getClientePorCorreo(correoInput.trim())
      if (data && data.id_cliente) {
        // Verificar que el cliente esté activo y no eliminado
        if (data.estado !== 'ACT' || data.es_eliminado) {
          setClienteEncontrado(false)
          setClienteExistente(null)
          setForm({ ...FORM_VACIO })
          setClienteBloqueado(true)
          setErrores({
            correoInput: 'Este cliente no está disponible para realizar reservas. Por favor contacta a nuestro equipo de soporte.'
          })
          setBusquedaRealizada(false)
          return
        }
        setClienteBloqueado(false)
        setClienteEncontrado(true)
        setClienteExistente(data)
        setForm({
          tipo_identificacion: data.tipo_identificacion,
          numero_identificacion: data.numero_identificacion,
          razon_social: data.razon_social || '',
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo,
          telefono: data.telefono || '',
          direccion: data.direccion || '',
        })
      }
    } catch {
      // No se encontró: habilitar formulario nuevo
      setClienteEncontrado(false)
      setClienteExistente(null)
      setClienteBloqueado(false)
      setForm({ ...FORM_VACIO, correo: correoInput.trim() })
    } finally {
      setBuscando(false)
      setBusquedaRealizada(true)
    }
  }

  // Sanitización
  function soloLetras(v) { return v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s-]/g, '') }
  function soloTelefono(v) { return v.replace(/[^0-9+\-\s]/g, '') }
  function soloAlfanumerico(v) { return v.replace(/[^a-zA-Z0-9\-]/g, '') }
  function sanitizar(v) {
    return v
      .replace(/['"`;\\<>{}()|]/g, '')
      .replace(/--/g, '')
      .replace(/\s{2,}/g, ' ')
  }

  function cambiar(e) {
    const { name, value } = e.target
    let limpio = value

    if (['nombres', 'apellidos'].includes(name)) {
      limpio = soloLetras(value).trimStart()
    } else if (name === 'tipo_identificacion') {
      // Al cambiar tipo, limpiar número de identificación
      setForm(prev => ({ ...prev, tipo_identificacion: value, numero_identificacion: '' }))
      setErrores(prev => ({ ...prev, tipo_identificacion: '', numero_identificacion: '' }))
      return
    } else if (name === 'numero_identificacion') {
      // Solo dígitos para cédula y RUC
      limpio = value.replace(/[^0-9]/g, '')
    } else if (name === 'telefono') {
      limpio = soloTelefono(value)
    } else if (name === 'correo') {
      limpio = value.replace(/\s/g, '').replace(/['"`;\\<>{}()|]/g, '')
    } else {
      limpio = sanitizar(value).trimStart()
    }

    setForm(prev => ({ ...prev, [name]: limpio }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const e = {}

    // Número de identificación
    if (!form.numero_identificacion?.trim()) {
      e.numero_identificacion = 'Identificación requerida'
    } else if (form.tipo_identificacion === 'CED') {
      if (!/^\d{10}$/.test(form.numero_identificacion))
        e.numero_identificacion = 'La cédula debe tener exactamente 10 dígitos'
    } else if (form.tipo_identificacion === 'RUC') {
      if (!/^\d{13}$/.test(form.numero_identificacion))
        e.numero_identificacion = 'El RUC debe tener exactamente 13 dígitos'
    }

    // Nombres
    if (!form.nombres?.trim()) {
      e.nombres = 'Nombres requeridos'
    } else if (form.nombres.trim().length < 2) {
      e.nombres = 'El nombre debe tener al menos 2 caracteres'
    } else if (form.nombres.length > 160) {
      e.nombres = 'El nombre no puede exceder 160 caracteres'
    }

    // Apellidos
    if (!form.apellidos?.trim()) {
      e.apellidos = 'Apellidos requeridos'
    } else if (form.apellidos.trim().length < 2) {
      e.apellidos = 'El apellido debe tener al menos 2 caracteres'
    } else if (form.apellidos.length > 160) {
      e.apellidos = 'Los apellidos no pueden exceder 160 caracteres'
    }

    // Correo
    if (!form.correo?.trim()) {
      e.correo = 'Correo requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = 'Formato de correo inválido'
    } else if (form.correo.length > 150) {
      e.correo = 'El correo no puede exceder 150 caracteres'
    }

    // Teléfono
    if (!form.telefono?.trim()) {
      e.telefono = 'Teléfono requerido'
    } else if (form.telefono.replace(/[^0-9]/g, '').length < 7) {
      e.telefono = 'El teléfono debe tener al menos 7 dígitos'
    } else if (form.telefono.length > 30) {
      e.telefono = 'El teléfono no puede exceder 30 caracteres'
    }

    setErrores(e)
    return Object.keys(e).length === 0
  }

  function continuar() {
    if (!busquedaRealizada) {
      setErrores({ correoInput: 'Primero busca tu correo para continuar' })
      return
    }
    if (!validar()) return

    localStorage.setItem('redcar_reserva', JSON.stringify({
      ...reserva,
      cliente: form,
      cliente_existente: clienteExistente,
      id_cliente: clienteExistente?.id_cliente || null,
    }))
    navigate('/booking/confirmacion')
  }

  const diasText = busqueda?.dias
    ? `${busqueda.dias} ${busqueda.dias === 1 ? 'día' : 'días'}`
    : ''

  return (
    <div className={styles.page}>
      <BookingNavBar paso={4} />

      <div className={styles.container}>
        <div className={styles.layout}>
          <main className={styles.content}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🧾</span>
                <div>
                  <h2 className={styles.cardTitle}>Datos del titular de la reserva</h2>
                  <p className={styles.cardSub}>Ingresa el correo del titular. Esta persona será el cliente asociado a la reserva y a quien se emitirá la factura electrónica.</p>
                </div>
              </div>

              {/* Búsqueda por correo */}
              <div className={styles.correoSection}>
                <div className={styles.correoRow}>
                  <div className={styles.fieldGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Correo electrónico *</label>
                    <input
                      type="email"
                      className={`${styles.input} ${errores.correoInput ? styles.inputError : ''}`}
                      value={correoInput}
                      onChange={e => { setCorreoInput(e.target.value); setErrores(prev => ({ ...prev, correoInput: '' })) }}
                      onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                      placeholder="tucorreo@ejemplo.com"
                    />
                    {errores.correoInput && <span className={styles.errorMsg}>{errores.correoInput}</span>}
                  </div>
                  <button
                    className={styles.btnBuscarCorreo}
                    onClick={buscarCliente}
                    disabled={buscando}
                  >
                    {buscando ? '…' : '🔍 Verificar'}
                  </button>
                </div>

                {busquedaRealizada && clienteEncontrado && (
                  <div className={styles.alertSuccess}>
                    <span>✓</span>
                    <span>¡Te encontramos! Tus datos se han cargado automáticamente.</span>
                  </div>
                )}
                {busquedaRealizada && !clienteEncontrado && !clienteBloqueado && (
                  <div className={styles.alertInfo}>
                    <span>ℹ️</span>
                    <span>Correo no registrado. Completa el formulario para continuar y registrarte automáticamente.</span>
                  </div>
                )}
              </div>

              {/* Formulario cliente — solo si búsqueda exitosa y cliente no bloqueado */}
              {busquedaRealizada && !clienteBloqueado && (
                <div className={styles.formSection}>
                  <p className={styles.formSectionTitle}>
                    {clienteEncontrado ? 'Confirma tus datos' : 'Completa tu información'}
                  </p>

                  <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Tipo de identificación *</label>
                      <select
                        name="tipo_identificacion"
                        value={form.tipo_identificacion}
                        onChange={cambiar}
                        className={styles.select}
                        disabled={clienteEncontrado}
                      >
                        <option value="CED">Cédula</option>
                        <option value="RUC">RUC</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Número de identificación *</label>
                      <input
                        name="numero_identificacion"
                        value={form.numero_identificacion}
                        onChange={cambiar}
                        className={`${styles.input} ${errores.numero_identificacion ? styles.inputError : ''}`}
                        disabled={clienteEncontrado}
                        placeholder={form.tipo_identificacion === 'CED' ? '0102030405' : '0123456789001'}
                        maxLength={form.tipo_identificacion === 'CED' ? 10 : 13}
                        onKeyDown={e => /[^0-9]/.test(e.key) && e.key.length === 1 && e.preventDefault()}
                      />
                      {errores.numero_identificacion && <span className={styles.errorMsg}>{errores.numero_identificacion}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Nombres *</label>
                      <input
                        name="nombres"
                        value={form.nombres}
                        onChange={cambiar}
                        className={`${styles.input} ${errores.nombres ? styles.inputError : ''}`}
                        disabled={clienteEncontrado}
                        placeholder="Juan Carlos"
                        maxLength={160}
                      />
                      {errores.nombres && <span className={styles.errorMsg}>{errores.nombres}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Apellidos *</label>
                      <input
                        name="apellidos"
                        value={form.apellidos}
                        onChange={cambiar}
                        className={`${styles.input} ${errores.apellidos ? styles.inputError : ''}`}
                        disabled={clienteEncontrado}
                        placeholder="García Pérez"
                        maxLength={160}
                      />
                      {errores.apellidos && <span className={styles.errorMsg}>{errores.apellidos}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Correo *</label>
                      <input
                        name="correo"
                        type="email"
                        value={form.correo}
                        onChange={cambiar}
                        className={`${styles.input} ${errores.correo ? styles.inputError : ''}`}
                        disabled={true}
                        maxLength={150}
                        title="El correo corresponde al ingresado en la búsqueda"
                      />
                      {errores.correo && <span className={styles.errorMsg}>{errores.correo}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Teléfono *</label>
                      <input
                        name="telefono"
                        value={form.telefono}
                        onChange={cambiar}
                        className={`${styles.input} ${errores.telefono ? styles.inputError : ''}`}
                        disabled={clienteEncontrado}
                        placeholder="0991234567"
                        maxLength={30}
                      />
                      {errores.telefono && <span className={styles.errorMsg}>{errores.telefono}</span>}
                    </div>

                    <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Razon social / Empresa (opcional)</label>
                      <input
                        name="razon_social"
                        value={form.razon_social}
                        onChange={cambiar}
                        className={styles.input}
                        disabled={clienteEncontrado}
                        placeholder="Empresa S.A. (opcional)"
                        maxLength={200}
                      />
                    </div>

                    <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Dirección</label>
                      <input
                        name="direccion"
                        value={form.direccion}
                        onChange={cambiar}
                        className={styles.input}
                        disabled={clienteEncontrado}
                        placeholder="Av. Ejemplo 123, Quito"
                        maxLength={250}
                      />
                    </div>
                  </div>

                  {clienteEncontrado && (
                    <p className={styles.notaEdicion}>
                      ¿Tus datos no son correctos? Contacta a nuestro equipo de soporte.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.botonesRow}>
              <button className={styles.btnVolver} onClick={() => navigate('/booking/extras')}>
                ← Volver
              </button>
              <button className={styles.btnContinuar} onClick={continuar}>
                Revisar y confirmar →
              </button>
            </div>
          </main>

          {/* Resumen lateral */}
          <aside className={styles.resumen}>
            <div className={styles.resumenCard}>
              <h3 className={styles.resumenTitle}>Tu reserva</h3>
              {reserva?.vehiculo && (
                <>
                  <p className={styles.resumenVehNombre}>{reserva.vehiculo.modelo_vehiculo}</p>
                  <p className={styles.resumenVehSub}>{reserva.vehiculo.anio_fabricacion} · Cat. {reserva.vehiculo.id_categoria_vehiculo}</p>
                </>
              )}
              <div className={styles.resumenDivider} />
              <div className={styles.resumenRow}>
                <span>Duración</span>
                <span>{diasText}</span>
              </div>
              {reserva?.totales && (
                <>
                  <div className={styles.resumenRow}>
                    <span>Subtotal</span>
                    <span>${reserva.totales.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className={styles.resumenRow}>
                    <span>IVA (15%)</span>
                    <span>${reserva.totales.iva?.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.resumenRow} ${styles.resumenTotal}`}>
                    <span>Total</span>
                    <span>${reserva.totales.total?.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default BookingClientePage