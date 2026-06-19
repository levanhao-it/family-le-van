import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiPlus, HiTrash } from 'react-icons/hi'
import { useMembersStore } from '@/stores/membersStore'
import AvatarUpload from './AvatarUpload'

const ROLES = ['patriarch', 'matriarch', 'elder', 'merit', 'member', 'child']
const BRANCHES = ['main', 'sy', 'nhut', 'ly', 'thong']
const ROLE_LABELS = { patriarch: 'Thủy tổ', matriarch: 'Tổ mẫu', elder: 'Trưởng thượng', merit: 'Người có công', member: 'Thành viên', child: 'Con cháu' }
const BRANCH_LABELS = { main: 'Thủy tổ (main)', sy: 'Chi Sỹ', nhut: 'Chi Nhứt', ly: 'Chi Lý', thong: 'Chi Thông' }

const EMPTY_FORM = {
  fullName: '',
  nickname: '',
  gender: 'male',
  generation: 2,
  role: 'member',
  birthDate: '',
  deathDate: '',
  isAlive: true,
  occupation: '',
  biography: '',
  location: '',
  branch: 'main',
  fatherId: '',
  motherId: '',
  spouseIds: [],
  childrenIds: [],
  achievements: [],
  avatar: null,
}

// Field label component
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
      {label}{required && <span style={{ color: '#F87171', marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
)

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

const selectStyle = { ...inputStyle, cursor: 'pointer' }

// Comma-separated ID list editor
const IdListField = ({ label, value, onChange, placeholder, members }) => {
  const [input, setInput] = useState('')

  const addId = () => {
    const id = input.trim()
    if (id && !value.includes(id)) onChange([...value, id])
    setInput('')
  }

  return (
    <Field label={label}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
        {value.map((id) => {
          const m = members.find((x) => x.id === id)
          return (
            <span
              key={id}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 20, color: '#7DD3FC' }}
            >
              {m ? m.fullName : id}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex', lineHeight: 1 }}
              >
                <HiX size={10} />
              </button>
            </span>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          list={`${label}-datalist`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addId())}
          placeholder={placeholder || 'Nhập ID hoặc chọn...'}
          style={{ ...inputStyle, flex: 1 }}
        />
        <datalist id={`${label}-datalist`}>
          {members.filter((m) => !value.includes(m.id)).map((m) => (
            <option key={m.id} value={m.id}>{m.fullName} ({m.id})</option>
          ))}
        </datalist>
        <button type="button" onClick={addId} style={{ padding: '0 12px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 7, color: '#38BDF8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <HiPlus size={16} />
        </button>
      </div>
    </Field>
  )
}

const MemberFormModal = ({ isOpen, onClose, editMember = null, layout = 'overlay' }) => {
  const { members, saveMember, generateId, isModified, resetMember } = useMembersStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saved, setSaved] = useState(false)
  const isEdit = !!editMember
  const isSheetLayout = layout === 'sheet'

  useEffect(() => {
    if (isOpen) {
      setSaved(false)
      if (editMember) {
        setForm({
          ...EMPTY_FORM,
          ...editMember,
          birthDate: editMember.birthDate?.split('T')[0] ?? '',
          deathDate: editMember.deathDate?.split('T')[0] ?? '',
          spouseIds: editMember.spouseIds ?? [],
          childrenIds: editMember.childrenIds ?? [],
          achievements: editMember.achievements ?? [],
        })
      } else {
        setForm(EMPTY_FORM)
      }
    }
  }, [isOpen, editMember])

  useEffect(() => {
    if (!isOpen || isSheetLayout) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSheetLayout, onClose])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.fullName.trim()) return
    const id = isEdit ? editMember.id : generateId(form.generation)
    const member = {
      ...form,
      id,
      generation: Number(form.generation),
      birthDate: form.birthDate || null,
      deathDate: form.deathDate || null,
      fatherId: form.fatherId?.trim() || null,
      motherId: form.motherId?.trim() || null,
      isAlive: !form.deathDate,  // auto-derive if deathDate filled
    }
    saveMember(member)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 900)
  }

  const handleReset = () => {
    if (isEdit && editMember) {
      resetMember(editMember.id)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {!isSheetLayout && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
          )}

          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: isSheetLayout ? '12px' : 0,
              zIndex: isSheetLayout ? 60 : 201,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'flex-end',
              pointerEvents: 'none',
            }}
          >
            {isSheetLayout && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(270deg, rgba(15,23,42,0.26) 0%, rgba(15,23,42,0.08) 24%, rgba(15,23,42,0) 56%)',
                }}
              />
            )}
            <div
              style={{
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: isSheetLayout ? 448 : 500,
                background: '#0F172A',
                borderLeft: isSheetLayout ? 'none' : '1px solid rgba(148,163,184,0.2)',
                border: isSheetLayout ? '1px solid rgba(148,163,184,0.18)' : 'none',
                borderRadius: isSheetLayout ? 28 : 0,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                boxShadow: isSheetLayout ? '0 28px 70px rgba(0,0,0,0.34)' : 'none',
                position: 'relative',
              }}
            >
              {isSheetLayout && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 32,
                      right: 32,
                      height: 1,
                      background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      insetY: 0,
                      left: 0,
                      width: 1,
                      background: 'linear-gradient(180deg, transparent, rgba(249,115,22,0.4), transparent)',
                    }}
                  />
                </>
              )}

              {/* Header */}
              <div style={{ padding: isSheetLayout ? '18px 24px 16px' : '20px 24px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0F172A', zIndex: 10 }}>
                <div>
                  {isSheetLayout && (
                    <>
                      <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                        Side sheet chỉnh sửa
                      </p>
                      <p style={{ color: '#64748B', fontSize: 12, lineHeight: 1.5, margin: '0 0 10px' }}>
                        Dùng cùng footprint với hồ sơ để không chồng thêm overlay lên canvas.
                      </p>
                    </>
                  )}
                  <p style={{ color: '#F1F5F9', fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {isEdit ? '✏️ Chỉnh sửa thành viên' : '➕ Thêm thành viên mới'}
                  </p>
                  {isEdit && <p style={{ color: '#64748B', fontSize: 11, margin: '2px 0 0' }}>ID: {editMember.id} {isModified(editMember.id) && <span style={{ color: '#FCD34D' }}>· Đã sửa đổi</span>}</p>}
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: isSheetLayout ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.1)',
                    border: isSheetLayout ? '1px solid rgba(148,163,184,0.16)' : 'none',
                    borderRadius: isSheetLayout ? 999 : 7,
                    padding: isSheetLayout ? '8px 12px' : 7,
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <HiX size={16} />
                  {isSheetLayout ? 'Quay lại' : null}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>

                {/* Avatar */}
                <div style={{ marginBottom: 22 }}>
                  <AvatarUpload
                    value={form.avatar}
                    onChange={(url) => set('avatar', url)}
                    name={form.fullName}
                    accentColor="#F97316"
                    size={76}
                  />
                </div>

                {/* Basic info */}
                <p style={{ color: '#F97316', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>Thông tin cơ bản</p>

                <Field label="Họ và tên" required>
                  <input style={inputStyle} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Ví dụ: Lê Văn A" />
                </Field>

                <Field label="Biệt danh / Tên gọi">
                  <input style={inputStyle} value={form.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="Ví dụ: Anh A, Chú A" />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Giới tính" required>
                    <select style={selectStyle} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </Field>

                  <Field label="Thế hệ" required>
                    <select style={selectStyle} value={form.generation} onChange={(e) => set('generation', Number(e.target.value))}>
                      {[1, 2, 3, 4, 5].map((g) => <option key={g} value={g}>Đời {g}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Vai trò">
                    <select style={selectStyle} value={form.role} onChange={(e) => set('role', e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </Field>

                  <Field label="Nhánh họ">
                    <select style={selectStyle} value={form.branch} onChange={(e) => set('branch', e.target.value)}>
                      {BRANCHES.map((b) => <option key={b} value={b}>{BRANCH_LABELS[b]}</option>)}
                    </select>
                  </Field>
                </div>

                {/* Dates */}
                <p style={{ color: '#38BDF8', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '18px 0 14px' }}>Ngày tháng</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Năm sinh">
                    <input style={inputStyle} type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
                  </Field>
                  <Field label="Năm mất (để trống nếu còn sống)">
                    <input style={inputStyle} type="date" value={form.deathDate} onChange={(e) => set('deathDate', e.target.value)} />
                  </Field>
                </div>

                {/* Bio */}
                <p style={{ color: '#4ADE80', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '18px 0 14px' }}>Thông tin thêm</p>

                <Field label="Nghề nghiệp">
                  <input style={inputStyle} value={form.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="Nông nghiệp, Buôn bán..." />
                </Field>

                <Field label="Nơi cư trú">
                  <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Đồng Nai, Quảng Nam..." />
                </Field>

                <Field label="Tiểu sử">
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: '1.5' }}
                    value={form.biography}
                    onChange={(e) => set('biography', e.target.value)}
                    placeholder="Ghi chú về cuộc đời, đóng góp..."
                  />
                </Field>

                {/* Relationships */}
                <p style={{ color: '#A855F7', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '18px 0 14px' }}>Quan hệ gia đình</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="ID Cha">
                    <input
                      list="father-datalist"
                      style={inputStyle}
                      value={form.fatherId}
                      onChange={(e) => set('fatherId', e.target.value)}
                      placeholder="g2-001"
                    />
                    <datalist id="father-datalist">
                      {members.filter((m) => m.gender === 'male').map((m) => (
                        <option key={m.id} value={m.id}>{m.fullName}</option>
                      ))}
                    </datalist>
                  </Field>

                  <Field label="ID Mẹ">
                    <input
                      list="mother-datalist"
                      style={inputStyle}
                      value={form.motherId}
                      onChange={(e) => set('motherId', e.target.value)}
                      placeholder="g2-002"
                    />
                    <datalist id="mother-datalist">
                      {members.filter((m) => m.gender === 'female').map((m) => (
                        <option key={m.id} value={m.id}>{m.fullName}</option>
                      ))}
                    </datalist>
                  </Field>
                </div>

                <IdListField
                  label="Vợ / Chồng (IDs)"
                  value={form.spouseIds}
                  onChange={(v) => set('spouseIds', v)}
                  members={members}
                />

                <IdListField
                  label="Con cái (IDs)"
                  value={form.childrenIds}
                  onChange={(v) => set('childrenIds', v)}
                  members={members}
                />

                {/* Action bar */}
                <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                  <button
                    type="submit"
                    disabled={!form.fullName.trim()}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 9,
                      background: saved ? '#4ADE80' : form.fullName.trim() ? '#F97316' : 'rgba(249,115,22,0.2)',
                      border: 'none',
                      color: saved ? '#000' : form.fullName.trim() ? '#000' : '#64748B',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: form.fullName.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.25s',
                    }}
                  >
                    {saved ? '✓ Đã lưu!' : isEdit ? 'Lưu thay đổi' : 'Thêm thành viên'}
                  </button>

                  {isEdit && isModified(editMember?.id) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Khôi phục về dữ liệu gốc"
                      style={{ padding: '0 14px', borderRadius: 9, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
                    >
                      <HiTrash size={14} /> Khôi phục
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    style={{ padding: '0 18px', borderRadius: 9, background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', color: '#94A3B8', cursor: 'pointer', fontSize: 13 }}
                  >
                    {isSheetLayout ? 'Quay lại hồ sơ' : 'Hủy'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MemberFormModal