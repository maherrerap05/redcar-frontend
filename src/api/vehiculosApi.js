import api from './axiosInstance'

export async function getVehiculos(pagina = 1, tamano = 10) {
  const response = await api.post('/vehiculos/buscar', {
    page_number: pagina,
    page_size: tamano,
  })
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function getVehiculoPorId(id) {
  const response = await api.get(`/vehiculos/${id}`)
  return response.data.data
}

export async function crearVehiculo(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
  }
  const response = await api.post('/vehiculos', payload)
  return response.data
}

export async function actualizarVehiculo(id, datos, usuario) {
  const payload = {
    ...datos,
    id_vehiculo: id,
    modificado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
    motivo_inhabilitacion: datos.motivo_inhabilitacion || '',
  }
  const response = await api.put(`/vehiculos/${id}`, payload)
  return response.data
}

export async function eliminarVehiculo(id, motivo, usuario) {
  const response = await api.delete(`/vehiculos/${id}`, {
    data: {
      motivo_inhabilitacion: motivo,
      modificado_por_usuario: usuario,
    }
  })
  return response.data
}

export async function buscarVehiculos(filtros) {
  const response = await api.post('/vehiculos/buscar', filtros)
  const data = response.data.data
  // el endpoint buscar puede devolver { items: [...] } o directamente un array
  if (Array.isArray(data)) return data
  if (data?.items) return data.items
  if (data?.vehiculos) return data.vehiculos
  return []
}