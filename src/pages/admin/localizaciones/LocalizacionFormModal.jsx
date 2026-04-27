import { useState, useEffect } from 'react'
import { crearLocalizacion, actualizarLocalizacion } from '../../../api/localizacionesAdminApi'
import { leerMensajeError } from '../../../api/manejarError'
import { CIUDADES } from '../../../constants/ciudades'
import useAuthStore from '../../../store/useAuthStore'
import styles from './LocalizacionFormModal.module.css'

const BLOQUEAR_LETRAS = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

const ESTADO_INICIAL = {
  codigo_localizacion: '',
  nombre_localizacion: '',
  direccion_localizacion: '',
  telefono_contacto: '',
  correo_contacto: '',
  horario_atencion: '',
  zona_horaria: 'America/Guayaquil',
  id_ciudad: '',
  estado_localizacion: 'ACT',
}

function LocalizacionFormModal({ localizacion, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const esEdicion = !!localizacion

  useEffect(() => {
    if (localizacion) {
      setForm({
        codigo_localizacion: localizacion.codigo_localizacion || '',
        nombre_localizacion: localizacion.nombre_localizacion || '',
        direccion_localizacion: localizacion.direccion_localizacion || '',
        telefono_contacto: localizacion.telefono_contacto || '',
        correo_contacto: localizacion.correo_contacto || '',
        horario_atencion: localizacion.horario_atencion || '',
        zona_horaria: localizacion.zona_horaria || 'America/Guayaquil',
        id_ciudad: localizacion.id_ciudad || '',
        estado_localizacion: localizacion.estado_localizacion || 'ACT',
      })
    }
  }, [localizacion])

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
        id_ciudad: parseInt(form.id_ciudad),
      }
      if (esEdicion) {
        await actualizarLocalizacion(localizacion.id_localizacion, datos, usuario)
      } else {
        await crearLocalizacion(datos, usuario)
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
            {esEdicion ? 'Editar localización' : 'Nueva localización'}
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
                name="codigo_localizacion"
                value={form.codigo_localizacion}
                onChange={handleChange}
                placeholder="LOC-001"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                name="nombre_localizacion"
                value={form.nombre_localizacion}
                onChange={handleChange}
                placeholder="Aeropuerto Quito"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                className={styles.input}
                name="telefono_contacto"
                value={form.telefono_contacto}
                onChange={handleChange}
                placeholder="02-395-1000"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Correo</label>
              <input
                className={styles.input}
                type="email"
                name="correo_contacto"
                value={form.correo_contacto}
                onChange={handleChange}
                placeholder="sucursal@redcar.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <select
                className={styles.input}
                name="id_ciudad"
                value={form.id_ciudad}
                onChange={handleChange}
                required
              >
                <option value="">— Selecciona una ciudad —</option>
                {CIUDADES.map(c => (
                  <option key={c.id_ciudad} value={c.id_ciudad}>
                    {c.nombre} (ID {c.id_ciudad})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Zona horaria</label>
              <select
                className={styles.input}
                name="zona_horaria"
                value={form.zona_horaria}
                onChange={handleChange}
              >
                <option value="America/Guayaquil">America/Guayaquil (ECT)</option>
                <option value="America/Bogota">America/Bogota (COT)</option>
                <option value="America/Lima">America/Lima (PET)</option>
                <option value="America/Santiago">America/Santiago (CLT)</option>
                <option value="America/Mexico_City">America/Mexico_City (CST)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select
                className={styles.input}
                name="estado_localizacion"
                value={form.estado_localizacion}
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
              name="direccion_localizacion"
              value={form.direccion_localizacion}
              onChange={handleChange}
              placeholder="Av. Principal 123, Sector Norte"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Horario de atención</label>
            <input
              className={styles.input}
              name="horario_atencion"
              value={form.horario_atencion}
              onChange={handleChange}
              placeholder="Lunes a Domingo 06:00 - 22:00"
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear localización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LocalizacionFormModal