import { useState, useRef } from 'react'
import styles from './ImageUploader.module.css'

const CLOUD_NAME = 'dngmhkwug'
const UPLOAD_PRESET = 'redcar_vehiculos'

function ImageUploader({ urlActual, onUrlCambia }) {
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState(urlActual || '')
  const [error, setError] = useState('')
  const inputRef = useRef()

  async function handleArchivo(e) {
    const archivo = e.target.files[0]
    if (!archivo) return

    if (!archivo.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.')
      return
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB.')
      return
    }

    setError('')
    setSubiendo(true)

    try {
      const formData = new FormData()
      formData.append('file', archivo)
      formData.append('upload_preset', UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )

      const data = await response.json()

      if (data.secure_url) {
        setPreview(data.secure_url)
        onUrlCambia(data.secure_url)
      } else {
        setError('Error al subir la imagen. Intenta de nuevo.')
      }
    } catch {
      setError('Error de conexión con Cloudinary.')
    } finally {
      setSubiendo(false)
    }
  }

  function handleEliminarPreview() {
    setPreview('')
    onUrlCambia('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={styles.wrapper}>
      {preview ? (
        <div className={styles.previewWrapper}>
          <img src={preview} alt="Preview" className={styles.preview} />
          <button
            type="button"
            className={styles.btnEliminar}
            onClick={handleEliminarPreview}
          >
            ✕ Quitar imagen
          </button>
        </div>
      ) : (
        <div
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
        >
          {subiendo ? (
            <div className={styles.subiendo}>
              <div className={styles.spinner} />
              <span>Subiendo imagen...</span>
            </div>
          ) : (
            <>
              <span className={styles.icono}>📷</span>
              <span className={styles.texto}>Haz clic para seleccionar una imagen</span>
              <span className={styles.subtexto}>PNG, JPG o WEBP · Máx. 5MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleArchivo}
        style={{ display: 'none' }}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export default ImageUploader