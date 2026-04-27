import { useState, useEffect } from 'react'
import { buscarClientes } from '../../../api/clientesApi'
import styles from './FacturaDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-EC', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function estadoBadge(estado) {
  const map = {
    ABI: { label: 'Abierta',   color: '#1A5276', bg: '#D6EAF8' },
    APR: { label: 'Aprobada',  color: '#1E8449', bg: '#D5F5E3' },
    ELI: { label: 'Eliminada', color: '#C0392B', bg: '#FADBD8' },
  }
  const { label, color, bg } = map[estado] || { label: estado, color: '#666', bg: '#eee' }
  return (
    <span style={{
      background: bg, color, padding: '0.2rem 0.65rem',
      borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600
    }}>{label}</span>
  )
}

function FacturaDetalleModal({ factura: f, onCerrar }) {
  const [nombreCliente, setNombreCliente] = useState('Cargando...')

  useEffect(() => {
    async function cargarCliente() {
      try {
        const res = await buscarClientes({ page_number: 1, page_size: 100 })
        const cliente = res.items?.find(c => c.id_cliente === f.id_cliente)
        setNombreCliente(cliente
          ? `${cliente.nombres} ${cliente.apellidos}`
          : `ID ${f.id_cliente}`)
      } catch {
        setNombreCliente(`ID ${f.id_cliente}`)
      }
    }
    cargarCliente()
  }, [f])

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle de factura</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>

          <p className={styles.seccion}>Identificación</p>
          <div className={styles.grid}>
            {campo('ID', f.id_factura)}
            {campo('Número', f.numero_factura)}
            {campo('GUID', f.guid_factura)}
            <div className={styles.campo}>
              <span className={styles.campoLabel}>Estado</span>
              <span>{estadoBadge(f.estado)}</span>
            </div>
          </div>

          <p className={styles.seccion}>Relaciones</p>
          <div className={styles.grid}>
            {campo('Cliente', nombreCliente)}
            {campo('ID Reserva', f.id_reserva)}
            {campo('Canal', f.origen_canal_factura)}
            {campo('Servicio origen', f.servicio_origen)}
          </div>

          <p className={styles.seccion}>Valores</p>
          <div className={styles.grid}>
            {campo('Subtotal', `$${f.subtotal?.toFixed(2) || '0.00'}`)}
            {campo('IVA', `$${f.valor_iva?.toFixed(2) || '0.00'}`)}
            {campo('Total', `$${f.total?.toFixed(2) || '0.00'}`)}
            {campo('Fecha emisión', formatFecha(f.fecha_emision))}
          </div>

          {f.observaciones_factura && (
            <>
              <p className={styles.seccion}>Observaciones</p>
              <p className={styles.observaciones}>{f.observaciones_factura}</p>
            </>
          )}

          <p className={styles.seccion}>Auditoría</p>
          <div className={styles.grid}>
            {campo('Creado por', f.creado_por_usuario)}
            {campo('Fecha registro', formatFecha(f.fecha_registro_utc))}
            {campo('Modificado por', f.modificado_por_usuario)}
            {campo('Fecha modificación', formatFecha(f.fecha_modificacion_utc))}
          </div>

          {f.es_eliminado && (
            <>
              <p className={styles.seccion}>Inhabilitación</p>
              <div className={styles.grid}>
                {campo('Fecha', formatFecha(f.fecha_inhabilitacion_utc))}
                {campo('Motivo', f.motivo_inhabilitacion)}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default FacturaDetalleModal