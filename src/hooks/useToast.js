import { useState, useCallback } from 'react'

function useToast() {
  const [toast, setToast] = useState(null)

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    setToast({ mensaje, tipo })
  }, [])

  const cerrarToast = useCallback(() => {
    setToast(null)
  }, [])

  return { toast, mostrarToast, cerrarToast }
}

export default useToast