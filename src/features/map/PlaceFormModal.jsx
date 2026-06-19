import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX } from 'react-icons/hi'
import { usePlacesStore } from '@/stores/placesStore'

export const PLACE_TYPES = [
  { value: 'origin', label: 'Quê hương gốc', color: '#FCD34D', icon: '🏡' },
  { value: 'clan_house', label: 'Nhà thờ / Từ đường', color: '#FB923C', icon: '⛩' },
  { value: 'grave', label: 'Mộ phần', color: '#94A3B8', icon: '🪦' },
  { value: 'branch', label: 'Nơi cư trú / Chi', color: '#4ADE80', icon: '🏘' },
  { value: 'memorial', label: 'Di tích / Kỷ niệm', color: '#A855F7', icon: '🏛' },
]

const PRESET_COLORS = ['#FCD34D', '#FB923C', '#94A3B8', '#4ADE80', '#38BDF8', '#A855F7', '#F472B6', '#C9A84C']

const EMPTY_FORM = {
  name: '',
  type: 'origin',
  color: '#FCD34D',
  description: '',
  year: '',
  province: '',
  note: '',
  members: [],
  svgX: 110,
  svgY: 240,
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 13,
  background: 'rgba(30,41,59,0.7)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: 7,
  color: '#F1F5F9',
  outline: 'none',
  boxSizing: 'border-box',
}

const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
      {label}{required && <span style={{ color: '#F87171', marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
)

const PlaceFormModal = ({ isOpen, onClose, editPlace = null }) => {
  const { savePlace, generateId, places } = usePlacesStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [memberInput, setMemberInput] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return
    if (editPlace) {
      setForm({ ...EMPTY_FORM, ...editPlace })
    } else {
      setForm({ ...EMPTY_FORM })
    }
    setMemberInput('')
  }, [isOpen, editPlace])

  // Auto-fill color when type changes
  const handleTypeChange = (type) => {
    const preset = PLACE_TYPES.find((t) => t.value === type)
    setForm((f) => ({ ...f, type, color: preset?.color ?? f.color }))
  }

  const addMember = () => {
    const id = memberInput.trim()
    if (id && !form.members.includes(id)) {
      setForm((f) => ({ ...f, members: [...f.members, id] }))
    }
    setMemberInput('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const id = editPlace?.id ?? generateId()
    savePlace({ ...form, id })
    setSaving(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 301,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              pointerEvents: 'none',
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: 480,
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#0F172A',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 16,
                padding: '24px 24px 20px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 20 }}>
                  {PLACE_TYPES.find((t) => t.value === form.type)?.icon ?? '📍'}
                </span>
                <h2 style={{ flex: 1, fontSize: 16, fontWeight: 800, color: '#F1F5F9', margin: 0 }}>
                  {editPlace ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: 'rgba(148,163,184,0.1)', border: 'none', borderRadius: 6, padding: 5, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
                >
                  <HiX size={16} />
                </button>
              </div>

              {/* Name */}
              <Field label="Tên địa điểm" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Nhà thờ họ Lê Văn"
                  style={inputStyle}
                  required
                />
              </Field>

              {/* Type + Color */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Loại" required>
                  <select
                    value={form.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {PLACE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Màu sắc">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 3 }}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: c,
                          border: form.color === c ? '2.5px solid #fff' : '2px solid transparent',
                          cursor: 'pointer',
                          boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </div>
                </Field>
              </div>

              {/* Province + Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Tỉnh / Địa chỉ" required>
                  <input
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    placeholder="VD: Quảng Nam"
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label="Năm">
                  <input
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    placeholder="VD: 1950"
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Description */}
              <Field label="Mô tả">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn về địa điểm..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              </Field>

              {/* Note */}
              <Field label="Ghi chú / Địa chỉ chi tiết">
                <input
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="VD: Thôn Tân Lộc, xã Tam Phước..."
                  style={inputStyle}
                />
              </Field>

              {/* Members */}
              <Field label="Thành viên liên quan (ID)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6, minHeight: 28 }}>
                  {form.members.map((id) => (
                    <span
                      key={id}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 20, color: '#7DD3FC' }}
                    >
                      {id}
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, members: f.members.filter((x) => x !== id) }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0, display: 'flex' }}
                      >
                        <HiX size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember() } }}
                    placeholder="g1-001, g2-003..."
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addMember}
                    style={{ padding: '9px 14px', borderRadius: 7, background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38BDF8', fontSize: 12, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    Thêm
                  </button>
                </div>
              </Field>

              {/* Info about position */}
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,85,247,0.07)', border: '1px dashed rgba(168,85,247,0.25)', marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#A855F7', margin: 0, lineHeight: 1.5 }}>
                  📍 Vị trí trên bản đồ: ({Math.round(form.svgX)}, {Math.round(form.svgY)}) — sau khi lưu, admin có thể kéo thả ghim để điều chỉnh.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)', background: 'transparent', color: '#94A3B8', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.name.trim()}
                  style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#FB923C', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s' }}
                >
                  {saving ? 'Đang lưu...' : editPlace ? 'Lưu thay đổi' : 'Thêm địa điểm'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PlaceFormModal