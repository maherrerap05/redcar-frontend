import styles from './ExtraDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function ExtraDetalleModal({ extra: e, onCerrar }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle del extra</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>

          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', e.id_extra)}
            {campo('Código', e.codigo_extra)}
            {campo('GUID', e.extra_guid)}
          </div>

          <p className={styles.seccion}>Información</p>
          <div className={styles.grid}>
            {campo('Nombre', e.nombre_extra)}
            {campo('Valor fijo', `$${e.valor_fijo}`)}
            {campo('Estado', e.estado_extra === 'ACT' ? 'Activo' : 'Inactivo')}
            {campo('Origen registro', e.origen_registro)}
          </div>

          {e.descripcion_extra && (
            <>
              <p className={styles.seccion}>Descripción</p>
              <p className={styles.descripcion}>{e.descripcion_extra}</p>
            </>
          )}

          <p className={styles.seccion}>Auditoría</p>
          <div className={styles.grid}>
            {campo('Creado por', e.creado_por_usuario)}
            {campo('Fecha registro', e.fecha_registro_utc?.replace('T', ' '))}
            {campo('Modificado por', e.modificado_por_usuario)}
            {campo('Fecha modificación', e.fecha_modificacion_utc?.replace('T', ' '))}
          </div>

          {e.es_eliminado && (
            <>
              <p className={styles.seccion}>Inhabilitación</p>
              <div className={styles.grid}>
                {campo('Fecha inhabilitación', e.fecha_inhabilitacion_utc?.replace('T', ' '))}
                {campo('Motivo', e.motivo_inhabilitacion)}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default ExtraDetalleModal