import axios from 'axios'

const api = axios.create({
  baseURL: 'https://localhost:7095/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('redcar_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('redcar_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api