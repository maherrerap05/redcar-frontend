import api from './axiosInstance'

export async function getFacturas(pagina = 1, tamano = 10) {
  const response = await api.post('/facturas/buscar', {
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

export async function buscarFacturas(filtros) {
  const response = await api.post('/facturas/buscar', filtros)
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function getFacturaPorId(id) {
  const response = await api.get(`/facturas/${id}`)
  return response.data.data
}

export async function crearFactura(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificacion_ip: '127.0.0.1',
    servicio_origen: 'WEB',
  }
  const response = await api.post('/facturas', payload)
  return response.data
}

export async function aprobarFactura(id) {
  const response = await api.post(`/facturas/${id}/aprobar`)
  return response.data
}

export async function eliminarFactura(id, motivo) {
  const response = await api.delete(`/facturas/${id}`, {
    params: { motivo }
  })
  return response.data
}

export async function actualizarFactura(id, datos, usuario) {
  const payload = {
    ...datos,
    id_factura: id,
    modificado_por_usuario: usuario,
    modificacion_ip: '127.0.0.1',
    servicio_origen: 'WEB',
  }
  const response = await api.put(`/facturas/${id}`, payload)
  return response.data
}