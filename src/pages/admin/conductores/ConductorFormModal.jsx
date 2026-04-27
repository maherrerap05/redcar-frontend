import { useState, useEffect } from 'react'
import { crearConductor, actualizarConductor } from '../../../api/conductoresApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import styles from './ConductorFormModal.module.css'

const BLOQUEAR_LETRAS = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

const ESTADO_INICIAL = {
  codigo_conductor: '',
  tipo_identificacion: 'CEDULA',
  numero_identificacion: '',
  con_nombre1: '',
  con_nombre2: '',
  con_apellido1: '',
  con_apellido2: '',
  numero_licencia: '',
  fecha_vencimiento_licencia: '',
  edad_conductor: '',
  con_telefono: '',
  con_correo: '',
  estado_conductor: 'ACT',
}

function ConductorFormModal({ conductor, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const esEdicion = !!conductor

  useEffect(() => {
    if (conductor) {
      setForm({
        codigo_conductor: conductor.codigo_conductor || '',
        tipo_identificacion: conductor.tipo_identificacion || 'CEDULA',
        numero_identificacion: conductor.numero_identificacion || '',
        con_nombre1: conductor.con_nombre1 || '',
        con_nombre2: conductor.con_nombre2 || '',
        con_apellido1: conductor.con_apellido1 || '',
        con_apellido2: conductor.con_apellido2 || '',
        numero_licencia: conductor.numero_licencia || '',
        fecha_vencimiento_licencia: conductor.fecha_vencimiento_licencia
          ? conductor.fecha_vencimiento_licencia.split('T')[0]
          : '',
        edad_conductor: conductor.edad_conductor || '',
        con_telefono: conductor.con_telefono || '',
        con_correo: conductor.con_correo || '',
        estado_conductor: conductor.estado_conductor || 'ACT',
      })
    }
  }, [conductor])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      const datos = {
        ...form,
        edad_conductor: parseInt(form.edad_conductor),
        fecha_vencimiento_licencia: form.fecha_vencimiento_licencia
          ? new Date(form.fecha_vencimiento_licencia).toISOString()
          : null,
      }
      if (esEdicion) {
        await actualizarConductor(conductor.id_conductor, datos, usuario)
      } else {
        await crearConductor(datos, usuario)
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
            {esEdicion ? 'Editar conductor' : 'Nuevo conductor'}
          </h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.grid}>

            <div className={styles.field}>
              <label className={styles.label}>Código</label>
              <input
                className={styles.input}
                name="codigo_conductor"
                value={form.codigo_conductor}
                onChange={handleChange}
                placeholder="COND-001"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tipo identificación</label>
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
              <label className={styles.label}>Número identificación</label>
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
              <label className={styles.label}>Primer nombre</label>
              <input
                className={styles.input}
                name="con_nombre1"
                value={form.con_nombre1}
                onChange={handleChange}
                placeholder="Juan"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Segundo nombre</label>
              <input
                className={styles.input}
                name="con_nombre2"
                value={form.con_nombre2}
                onChange={handleChange}
                placeholder="Carlos"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Primer apellido</label>
              <input
                className={styles.input}
                name="con_apellido1"
                value={form.con_apellido1}
                onChange={handleChange}
                placeholder="Pérez"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Segundo apellido</label>
              <input
                className={styles.input}
                name="con_apellido2"
                value={form.con_apellido2}
                onChange={handleChange}
                placeholder="López"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Número de licencia</label>
              <input
                className={styles.input}
                name="numero_licencia"
                value={form.numero_licencia}
                onChange={handleChange}
                placeholder="LIC-001"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Vencimiento licencia</label>
              <input
                className={styles.input}
                type="date"
                name="fecha_vencimiento_licencia"
                value={form.fecha_vencimiento_licencia}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Edad</label>
              <input
                className={styles.input}
                type="number"
                min="18"
                max="80"
                name="edad_conductor"
                value={form.edad_conductor}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                placeholder="25"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                className={styles.input}
                name="con_telefono"
                value={form.con_telefono}
                onChange={handleChange}
                placeholder="0999999999"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Correo</label>
              <input
                className={styles.input}
                type="email"
                name="con_correo"
                value={form.con_correo}
                onChange={handleChange}
                placeholder="conductor@correo.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select
                className={styles.input}
                name="estado_conductor"
                value={form.estado_conductor}
                onChange={handleChange}
              >
                <option value="ACT">Activo</option>
                <option value="INA">Inactivo</option>
              </select>
            </div>

          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear conductor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConductorFormModal