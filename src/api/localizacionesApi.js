import api from './axiosInstance'

export async function getLocalizaciones() {
  const response = await api.get('/localizaciones')
  return response.data.data
}