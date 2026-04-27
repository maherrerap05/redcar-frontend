import { useState, useEffect } from 'react'
import { crearCliente, actualizarCliente } from '../../../api/clientesApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import styles from './ClienteFormModal.module.css'

const ESTADO_INICIAL = {
  tipo_identificacion: 'CEDULA',
  numero_identificacion: '',
  nombres: '',
  apellidos: '',
  razon_social: '',
  correo: '',
  telefono: '',
  direccion: '',
  estado: 'ACT',
}

function ClienteFormModal({ cliente, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const esEdicion = !!cliente

  useEffect(() => {
    if (cliente) {
      setForm({
        tipo_identificacion: cliente.tipo_identificacion || 'CEDULA',
        numero_identificacion: cliente.numero_identificacion || '',
        nombres: cliente.nombres || '',
        apellidos: cliente.apellidos || '',
        razon_social: cliente.razon_social || '',
        correo: cliente.correo || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        estado: cliente.estado || 'ACT',
      })
    }
  }, [cliente])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      if (esEdicion) {
        await actualizarCliente(cliente.id_cliente, form, usuario)
      } else {
        await crearCliente(form, usuario)
      }
      onGuardado(esEdicion)
    } catch (err) {
      setError(leerMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.grid}>

            <div className={styles.field}>
              <label className={styles.label}>Tipo de identificación</label>
              <select
                className={styles.input}
                name="tipo_identificacion"
                value={form.tipo_identificacion}
                onChange={handleChange}
              >
                <option value="CEDULA">Cédula</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="RUC">RUC</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Número de identificación</label>
              <input
                className={styles.input}
                name="numero_identificacion"
                value={form.numero_identificacion}
                onChange={handleChange}
                placeholder="1234567890"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombres</label>
              <input
                className={styles.input}
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                placeholder="Juan Carlos"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Apellidos</label>
              <input
                className={styles.input}
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                placeholder="Pérez López"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Correo electrónico</label>
              <input
                className={styles.input}
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="cliente@correo.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                className={styles.input}
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="0999999999"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Razón social</label>
              <input
                className={styles.input}
                name="razon_social"
                value={form.razon_social}
                onChange={handleChange}
                placeholder="Empresa S.A. (opcional)"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select
                className={styles.input}
                name="estado"
                value={form.estado}
                onChange={handleChange}
              >
                <option value="ACT">Activo</option>
                <option value="INA">Inactivo</option>
              </select>
            </div>

          </div>

          <div className={styles.field}>
            <label className={styles.label}>Dirección</label>
            <input
              className={styles.input}
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Av. Principal 123, Ciudad"
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClienteFormModal