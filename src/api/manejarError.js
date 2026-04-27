export function leerMensajeError(err) {
  const data = err?.response?.data

  if (!data) return 'Error de conexión con el servidor.'

  if (typeof data === 'string') return data

  // el backend devuelve Message con M mayúscula
  if (data.Message) return data.Message
  if (data.message) return data.message
  if (data.mensaje) return data.mensaje

  if (data.Errors && data.Errors.length > 0) return data.Errors[0]
  if (data.errors) {
    const primero = Object.values(data.errors)[0]
    return Array.isArray(primero) ? primero[0] : primero
  }

  return 'Ocurrió un error inesperado.'
}