import api from './axiosInstance'

export async function getTotalCategorias() {
  const response = await api.get('/categorias-vehiculo')
  const data = response.data.data
  return Array.isArray(data) ? data.filter(c => !c.es_eliminado).length : 0
}

export async function getTotalClientes() {
  const response = await api.get('/clientes')
  const data = response.data.data
  return Array.isArray(data) ? data.filter(c => !c.es_eliminado).length : 0
}

export async function getTotalConductores() {
  const response = await api.get('/conductores')
  const data = response.data.data
  return Array.isArray(data) ? data.filter(c => !c.es_eliminado).length : 0
}

export async function getTotalExtras() {
  const response = await api.get('/extras')
  const data = response.data.data
  return Array.isArray(data) ? data.filter(e => !e.es_eliminado).length : 0
}

export async function getTotalLocalizaciones() {
  const response = await api.get('/localizaciones')
  const data = response.data.data
  return Array.isArray(data) ? data.filter(l => !l.es_eliminado).length : 0
}

export async function getTotalMarcas() {
  const response = await api.get('/marcas-vehiculo')
  const data = response.data.data
  return Array.isArray(data) ? data.filter(m => !m.es_eliminado).length : 0
}

export async function getReservasActivas() {
  const response = await api.get('/reservas/activas')
  const data = response.data.data
  return Array.isArray(data) ? data.length : 0
}

export async function getFacturasPorEstado(estado) {
  const response = await api.get(`/facturas/estado/${estado}`)
  const data = response.data.data
  return Array.isArray(data) ? data.length : 0
}