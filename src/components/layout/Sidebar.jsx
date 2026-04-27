import { NavLink } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import logoRedCar from '../../assets/LOGO_REDCAR.png'
import styles from './Sidebar.module.css'

const navItems = [
  { label: 'Dashboard',      path: '/admin/dashboard',      roles: ['ADMIN', 'VENDEDOR'] },
  { label: 'Vehículos',      path: '/admin/vehiculos',      roles: ['ADMIN', 'VENDEDOR'] },
  { label: 'Clientes',       path: '/admin/clientes',       roles: ['ADMIN', 'VENDEDOR'] },
  { label: 'Conductores',    path: '/admin/conductores',    roles: ['ADMIN', 'VENDEDOR'] },
  { label: 'Reservas',       path: '/admin/reservas',       roles: ['ADMIN', 'VENDEDOR'] },
  { label: 'Facturas',       path: '/admin/facturas',       roles: ['ADMIN', 'VENDEDOR'] },
  { label: 'Extras',         path: '/admin/extras',         roles: ['ADMIN'] },
  { label: 'Localizaciones', path: '/admin/localizaciones', roles: ['ADMIN'] },
  { label: 'Categorías',     path: '/admin/categorias',     roles: ['ADMIN'] },
  { label: 'Marcas',         path: '/admin/marcas',         roles: ['ADMIN'] },
]

function Sidebar() {
  const { rol } = useAuthStore()
  const itemsVisibles = navItems.filter(item => item.roles.includes(rol))

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={logoRedCar} alt="RedCar" className={styles.logoImg} />
      </div>

      <nav className={styles.nav}>
        {itemsVisibles.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar