import { useRef, useState } from 'react'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024

export default function ImageDropzone({ label = 'Image', existingUrl, onChange, hint = 'JPG, PNG, or WEBP — max 5MB' }) {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function validateAndSet(file) {
    setError('')
    if (!file) return
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError('Only JPG, PNG, or WEBP images are allowed.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be 5MB or smaller.')
      return
    }
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    validateAndSet(event.dataTransfer.files?.[0])
  }

  function clearImage() {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayUrl = preview || existingUrl

  return (
    <div className="image-dropzone-field">
      <span className="field-label">{label}</span>
      <div
        className={`image-dropzone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      >
        {displayUrl ? (
          <div className="dropzone-preview">
            <img src={displayUrl} alt="Selected upload preview" />
          </div>
        ) : (
          <div className="dropzone-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p>Drag &amp; drop an image, or click to browse</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
      <div className="dropzone-footer">
        <small className="muted">{hint}</small>
        {displayUrl && (
          <button type="button" className="link-button" onClick={clearImage}>Remove image</button>
        )}
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  )
}
