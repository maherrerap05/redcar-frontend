import styles from './CategoriaDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function CategoriaDetalleModal({ categoria: c, onCerrar }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle de categoría</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>

          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', c.id_categoria_vehiculo)}
            {campo('Código', c.codigo_categoria_vehiculo)}
            {campo('GUID', c.categoria_vehiculo_guid)}
          </div>

          <p className={styles.seccion}>Información</p>
          <div className={styles.grid}>
            {campo('Nombre', c.nombre_categoria_vehiculo)}
            {campo('Estado', c.estado_categoria_vehiculo === 'ACT' ? 'Activo' : 'Inactivo')}
            {campo('Origen registro', c.origen_registro)}
          </div>

          {c.descripcion_categoria_vehiculo && (
            <>
              <p className={styles.seccion}>Descripción</p>
              <p className={styles.descripcion}>{c.descripcion_categoria_vehiculo}</p>
            </>
          )}

          <p className={styles.seccion}>Auditoría</p>
          <div className={styles.grid}>
            {campo('Creado por', c.creado_por_usuario)}
            {campo('Fecha registro', c.fecha_registro_utc?.replace('T', ' '))}
            {campo('Modificado por', c.modificado_por_usuario)}
            {campo('Fecha modificación', c.fecha_modificacion_utc?.replace('T', ' '))}
          </div>

          {c.es_eliminado && (
            <>
              <p className={styles.seccion}>Inhabilitación</p>
              <div className={styles.grid}>
                {campo('Fecha inhabilitación', c.fecha_inhabilitacion_utc?.replace('T', ' '))}
                {campo('Motivo', c.motivo_inhabilitacion)}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default CategoriaDetalleModal