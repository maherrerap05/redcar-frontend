import styles from './MarcaDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function MarcaDetalleModal({ marca: m, onCerrar }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle de marca</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>

          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', m.id_marca_vehiculo)}
            {campo('Código', m.codigo_marca_vehiculo)}
            {campo('GUID', m.marca_vehiculo_guid)}
          </div>

          <p className={styles.seccion}>Información</p>
          <div className={styles.grid}>
            {campo('Nombre', m.nombre_marca_vehiculo)}
            {campo('Estado', m.estado_marca_vehiculo === 'ACT' ? 'Activo' : 'Inactivo')}
            {campo('Origen registro', m.origen_registro)}
          </div>

          {m.descripcion_marca_vehiculo && (
            <>
              <p className={styles.seccion}>Descripción</p>
              <p className={styles.descripcion}>{m.descripcion_marca_vehiculo}</p>
            </>
          )}

          <p className={styles.seccion}>Auditoría</p>
          <div className={styles.grid}>
            {campo('Creado por', m.creado_por_usuario)}
            {campo('Fecha registro', m.fecha_registro_utc?.replace('T', ' '))}
            {campo('Modificado por', m.modificado_por_usuario)}
            {campo('Fecha modificación', m.fecha_modificacion_utc?.replace('T', ' '))}
          </div>

          {m.es_eliminado && (
            <>
              <p className={styles.seccion}>Inhabilitación</p>
              <div className={styles.grid}>
                {campo('Fecha inhabilitación', m.fecha_inhabilitacion_utc?.replace('T', ' '))}
                {campo('Motivo', m.motivo_inhabilitacion)}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default MarcaDetalleModal