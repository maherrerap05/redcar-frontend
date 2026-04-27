import { useEffect, useState } from 'react'
import useAuthStore from '../../../store/useAuthStore'
import concesionario from '../../../assets/concesionario.jpg'
import {
  getTotalCategorias, getTotalClientes, getTotalConductores,
  getTotalExtras, getTotalLocalizaciones, getTotalMarcas,
  getReservasActivas, getFacturasPorEstado,
} from '../../../api/dashboardApi'
import styles from './DashboardPage.module.css'

function DashboardPage() {
  const { usuario, rol } = useAuthStore()
  const [datos, setDatos] = useState({
    reservasActivas: 0, facturasAbiertas: 0, facturasAprobadas: 0,
    clientes: 0, conductores: 0, extras: 0,
    categorias: 0, marcas: 0, localizaciones: 0,
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [
          reservasActivas, facturasAbiertas, facturasAprobadas,
          clientes, conductores, extras, categorias, marcas, localizaciones,
        ] = await Promise.all([
          getReservasActivas(), getFacturasPorEstado('ABI'), getFacturasPorEstado('APR'),
          getTotalClientes(), getTotalConductores(), getTotalExtras(),
          getTotalCategorias(), getTotalMarcas(), getTotalLocalizaciones(),
        ])
        setDatos({
          reservasActivas, facturasAbiertas, facturasAprobadas,
          clientes, conductores, extras, categorias, marcas, localizaciones,
        })
      } catch { } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const ahora = new Date().toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  function Stat({ label, valor }) {
    return (
      <div className={styles.miniStat}>
        <p className={styles.miniLabel}>{label}</p>
        {cargando
          ? <div className={styles.skeleton} />
          : <p className={styles.miniValor}>{valor}</p>}
      </div>
    )
  }

  function Tarjeta({ titulo, valor, color, icono }) {
    return (
      <div className={styles.tarjeta}>
        <div className={styles.tarjetaAccent} style={{ background: color }} />
        <div className={styles.tarjetaIcono} style={{ background: `${color}22`, color }}>
          {icono}
        </div>
        {cargando
          ? <div className={styles.skeleton} />
          : <p className={styles.tarjetaValor}>{valor}</p>}
        <p className={styles.tarjetaLabel}>{titulo}</p>
      </div>
    )
  }

  function TarjetaChica({ titulo, valor, color }) {
    return (
      <div className={styles.tarjeta}>
        <div className={styles.tarjetaAccent} style={{ background: color }} />
        {cargando
          ? <div className={styles.skeleton} />
          : <p className={styles.tarjetaValorChico}>{valor}</p>}
        <p className={styles.tarjetaLabel}>{titulo}</p>
      </div>
    )
  }

  return (
    <div className={styles.heroWrapper}>

      <div className={styles.heroIzquierda}>
        <div className={styles.bienvenida}>
          <div className={styles.bienvenidaTop}>
            <div>
              <h1 className={styles.greeting}>Bienvenido, {usuario} 👋</h1>
              <p className={styles.fecha}>{ahora}</p>
            </div>
            <span className={styles.rolBadge}>
              {rol === 'ADMIN' ? '⚙ Administrador' : '🧑‍💼 Vendedor'}
            </span>
          </div>
          <div className={styles.miniGrid}>
            <Stat label="Reservas activas" valor={datos.reservasActivas} />
            <Stat label="Facturas abiertas" valor={datos.facturasAbiertas} />
            <Stat label="Facturas aprobadas" valor={datos.facturasAprobadas} />
          </div>
        </div>

        <p className={styles.seccion}>Operaciones</p>
        <div className={styles.gridOp}>
          <Tarjeta titulo="Reservas activas" valor={datos.reservasActivas} color="#378ADD" icono="📋" />
          <Tarjeta titulo="Facturas abiertas" valor={datos.facturasAbiertas} color="#BA7517" icono="🧾" />
          <Tarjeta titulo="Facturas aprobadas" valor={datos.facturasAprobadas} color="#1D9E75" icono="✅" />
          <Tarjeta titulo="Clientes registrados" valor={datos.clientes} color="#7F77DD" icono="👤" />
          <Tarjeta titulo="Conductores registrados" valor={datos.conductores} color="#D85A30" icono="🚗" />
        </div>

        <p className={styles.seccion}>Catálogos</p>
        <div className={styles.gridCat}>
          <TarjetaChica titulo="Extras disponibles" valor={datos.extras} color="#1D9E75" />
          <TarjetaChica titulo="Categorías de vehículo" valor={datos.categorias} color="#185FA5" />
          <TarjetaChica titulo="Marcas de vehículo" valor={datos.marcas} color="#7F77DD" />
          <TarjetaChica titulo="Localizaciones" valor={datos.localizaciones} color="#BA7517" />
        </div>
      </div>

      <div className={styles.imagenCard}>
        <img src={concesionario} alt="Concesionario RedCar" className={styles.imagen} />
        <div className={styles.imagenOverlay}>
          <p className={styles.imagenTitulo}>RedCar Concesionario</p>
          <p className={styles.imagenSub}>Alquiler de vehículos premium</p>
        </div>
      </div>

    </div>
  )
}

export default DashboardPage