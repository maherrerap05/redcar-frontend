import styles from './ConductorDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function ConductorDetalleModal({ conductor: c, onCerrar }) {
  const licenciaVencida = c.fecha_vencimiento_licencia
    ? new Date(c.fecha_vencimiento_licencia) < new Date()
    : false

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle del conductor</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>

          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', c.id_conductor)}
            {campo('Código', c.codigo_conductor)}
            {campo('Tipo identificación', c.tipo_identificacion)}
            {campo('Número identificación', c.numero_identificacion)}
            {campo('GUID', c.conductor_guid)}
          </div>

          <p className={styles.seccion}>Datos personales</p>
          <div className={styles.grid}>
            {campo('Primer nombre', c.con_nombre1)}
            {campo('Segundo nombre', c.con_nombre2)}
            {campo('Primer apellido', c.con_apellido1)}
            {campo('Segundo apellido', c.con_apellido2)}
            {campo('Edad', c.edad_conductor ? `${c.edad_conductor} años` : '—')}
            {campo('Teléfono', c.con_telefono)}
            {campo('Correo', c.con_correo)}
          </div>

          <p className={styles.seccion}>Licencia</p>
          <div className={styles.grid}>
            {campo('Número licencia', c.numero_licencia)}
            <div className={styles.campo}>
              <span className={styles.campoLabel}>Vencimiento</span>
              <span className={`${styles.campoValor} ${licenciaVencida ? styles.vencida : ''}`}>
                {c.fecha_vencimiento_licencia
                  ? new Date(c.fecha_vencimiento_licencia).toLocaleDateString('es-EC')
                  : '—'}
                {licenciaVencida && ' ⚠ Vencida'}
              </span>
            </div>
          </div>

          <p className={styles.seccion}>Estado</p>
          <div className={styles.grid}>
            {campo('Estado', c.estado_conductor === 'ACT' ? 'Activo' : 'Inactivo')}
            {campo('Origen registro', c.origen_registro)}
          </div>

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

export default ConductorDetalleModal