import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

function parsearToken(token) {
  if (!token) return { token: null, usuario: null, rol: null }
  try {
    const decoded = jwtDecode(token)
    const rolRaw = decoded[ROLE_CLAIM] || decoded.role
    const rol = Array.isArray(rolRaw) ? rolRaw[0] : rolRaw
    return {
      token,
      usuario: decoded.unique_name || decoded.sub,
      rol,
    }
  } catch {
    localStorage.removeItem('redcar_token')
    return { token: null, usuario: null, rol: null }
  }
}

const tokenGuardado = localStorage.getItem('redcar_token')

const useAuthStore = create((set) => ({
  ...parsearToken(tokenGuardado),

  setAuth: (token) => {
    localStorage.setItem('redcar_token', token)
    set(parsearToken(token))
  },

  logout: () => {
    localStorage.removeItem('redcar_token')
    set({ token: null, usuario: null, rol: null })
  },
}))

export default useAuthStore