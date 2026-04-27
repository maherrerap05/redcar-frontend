import styles from './ClienteDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function ClienteDetalleModal({ cliente: c, onCerrar }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle del cliente</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>

          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', c.id_cliente)}
            {campo('Tipo', c.tipo_identificacion)}
            {campo('Número', c.numero_identificacion)}
            {campo('GUID', c.cliente_guid)}
          </div>

          <p className={styles.seccion}>Datos personales</p>
          <div className={styles.grid}>
            {campo('Nombres', c.nombres)}
            {campo('Apellidos', c.apellidos)}
            {campo('Razón social', c.razon_social)}
            {campo('Correo', c.correo)}
            {campo('Teléfono', c.telefono)}
            {campo('Dirección', c.direccion)}
            {campo('Estado', c.estado === 'ACT' ? 'Activo' : 'Inactivo')}
            {campo('Servicio origen', c.servicio_origen)}
          </div>

          <p className={styles.seccion}>Auditoría</p>
          <div className={styles.grid}>
            {campo('Creado por', c.creado_por_usuario)}
            {campo('Fecha registro', c.fecha_registro_utc?.replace('T', ' '))}
            {campo('Modificado por', c.modificado_por_usuario)}
            {campo('Fecha modificación', c.fecha_modificacion_utc?.replace('T', ' '))}
            {campo('IP modificación', c.modificacion_ip)}
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

export default ClienteDetalleModal