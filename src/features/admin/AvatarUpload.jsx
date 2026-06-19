import React, { useRef, useState } from 'react'
import { HiCamera, HiX } from 'react-icons/hi'

// Compress image to JPEG ≤ maxPx × maxPx, ~85% quality
function compressImage(file, maxPx = 220) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * AvatarUpload — circular avatar picker with inline compression.
 *
 * Props:
 *   value        {string|null}  Current data-URL or null
 *   onChange     {function}     Called with new data-URL (or null on remove)
 *   name         {string}       Member name — used for initials fallback
 *   accentColor  {string}       Border/accent color
 *   size         {number}       Avatar circle diameter in px (default 80)
 */
const AvatarUpload = ({ value, onChange, name = '', accentColor = '#F97316', size = 80 }) => {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const initial = name.trim()
    ? name.trim().split(' ').pop().charAt(0).toUpperCase()
    : '?'

  const processFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ảnh không được lớn hơn 10 MB')
      return
    }
    setError('')
    setLoading(true)
    try {
      const dataUrl = await compressImage(file)
      onChange(dataUrl)
    } catch {
      setError('Lỗi khi xử lý ảnh')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {/* Circle avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          title="Click hoặc kéo thả ảnh vào đây"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            border: dragOver
              ? `2.5px solid ${accentColor}`
              : `2px solid ${accentColor}60`,
            boxShadow: dragOver ? `0 0 0 3px ${accentColor}30` : 'none',
            background: value ? 'transparent' : `${accentColor}12`,
            transition: 'border 0.15s, box-shadow 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <span style={{ fontSize: 22, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
          ) : value ? (
            <img
              src={value}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <span
              style={{
                fontSize: size * 0.38,
                fontWeight: 800,
                color: accentColor,
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          )}

          {/* Camera overlay on hover */}
          <div
            className="avatar-hover-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s',
              borderRadius: '50%',
            }}
          >
            <HiCamera size={size * 0.32} color="#fff" />
          </div>
        </div>

        {/* Remove button */}
        {value && !loading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            title="Xóa ảnh"
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#EF4444',
              border: '2px solid #0F172A',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <HiX size={10} />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Instructions */}
      <div>
        <p style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600, marginBottom: 4 }}>Ảnh đại diện</p>
        <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6 }}>
          Click vào khung hoặc kéo thả ảnh vào đây.
          <br />
          Ảnh sẽ được tự động nén về 220×220 px.
          <br />
          Chấp nhận: JPG, PNG, WebP, GIF...
        </p>
        {error && (
          <p style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>{error}</p>
        )}
      </div>

      {/* Hover CSS — injected once */}
      <style>{`
        div[title="Click hoặc kéo thả ảnh vào đây"]:hover .avatar-hover-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  )
}

export default AvatarUpload