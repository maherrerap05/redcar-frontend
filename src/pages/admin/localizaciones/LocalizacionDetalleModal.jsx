import { getNombreCiudad } from '../../../constants/ciudades'
import styles from './LocalizacionDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function LocalizacionDetalleModal({ localizacion: l, onCerrar }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle de localización</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>

          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', l.id_localizacion)}
            {campo('Código', l.codigo_localizacion)}
            {campo('GUID', l.localizacion_guid)}
          </div>

          <p className={styles.seccion}>Información</p>
          <div className={styles.grid}>
            {campo('Nombre', l.nombre_localizacion)}
            {campo('Ciudad', getNombreCiudad(l.id_ciudad))}
            {campo('Dirección', l.direccion_localizacion)}
            {campo('Teléfono', l.telefono_contacto)}
            {campo('Correo', l.correo_contacto)}
            {campo('Horario', l.horario_atencion)}
            {campo('Zona horaria', l.zona_horaria)}
            {campo('Estado', l.estado_localizacion === 'ACT' ? 'Activo' : 'Inactivo')}
            {campo('Origen registro', l.origen_registro)}
          </div>

          <p className={styles.seccion}>Auditoría</p>
          <div className={styles.grid}>
            {campo('Creado por', l.creado_por_usuario)}
            {campo('Fecha registro', l.fecha_registro_utc?.replace('T', ' '))}
            {campo('Modificado por', l.modificado_por_usuario)}
            {campo('Fecha modificación', l.fecha_modificacion_utc?.replace('T', ' '))}
          </div>

          {l.es_eliminado && (
            <>
              <p className={styles.seccion}>Inhabilitación</p>
              <div className={styles.grid}>
                {campo('Fecha inhabilitación', l.fecha_inhabilitacion_utc?.replace('T', ' '))}
                {campo('Motivo', l.motivo_inhabilitacion)}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default LocalizacionDetalleModal