import { useEffect, useState } from 'react'
import { getCategorias } from '../../../api/categoriasApi'
import { getMarcas } from '../../../api/marcasApi'
import { getLocalizaciones } from '../../../api/localizacionesApi'
import styles from './VehiculoDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function VehiculoDetalleModal({ vehiculo: v, onCerrar }) {
  const [nombreMarca, setNombreMarca] = useState('Cargando...')
  const [nombreCategoria, setNombreCategoria] = useState('Cargando...')
  const [nombreLocalizacion, setNombreLocalizacion] = useState('Cargando...')

  useEffect(() => {
    async function cargarNombres() {
      try {
        const [marcas, categorias, localizaciones] = await Promise.all([
          getMarcas(),
          getCategorias(),
          getLocalizaciones(),
        ])
        const marca = marcas.find(m => m.id_marca_vehiculo === v.id_marca_vehiculo)
        const categoria = categorias.find(c => c.id_categoria_vehiculo === v.id_categoria_vehiculo)
        const localizacion = localizaciones.find(l => l.id_localizacion === v.localizacion_actual)
        setNombreMarca(marca?.nombre_marca_vehiculo ?? `ID ${v.id_marca_vehiculo}`)
        setNombreCategoria(categoria?.nombre_categoria_vehiculo ?? `ID ${v.id_categoria_vehiculo}`)
        setNombreLocalizacion(localizacion?.nombre_localizacion ?? `ID ${v.localizacion_actual}`)
      } catch {
        setNombreMarca(`ID ${v.id_marca_vehiculo}`)
        setNombreCategoria(`ID ${v.id_categoria_vehiculo}`)
        setNombreLocalizacion(`ID ${v.localizacion_actual}`)
      }
    }
    cargarNombres()
  }, [v])

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle del vehículo</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>
          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', v.id_vehiculo)}
            {campo('Código interno', v.codigo_interno_vehiculo)}
            {campo('Placa', v.placa_vehiculo)}
            {campo('GUID', v.vehiculo_guid)}
          </div>

          <p className={styles.seccion}>Características</p>
          <div className={styles.grid}>
            {campo('Modelo', v.modelo_vehiculo)}
            {campo('Año', v.anio_fabricacion)}
            {campo('Color', v.color_vehiculo)}
            {campo('Combustible', v.tipo_combustible)}
            {campo('Transmisión', v.tipo_transmision)}
            {campo('Pasajeros', v.capacidad_pasajeros)}
            {campo('Maletas', v.capacidad_maletas)}
            {campo('Puertas', v.numero_puertas)}
            {campo('Aire acondicionado', v.aire_acondicionado ? 'Sí' : 'No')}
          </div>

          <p className={styles.seccion}>Operación</p>
          <div className={styles.grid}>
            {campo('Marca', nombreMarca)}
            {campo('Categoría', nombreCategoria)}
            {campo('Localización actual', nombreLocalizacion)}
            {campo('Precio base/día', `$${v.precio_base_dia}`)}
            {campo('Kilometraje', v.kilometraje_actual)}
            {campo('Estado', v.estado_vehiculo === 'ACT' ? 'Activo' : 'Inactivo')}
            {campo('Origen registro', v.origen_registro)}
          </div>

          <p className={styles.seccion}>Auditoría</p>
          <div className={styles.grid}>
            {campo('Creado por', v.creado_por_usuario)}
            {campo('Fecha registro', v.fecha_registro_utc?.replace('T', ' '))}
            {campo('Modificado por', v.modificado_por_usuario)}
            {campo('Fecha modificación', v.fecha_modificacion_utc?.replace('T', ' '))}
            {campo('IP modificación', v.modificado_desde_ip)}
          </div>

          {v.es_eliminado && (
            <>
              <p className={styles.seccion}>Inhabilitación</p>
              <div className={styles.grid}>
                {campo('Fecha inhabilitación', v.fecha_inhabilitacion_utc?.replace('T', ' '))}
                {campo('Motivo', v.motivo_inhabilitacion)}
              </div>
            </>
          )}

          {v.observaciones_generales && (
            <>
              <p className={styles.seccion}>Observaciones</p>
              <p className={styles.observaciones}>{v.observaciones_generales}</p>
            </>
          )}

          {v.imagen_referencial_url && (
            <>
              <p className={styles.seccion}>Imagen</p>
              <p className={styles.url}>{v.imagen_referencial_url}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VehiculoDetalleModal