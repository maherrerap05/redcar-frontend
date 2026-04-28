import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buscarVehiculosDisponibles, getCategorias } from '../../api/bookingApi'
import styles from './BookingVehiculosPage.module.css'

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || ''

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

function VehiculoCard({ vehiculo, busqueda, onSeleccionar }) {
  // Normalizar campos según el response real del backend
  const v = {
    id: vehiculo.id_vehiculo,
    marcaModelo: vehiculo.modelo_vehiculo ?? '—',
    anio: vehiculo.anio_fabricacion,
    transmision: vehiculo.tipo_transmision,
    combustible: vehiculo.tipo_combustible,
    capacidadPasajeros: vehiculo.capacidad_pasajeros,
    capacidadMaletas: vehiculo.capacidad_maletas,
    numeroPuertas: vehiculo.numero_puertas,
    aireAcondicionado: vehiculo.aire_acondicionado,
    estado: vehiculo.estado_vehiculo,
    categoria: { nombre: `Cat. ${vehiculo.id_categoria_vehiculo}` },
    precio: vehiculo.precio_base_dia ?? 0,
    extrasDisponibles: vehiculo.extrasDisponibles ?? [],
    imagenUrl: vehiculo.imagen_referencial_url ?? null,
  }
  // imagen_referencial_url ya es URL absoluta
  const imagen = v.imagenUrl ?? null
  const dias = busqueda?.dias || 1
  const totalEstimado = (v.precio || 0) * dias

  return (
    <div className={styles.card}>
      <div className={styles.cardImgWrap}>
        {imagen ? (
          <img src={imagen} alt={v.marcaModelo} className={styles.cardImg} />
        ) : (
          <div className={styles.cardImgPlaceholder}>🚗</div>
        )}
        <span className={`${styles.badge} ${v.estado === 'DISPONIBLE' || v.estado === 'ACT' ? styles.badgeOk : styles.badgeNo}`}>
          {v.estado === 'DISPONIBLE' || v.estado === 'ACT' ? 'Disponible' : vehiculo.estado}
        </span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div>
            <p className={styles.cardCategoria}>{v.categoria?.nombre}</p>
            <h3 className={styles.cardNombre}>{v.marcaModelo}</h3>
            <p className={styles.cardAnio}>{v.anio}</p>
          </div>
          <div className={styles.cardPrecio}>
            <p className={styles.precioBase}>${(v.precio || 0).toFixed(2)}</p>
            <p className={styles.precioDia}>/día</p>
          </div>
        </div>

        <div className={styles.specs}>
          <span className={styles.spec}>👥 {v.capacidadPasajeros} pasajeros</span>
          <span className={styles.spec}>🧳 {v.capacidadMaletas} maletas</span>
          <span className={styles.spec}>🚪 {v.numeroPuertas} puertas</span>
          <span className={styles.spec}>⚙️ {v.transmision === 'AUTOMATICA' ? 'Automático' : 'Manual'}</span>
          <span className={styles.spec}>⛽ {v.combustible}</span>
          {v.aireAcondicionado && <span className={styles.spec}>❄️ A/C</span>}
        </div>

        {v.extrasDisponibles?.length > 0 && (
          <div className={styles.extras}>
            <p className={styles.extrasLabel}>Extras disponibles:</p>
            <div className={styles.extrasTags}>
              {v.extrasDisponibles.slice(0, 3).map((e, i) => (
                <span key={e.id ?? e.id_extra ?? i} className={styles.extraTag}>
                  {e.nombre_extra ?? e.nombre}
                </span>
              ))}
              {v.extrasDisponibles.length > 3 && (
                <span className={styles.extraTag}>+{v.extrasDisponibles.length - 3} más</span>
              )}
            </div>
          </div>
        )}

        <div className={styles.cardFooter}>

          <button
            className={styles.btnSeleccionar}
            onClick={() => onSeleccionar(vehiculo)}
            disabled={v.estado !== 'DISPONIBLE' && v.estado !== 'ACT'}
          >
            Seleccionar →
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingVehiculosPage() {
  const navigate = useNavigate()
  const busqueda = JSON.parse(localStorage.getItem('redcar_busqueda') || 'null')

  const [vehiculos, setVehiculos] = useState([])
  const [todosVehiculos, setTodosVehiculos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [filtros, setFiltros] = useState({
    idCategoria: busqueda?.idCategoria || '',
    transmision: busqueda?.transmision || '',
    sort: 'precio_asc',
  })

  useEffect(() => {
    if (!busqueda) { navigate('/booking'); return }
    cargarVehiculos()
  }, [])

  // Cuando cambian los filtros, filtramos localmente sin nueva llamada al backend
  useEffect(() => {
    if (todosVehiculos.length > 0) {
      aplicarFiltros(todosVehiculos, filtros)
    }
  }, [filtros])

  useEffect(() => {
    getCategorias().then(d => setCategorias(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  async function cargarVehiculos() {
    setCargando(true)
    setError(null)
    try {
      const data = await buscarVehiculosDisponibles({
        idLocalizacionRecogida: busqueda.idLocalizacionRecogida,
        fechaRecogida: busqueda.fechaRecogida,
        fechaDevolucion: busqueda.fechaDevolucion,
      })
      // El controller devuelve IReadOnlyList<VehiculoResponse> — array directo
      const todos = Array.isArray(data) ? data : []
      setTodosVehiculos(todos)
      aplicarFiltros(todos, filtros)
    } catch {
      setError('No se pudo cargar los vehículos disponibles.')
    } finally {
      setCargando(false)
    }
  }

  function aplicarFiltros(lista, f) {
    let resultado = [...lista]
    if (f.idCategoria) {
      resultado = resultado.filter(v => String(v.id_categoria_vehiculo) === String(f.idCategoria))
    }
    if (f.transmision) {
      resultado = resultado.filter(v => v.tipo_transmision === f.transmision)
    }
    if (f.sort === 'precio_desc') {
      resultado.sort((a, b) => (b.precio_base_dia || 0) - (a.precio_base_dia || 0))
    } else {
      resultado.sort((a, b) => (a.precio_base_dia || 0) - (b.precio_base_dia || 0))
    }
    setVehiculos(resultado)
    setTotalPaginas(1)
  }

  function cambiarFiltro(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  function seleccionar(vehiculo) {
    const reserva = JSON.parse(localStorage.getItem('redcar_reserva') || '{}')
    localStorage.setItem('redcar_reserva', JSON.stringify({
      ...reserva,
      vehiculo,
      id_vehiculo: vehiculo.id_vehiculo ?? vehiculo.id,
    }))
    navigate('/booking/extras')
  }

  return (
    <div className={styles.page}>
      <BookingNavBar paso={2} />

      <div className={styles.container}>
        {/* Resumen búsqueda mejorado */}
        <div className={styles.resumenBusqueda}>
          <div className={styles.resumenDatos}>
            <div className={styles.resumenItem}>
              <span className={styles.resumenItemIcon}>📍</span>
              <div>
                <p className={styles.resumenItemLabel}>Recogida</p>
                <p className={styles.resumenItemValor}>{busqueda?.nombreLocalizacionRecogida || `Sucursal ${busqueda?.idLocalizacionRecogida}`}</p>
                <p className={styles.resumenItemSub}>{busqueda?.fechaRecogida?.split('T')[0]} · {busqueda?.horaRecogida}</p>
              </div>
            </div>
            <div className={styles.resumenFlecha}>→</div>
            <div className={styles.resumenItem}>
              <span className={styles.resumenItemIcon}>🏁</span>
              <div>
                <p className={styles.resumenItemLabel}>Devolución</p>
                <p className={styles.resumenItemValor}>
                  {busqueda?.mismaLocalizacion
                    ? (busqueda?.nombreLocalizacionRecogida || `Sucursal ${busqueda?.idLocalizacionRecogida}`)
                    : (busqueda?.nombreLocalizacionDevolucion || `Sucursal ${busqueda?.idLocalizacionDevolucion}`)}
                </p>
                <p className={styles.resumenItemSub}>{busqueda?.fechaDevolucion?.split('T')[0]} · {busqueda?.horaDevolucion}</p>
              </div>
            </div>
            <div className={styles.resumenPill}>
              <span className={styles.resumenPillNum}>{busqueda?.dias}</span>
              <span>{busqueda?.dias === 1 ? 'día' : 'días'}</span>
            </div>
          </div>
          <button className={styles.btnModificar} onClick={() => navigate('/booking')}>
            ✏️ Modificar
          </button>
        </div>

        <div className={styles.layout}>
          {/* Filtros laterales */}
          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Filtrar resultados</h3>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Categoría</label>
              <select name="idCategoria" value={filtros.idCategoria} onChange={cambiarFiltro} className={styles.filterSelect}>
                <option value="">Todas</option>
                {categorias.map(c => (
                  <option key={c.id_categoria_vehiculo ?? c.id} value={c.id_categoria_vehiculo ?? c.id}>
                    {c.nombre_categoria_vehiculo ?? c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Transmisión</label>
              <select name="transmision" value={filtros.transmision} onChange={cambiarFiltro} className={styles.filterSelect}>
                <option value="">Cualquiera</option>
                <option value="AUTOMATICA">Automática</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ordenar por</label>
              <select name="sort" value={filtros.sort} onChange={cambiarFiltro} className={styles.filterSelect}>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
            </div>

            <button className={styles.btnLimpiar} onClick={() => setFiltros({ idCategoria: '', transmision: '', sort: 'precio_asc' })}>
              Limpiar filtros
            </button>
          </aside>

          {/* Grid de vehículos */}
          <main className={styles.content}>
            {cargando ? (
              <div className={styles.loadingBox}>
                <div className={styles.spinner} />
                <p>Buscando vehículos disponibles…</p>
              </div>
            ) : error ? (
              <div className={styles.errorBox}>
                <p>{error}</p>
                <button onClick={cargarVehiculos} className={styles.btnRetry}>Reintentar</button>
              </div>
            ) : vehiculos.length === 0 ? (
              <div className={styles.emptyBox}>
                <span className={styles.emptyIcon}>🔍</span>
                <h3>No hay vehículos disponibles</h3>
                <p>Prueba con otras fechas o ajusta los filtros.</p>
                <button onClick={() => navigate('/booking')} className={styles.btnModificar}>
                  Cambiar búsqueda
                </button>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {vehiculos.map((v, idx) => (
                    <VehiculoCard
                      key={v.id_vehiculo ?? v.id ?? idx}
                      vehiculo={v}
                      busqueda={busqueda}
                      onSeleccionar={seleccionar}
                    />
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className={styles.paginacion}>
                    <button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)} className={styles.btnPag}>← Anterior</button>
                    <span className={styles.pagInfo}>Página {paginaActual} de {totalPaginas}</span>
                    <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(p => p + 1)} className={styles.btnPag}>Siguiente →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default BookingVehiculosPage