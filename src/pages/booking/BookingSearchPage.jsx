import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLocalizaciones, getCategorias } from '../../api/bookingApi'
import styles from './BookingSearchPage.module.css'

const LOGO_URL = '/LOGO_REDCAR.png'

function BookingSearchPage() {
  const navigate = useNavigate()
  const [localizaciones, setLocalizaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const hoy = new Date().toISOString().split('T')[0]
  const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [form, setForm] = useState(() => {
    // Restaurar búsqueda previa si el usuario volvió
    const guardado = JSON.parse(localStorage.getItem('redcar_busqueda') || '{}')
    if (guardado.idLocalizacionRecogida) {
      return {
        idLocalizacionRecogida: guardado.idLocalizacionRecogida || '',
        idLocalizacionDevolucion: guardado.idLocalizacionDevolucion || '',
        mismaLocalizacion: guardado.mismaLocalizacion ?? true,
        fechaRecogida: guardado.fechaRecogida?.split('T')[0] || hoy,
        horaRecogida: guardado.horaRecogida || '09:00',
        fechaDevolucion: guardado.fechaDevolucion?.split('T')[0] || manana,
        horaDevolucion: guardado.horaDevolucion || '09:00',
        idCategoria: guardado.idCategoria || '',
        transmision: guardado.transmision || '',
      }
    }
    return {
      idLocalizacionRecogida: '',
      idLocalizacionDevolucion: '',
      mismaLocalizacion: true,
      fechaRecogida: hoy,
      horaRecogida: '09:00',
      fechaDevolucion: manana,
      horaDevolucion: '09:00',
      idCategoria: '',
      transmision: '',
    }
  })

  const [errores, setErrores] = useState({})

  useEffect(() => {
    async function cargar() {
      // Localizaciones — críticas, el response real es data: array directo
      try {
        const locs = await getLocalizaciones()
        setLocalizaciones(Array.isArray(locs) ? locs : [])
      } catch {
        setError('No se pudo cargar las sucursales. Intenta de nuevo.')
      } finally {
        setCargando(false)
      }

      // Categorías — opcionales, 404 silencioso, no bloquea el buscador
      try {
        const cats = await getCategorias()
        setCategorias(Array.isArray(cats) ? cats : [])
      } catch {
        setCategorias([])
      }
    }
    cargar()
  }, [])

  function cambiar(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value }
      if (name === 'mismaLocalizacion' && checked) {
        next.idLocalizacionDevolucion = prev.idLocalizacionRecogida
      }
      if (name === 'idLocalizacionRecogida' && prev.mismaLocalizacion) {
        next.idLocalizacionDevolucion = value
      }
      return next
    })
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const e = {}
    if (!form.idLocalizacionRecogida) e.idLocalizacionRecogida = 'Selecciona una localización de recogida'
    if (!form.mismaLocalizacion && !form.idLocalizacionDevolucion) e.idLocalizacionDevolucion = 'Selecciona una localización de devolución'
    if (!form.fechaRecogida) e.fechaRecogida = 'Selecciona la fecha de recogida'
    if (!form.fechaDevolucion) e.fechaDevolucion = 'Selecciona la fecha de devolución'
    if (form.fechaRecogida && form.fechaDevolucion && form.fechaDevolucion <= form.fechaRecogida) {
      e.fechaDevolucion = 'La devolución debe ser posterior a la recogida'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function calcularDias() {
    if (!form.fechaRecogida || !form.fechaDevolucion) return 0
    const inicio = new Date(form.fechaRecogida)
    const fin = new Date(form.fechaDevolucion)
    const diff = Math.ceil((fin - inicio) / 86400000)
    return diff > 0 ? diff : 0
  }

  function buscar() {
    if (!validar()) return
    const locRecogida = localizaciones.find(l => String(l.id_localizacion) === String(form.idLocalizacionRecogida))
    const locDevolucion = form.mismaLocalizacion
      ? locRecogida
      : localizaciones.find(l => String(l.id_localizacion) === String(form.idLocalizacionDevolucion))

    const params = {
      idLocalizacionRecogida: form.idLocalizacionRecogida,
      idLocalizacionDevolucion: form.mismaLocalizacion
        ? form.idLocalizacionRecogida
        : form.idLocalizacionDevolucion,
      nombreLocalizacionRecogida: locRecogida?.nombre_localizacion || '',
      nombreLocalizacionDevolucion: locDevolucion?.nombre_localizacion || '',
      mismaLocalizacion: form.mismaLocalizacion,
      fechaRecogida: `${form.fechaRecogida}T${form.horaRecogida}:00`,
      fechaDevolucion: `${form.fechaDevolucion}T${form.horaDevolucion}:00`,
      horaRecogida: form.horaRecogida,
      horaDevolucion: form.horaDevolucion,
      idCategoria: form.idCategoria || undefined,
      transmision: form.transmision || undefined,
      dias: calcularDias(),
    }
    localStorage.setItem('redcar_busqueda', JSON.stringify(params))
    navigate('/booking/vehiculos')
  }

  const dias = calcularDias()

  return (
    <div className={styles.page}>
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.bgStripe} />
      </div>

      <header className={styles.header}>
        <img src={LOGO_URL} alt="RedCar" className={styles.logo} />
        <nav className={styles.nav}>
          <a href="/login" className={styles.navLink}>Área administrativa</a>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.heroEyebrow}>Renta de vehículos</p>
          <h1 className={styles.heroTitle}>
            Tu próxima<br />aventura <span className={styles.accent}>te espera</span>
          </h1>
          <p className={styles.heroSub}>
            Encuentra el vehículo perfecto para cada momento.
            Reserva en minutos, recoge cuando quieras.
          </p>
        </div>

        <div className={styles.card}>
          {cargando ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <p>Cargando sucursales…</p>
            </div>
          ) : error ? (
            <div className={styles.errorBox}>{error}</div>
          ) : (
            <>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🚗</span>
                <h2 className={styles.cardTitle}>¿A dónde vamos?</h2>
              </div>

              {/* Localización de recogida */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <span className={styles.labelIcon}>📍</span>
                  Localización de recogida
                </label>
                <select
                  name="idLocalizacionRecogida"
                  value={form.idLocalizacionRecogida}
                  onChange={cambiar}
                  className={`${styles.select} ${errores.idLocalizacionRecogida ? styles.inputError : ''}`}
                >
                  <option value="">Selecciona una sucursal…</option>
                  {localizaciones.map(l => (
                    <option key={l.id_localizacion} value={l.id_localizacion}>
                      {l.nombre_localizacion}
                    </option>
                  ))}
                </select>
                {errores.idLocalizacionRecogida && (
                  <span className={styles.errorMsg}>{errores.idLocalizacionRecogida}</span>
                )}
              </div>

              {/* Misma localización devolución */}
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  name="mismaLocalizacion"
                  checked={form.mismaLocalizacion}
                  onChange={cambiar}
                  className={styles.checkbox}
                />
                <span>Devolver en la misma sucursal de recogida</span>
              </label>

              {/* Localización devolución diferente */}
              {!form.mismaLocalizacion && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>🏁</span>
                    Localización de devolución
                  </label>
                  <select
                    name="idLocalizacionDevolucion"
                    value={form.idLocalizacionDevolucion}
                    onChange={cambiar}
                    className={`${styles.select} ${errores.idLocalizacionDevolucion ? styles.inputError : ''}`}
                  >
                    <option value="">Selecciona una sucursal…</option>
                    {localizaciones.map(l => (
                      <option key={l.id_localizacion} value={l.id_localizacion}>
                        {l.nombre_localizacion}
                      </option>
                    ))}
                  </select>
                  {errores.idLocalizacionDevolucion && (
                    <span className={styles.errorMsg}>{errores.idLocalizacionDevolucion}</span>
                  )}
                </div>
              )}

              {/* Fechas */}
              <div className={styles.fechasGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>📅</span>
                    Fecha de recogida
                  </label>
                  <input
                    type="date"
                    name="fechaRecogida"
                    value={form.fechaRecogida}
                    min={hoy}
                    onChange={cambiar}
                    className={`${styles.input} ${errores.fechaRecogida ? styles.inputError : ''}`}
                  />
                  {errores.fechaRecogida && (
                    <span className={styles.errorMsg}>{errores.fechaRecogida}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>🕐</span>
                    Hora de recogida
                  </label>
                  <input
                    type="time"
                    name="horaRecogida"
                    value={form.horaRecogida}
                    onChange={cambiar}
                    className={styles.input}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>📅</span>
                    Fecha de devolución
                  </label>
                  <input
                    type="date"
                    name="fechaDevolucion"
                    value={form.fechaDevolucion}
                    min={form.fechaRecogida || hoy}
                    onChange={cambiar}
                    className={`${styles.input} ${errores.fechaDevolucion ? styles.inputError : ''}`}
                  />
                  {errores.fechaDevolucion && (
                    <span className={styles.errorMsg}>{errores.fechaDevolucion}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>🕐</span>
                    Hora de devolución
                  </label>
                  <input
                    type="time"
                    name="horaDevolucion"
                    value={form.horaDevolucion}
                    onChange={cambiar}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Días calculados */}
              {dias > 0 && (
                <div className={styles.diasPill}>
                  <span className={styles.diasNum}>{dias}</span>
                  <span>{dias === 1 ? 'día de renta' : 'días de renta'}</span>
                </div>
              )}

              {/* Filtros opcionales */}
              <div className={styles.filtrosGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Categoría (opcional)</label>
                  <select
                    name="idCategoria"
                    value={form.idCategoria}
                    onChange={cambiar}
                    className={styles.select}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => (
                      <option key={c.id_categoria_vehiculo} value={c.id_categoria_vehiculo}>
                        {c.nombre_categoria_vehiculo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Transmisión (opcional)</label>
                  <select
                    name="transmision"
                    value={form.transmision}
                    onChange={cambiar}
                    className={styles.select}
                  >
                    <option value="">Cualquier transmisión</option>
                    <option value="AUTOMATICA">Automática</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              <button className={styles.btnBuscar} onClick={buscar}>
                <span>Buscar vehículos disponibles</span>
                <span className={styles.btnArrow}>→</span>
              </button>
            </>
          )}
        </div>

        {/* Features */}
        <div className={styles.features}>
          {[
            { icon: '🔒', title: 'Reserva segura', desc: 'Tu información está protegida en todo momento.' },
            { icon: '⚡', title: 'Confirmación inmediata', desc: 'Tu reserva se confirma al instante.' },
            { icon: '🌍', title: 'Múltiples sucursales', desc: 'Recoge y devuelve en distintas ubicaciones.' },
          ].map(f => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default BookingSearchPage