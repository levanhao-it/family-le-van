import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiLockClosed, HiX, HiEye, HiEyeOff } from 'react-icons/hi'
import { useMembersStore } from '@/stores/membersStore'

const AdminPasswordGate = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const { unlockAdmin, adminError, clearAdminError } = useMembersStore()

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      clearAdminError()
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [isOpen, clearAdminError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    const ok = await unlockAdmin(password)
    setLoading(false)
    if (ok) {
      setPassword('')
      onSuccess?.()
      onClose()
    }
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
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 201,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: 380,
                background: '#0F172A',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 16,
                padding: '28px 28px 24px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                position: 'relative',
              }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(148,163,184,0.1)', border: 'none', borderRadius: 6, padding: 5, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
              >
                <HiX size={16} />
              </button>

              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HiLockClosed size={20} style={{ color: '#F97316' }} />
                </div>
                <div>
                  <p style={{ color: '#F1F5F9', fontSize: 16, fontWeight: 700, margin: 0 }}>Xác thực quản trị</p>
                  <p style={{ color: '#64748B', fontSize: 12, margin: 0, marginTop: 2 }}>Nhập mật khẩu để chỉnh sửa dữ liệu</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Password input */}
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <input
                    ref={inputRef}
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearAdminError() }}
                    placeholder="Mật khẩu..."
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '11px 44px 11px 14px',
                      fontSize: 15,
                      background: 'rgba(30,41,59,0.8)',
                      border: adminError ? '1px solid #EF4444' : '1px solid rgba(148,163,184,0.2)',
                      borderRadius: 9,
                      color: '#F1F5F9',
                      outline: 'none',
                      boxSizing: 'border-box',
                      letterSpacing: showPw ? 'normal' : '0.3em',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}
                  >
                    {showPw ? <HiEyeOff size={17} /> : <HiEye size={17} />}
                  </button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {adminError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ color: '#F87171', fontSize: 12, margin: '0 0 12px', paddingLeft: 2 }}
                    >
                      {adminError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !password.trim()}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 9,
                    background: password.trim() ? '#F97316' : 'rgba(249,115,22,0.25)',
                    border: 'none',
                    color: password.trim() ? '#000' : '#64748B',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: password.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    letterSpacing: '0.05em',
                  }}
                >
                  {loading ? 'Đang kiểm tra...' : 'Xác nhận'}
                </button>
              </form>

              <p style={{ color: '#475569', fontSize: 10, textAlign: 'center', marginTop: 16, lineHeight: '15px' }}>
                Chế độ quản trị chỉ bảo vệ khỏi chỉnh sửa ngẫu nhiên.<br />
                Dữ liệu lưu trên trình duyệt cục bộ.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AdminPasswordGate