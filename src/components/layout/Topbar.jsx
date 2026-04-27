import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import styles from './Topbar.module.css'

function Topbar() {
  const { usuario, rol, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h2 className={styles.title}>Panel Administrativo</h2>
      </div>
      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{usuario}</span>
          <span className={styles.userRol}>{rol}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

export default Topbar