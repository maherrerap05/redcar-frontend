import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/authApi'
import useAuthStore from '../../store/useAuthStore'
import styles from './LoginPage.module.css'
import logoRedCar from '../../assets/LOGO_REDCAR.png'
import loginBg from '../../assets/login.jpg'

function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!usuario || !password) {
      setError('Por favor ingresa usuario y contraseña.')
      return
    }
    setCargando(true)
    try {
      const data = await login(usuario, password)
      setAuth(data.token)
      navigate('/admin/dashboard')
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'Credenciales incorrectas.'
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.page}>
      <div
        className={styles.fondo}
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className={styles.overlay} />

      <div className={styles.card}>
        <div className={styles.header}>
          <img src={logoRedCar} alt="RedCar" className={styles.logoImg} />
          <p className={styles.subtitle}>Panel Administrativo</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="text"
              className={styles.input}
              placeholder="Tu nombre de usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.button} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Eres cliente? <a href="/" className={styles.link}>Genera una Reserva Aquí</a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage