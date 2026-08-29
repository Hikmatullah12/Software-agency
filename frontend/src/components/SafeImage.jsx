import { useState } from 'react'

export default function SafeImage({ src, alt, className = '', fallback = 'Image unavailable', ...props }) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return <div className={`image-fallback ${className}`} role="img" aria-label={alt || fallback}>{fallback}</div>
  }

  return <img {...props} className={className} src={src} alt={alt} onError={() => setFailed(true)} />
}
