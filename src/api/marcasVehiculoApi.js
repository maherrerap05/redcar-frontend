import api from './axiosInstance'

export async function getMarcas(pagina = 1, tamano = 10) {
  const response = await api.post('/marcas-vehiculo/buscar', {
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

export async function buscarMarcas(filtros) {
  const response = await api.post('/marcas-vehiculo/buscar', filtros)
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function crearMarca(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
  }
  const response = await api.post('/marcas-vehiculo', payload)
  return response.data
}

export async function actualizarMarca(id, datos, usuario) {
  const payload = {
    ...datos,
    id_marca_vehiculo: id,
    modificado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
    motivo_inhabilitacion: datos.motivo_inhabilitacion || '',
  }
  const response = await api.put(`/marcas-vehiculo/${id}`, payload)
  return response.data
}

export async function eliminarMarca(id, motivo) {
  const response = await api.delete(`/marcas-vehiculo/${id}`, {
    params: { motivo }
  })
  return response.data
}