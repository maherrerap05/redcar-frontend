import api from './axiosInstance'

export async function getCategorias() {
  const response = await api.get('/categorias-vehiculo')
  return response.data.data
}