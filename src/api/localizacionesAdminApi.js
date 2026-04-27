import api from './axiosInstance'

export async function getLocalizaciones(pagina = 1, tamano = 10) {
  const response = await api.post('/localizaciones/buscar', {
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

export async function buscarLocalizaciones(filtros) {
  const response = await api.post('/localizaciones/buscar', filtros)
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function crearLocalizacion(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
  }
  const response = await api.post('/localizaciones', payload)
  return response.data
}

export async function actualizarLocalizacion(id, datos, usuario) {
  const payload = {
    ...datos,
    id_localizacion: id,
    modificado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
    motivo_inhabilitacion: datos.motivo_inhabilitacion || '',
  }
  const response = await api.put(`/localizaciones/${id}`, payload)
  return response.data
}

export async function eliminarLocalizacion(id, motivo) {
  const response = await api.delete(`/localizaciones/${id}`, {
    params: { motivo }
  })
  return response.data
}