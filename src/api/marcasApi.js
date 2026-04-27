import api from './axiosInstance'

export async function getMarcas() {
  const response = await api.get('/marcas-vehiculo')
  return response.data.data
}