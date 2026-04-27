import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './AdminLayout.module.css'

function AdminLayout() {
  const { token, rol } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (rol === 'CLIENTE') return <Navigate to="/" replace />

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout