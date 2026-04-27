import { useState, useEffect } from 'react'
import { crearVehiculo, actualizarVehiculo } from '../../../api/vehiculosApi'
import { getCategorias } from '../../../api/categoriasApi'
import { getMarcas } from '../../../api/marcasApi'
import { getLocalizaciones } from '../../../api/localizacionesApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import styles from './VehiculoFormModal.module.css'
import ImageUploader from '../../../components/ui/ImageUploader'

const BLOQUEAR_LETRAS = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

const ESTADO_INICIAL = {
  codigo_interno_vehiculo: '',
  placa_vehiculo: '',
  modelo_vehiculo: '',
  anio_fabricacion: '',
  color_vehiculo: '',
  tipo_combustible: 'GASOLINA',
  tipo_transmision: 'AUTOMATICA',
  capacidad_pasajeros: '',
  capacidad_maletas: '',
  numero_puertas: '',
  localizacion_actual: '',
  precio_base_dia: '',
  kilometraje_actual: '',
  observaciones_generales: '',
  imagen_referencial_url: '',
  estado_vehiculo: 'ACT',
  id_marca_vehiculo: '',
  id_categoria_vehiculo: '',
  aire_acondicionado: true,
}

function VehiculoFormModal({ vehiculo, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [localizaciones, setLocalizaciones] = useState([])
  const [cargandoOpciones, setCargandoOpciones] = useState(true)
  const esEdicion = !!vehiculo

  useEffect(() => {
    async function cargarOpciones() {
      try {
        const [cats, mars, locs] = await Promise.all([
          getCategorias(),
          getMarcas(),
          getLocalizaciones(),
        ])
        setCategorias(cats.filter(c => c.estado_categoria_vehiculo === 'ACT' && !c.es_eliminado))
        setMarcas(mars.filter(m => m.estado_marca_vehiculo === 'ACT' && !m.es_eliminado))
        setLocalizaciones(locs.filter(l => l.estado_localizacion === 'ACT' && !l.es_eliminado))
      } catch {
        setError('Error al cargar opciones del formulario.')
      } finally {
        setCargandoOpciones(false)
      }
    }
    cargarOpciones()
  }, [])

  useEffect(() => {
    if (vehiculo) {
      setForm({
        codigo_interno_vehiculo: vehiculo.codigo_interno_vehiculo || '',
        placa_vehiculo: vehiculo.placa_vehiculo || '',
        modelo_vehiculo: vehiculo.modelo_vehiculo || '',
        anio_fabricacion: vehiculo.anio_fabricacion || '',
        color_vehiculo: vehiculo.color_vehiculo || '',
        tipo_combustible: vehiculo.tipo_combustible || 'GASOLINA',
        tipo_transmision: vehiculo.tipo_transmision || 'AUTOMATICA',
        capacidad_pasajeros: vehiculo.capacidad_pasajeros || '',
        capacidad_maletas: vehiculo.capacidad_maletas || '',
        numero_puertas: vehiculo.numero_puertas || '',
        localizacion_actual: vehiculo.localizacion_actual || '',
        precio_base_dia: vehiculo.precio_base_dia || '',
        kilometraje_actual: vehiculo.kilometraje_actual || '',
        observaciones_generales: vehiculo.observaciones_generales || '',
        imagen_referencial_url: vehiculo.imagen_referencial_url || '',
        estado_vehiculo: vehiculo.estado_vehiculo || 'ACT',
        id_marca_vehiculo: vehiculo.id_marca_vehiculo || '',
        id_categoria_vehiculo: vehiculo.id_categoria_vehiculo || '',
        aire_acondicionado: vehiculo.aire_acondicionado ?? true,
      })
    }
  }, [vehiculo])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      const datos = {
        ...form,
        anio_fabricacion: parseInt(form.anio_fabricacion),
        capacidad_pasajeros: parseInt(form.capacidad_pasajeros),
        capacidad_maletas: parseInt(form.capacidad_maletas),
        numero_puertas: parseInt(form.numero_puertas),
        localizacion_actual: parseInt(form.localizacion_actual),
        precio_base_dia: parseFloat(form.precio_base_dia),
        kilometraje_actual: parseInt(form.kilometraje_actual),
        id_marca_vehiculo: parseInt(form.id_marca_vehiculo),
        id_categoria_vehiculo: parseInt(form.id_categoria_vehiculo),
      }
      if (esEdicion) {
        await actualizarVehiculo(vehiculo.id_vehiculo, datos, usuario)
      } else {
        await crearVehiculo(datos, usuario)
      }
      onGuardado(esEdicion)
    } catch (err) {
      setError(leerMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoOpciones) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.cargando}>Cargando formulario...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>
            {esEdicion ? 'Editar vehículo' : 'Nuevo vehículo'}
          </h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.grid}>

            <div className={styles.field}>
              <label className={styles.label}>Código interno</label>
              <input className={styles.input} name="codigo_interno_vehiculo"
                value={form.codigo_interno_vehiculo} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Placa</label>
              <input className={styles.input} name="placa_vehiculo"
                value={form.placa_vehiculo} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Modelo</label>
              <input className={styles.input} name="modelo_vehiculo"
                value={form.modelo_vehiculo} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Año de fabricación</label>
              <input
                className={styles.input}
                type="number"
                min="1900"
                max="2100"
                name="anio_fabricacion"
                value={form.anio_fabricacion}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Color</label>
              <input className={styles.input} name="color_vehiculo"
                value={form.color_vehiculo} onChange={handleChange} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Combustible</label>
              <select className={styles.input} name="tipo_combustible"
                value={form.tipo_combustible} onChange={handleChange}>
                <option value="GASOLINA">Gasolina</option>
                <option value="DIESEL">Diésel</option>
                <option value="HIBRIDO">Híbrido</option>
                <option value="ELECTRICO">Eléctrico</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Transmisión</label>
              <select className={styles.input} name="tipo_transmision"
                value={form.tipo_transmision} onChange={handleChange}>
                <option value="AUTOMATICA">Automática</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Pasajeros</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="50"
                name="capacidad_pasajeros"
                value={form.capacidad_pasajeros}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Maletas</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                max="20"
                name="capacidad_maletas"
                value={form.capacidad_maletas}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Puertas</label>
              <input
                className={styles.input}
                type="number"
                min="2"
                max="6"
                name="numero_puertas"
                value={form.numero_puertas}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Precio base/día ($)</label>
              <input
                className={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                name="precio_base_dia"
                value={form.precio_base_dia}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Kilometraje actual</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                name="kilometraje_actual"
                value={form.kilometraje_actual}
                onChange={handleChange}
                onKeyDown={BLOQUEAR_LETRAS}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Marca</label>
              <select className={styles.input} name="id_marca_vehiculo"
                value={form.id_marca_vehiculo} onChange={handleChange} required>
                <option value="">— Selecciona una marca —</option>
                {marcas.map(m => (
                  <option key={m.id_marca_vehiculo} value={m.id_marca_vehiculo}>
                    {m.nombre_marca_vehiculo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Categoría</label>
              <select className={styles.input} name="id_categoria_vehiculo"
                value={form.id_categoria_vehiculo} onChange={handleChange} required>
                <option value="">— Selecciona una categoría —</option>
                {categorias.map(c => (
                  <option key={c.id_categoria_vehiculo} value={c.id_categoria_vehiculo}>
                    {c.nombre_categoria_vehiculo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Localización actual</label>
              <select className={styles.input} name="localizacion_actual"
                value={form.localizacion_actual} onChange={handleChange} required>
                <option value="">— Selecciona una localización —</option>
                {localizaciones.map(l => (
                  <option key={l.id_localizacion} value={l.id_localizacion}>
                    {l.nombre_localizacion}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select className={styles.input} name="estado_vehiculo"
                value={form.estado_vehiculo} onChange={handleChange}>
                <option value="ACT">Activo</option>
                <option value="INA">Inactivo</option>
              </select>
            </div>

          </div>

          <div className={styles.field}>
            <label className={styles.label}>Imagen del vehículo</label>
            <ImageUploader
              urlActual={form.imagen_referencial_url}
              onUrlCambia={(url) => setForm(prev => ({ ...prev, imagen_referencial_url: url }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Observaciones</label>
            <textarea className={styles.input} name="observaciones_generales"
              value={form.observaciones_generales} onChange={handleChange} rows={3} />
          </div>

          <div className={styles.checkField}>
            <input type="checkbox" id="aire" name="aire_acondicionado"
              checked={form.aire_acondicionado} onChange={handleChange} />
            <label htmlFor="aire">Aire acondicionado</label>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear vehículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VehiculoFormModal