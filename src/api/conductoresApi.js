import api from './axiosInstance'

export async function getConductores(pagina = 1, tamano = 10) {
  const response = await api.post('/conductores/buscar', {
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

export async function buscarConductores(filtros) {
  const response = await api.post('/conductores/buscar', filtros)
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function getConductorPorIdentificacion(numeroIdentificacion) {
  const response = await api.get(
    `/marketplace/conductores/identificacion/${numeroIdentificacion}`
  )
  return response.data.data
}

export async function crearConductorBooking(datos) {
  const payload = {
    ...datos,
    // numero_licencia se asigna en el backend automáticamente
    // si no viene, pero lo enviamos igual por consistencia
    numero_licencia: datos.numero_licencia || datos.numero_identificacion,
    creado_por_usuario: 'BOOKING_WEB',
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
  }
  const response = await api.post('/marketplace/conductores', payload)
  return response.data.data
}

export async function crearConductor(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
  }
  const response = await api.post('/conductores', payload)
  return response.data
}

export async function actualizarConductor(id, datos, usuario) {
  const payload = {
    ...datos,
    id_conductor: id,
    modificado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
    motivo_inhabilitacion: datos.motivo_inhabilitacion || '',
  }
  const response = await api.put(`/conductores/${id}`, payload)
  return response.data
}

export async function eliminarConductor(id, motivo) {
  const response = await api.delete(`/conductores/${id}`, {
    params: { motivo }
  })
  return response.data
}

export async function getConductorPorId(id) {
  const response = await api.get(`/conductores/${id}`)
  return response.data.data
}