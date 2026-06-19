import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiLockClosed, HiLockOpen, HiPlus, HiClipboardCopy, HiCheck, HiRefresh } from 'react-icons/hi'
import { useMembersStore } from '@/stores/membersStore'
import AdminPasswordGate from './AdminPasswordGate'
import MemberFormModal from './MemberFormModal'

const AdminToolbar = () => {
  const { isAdminUnlocked, lockAdmin, exportJSON, members, overrides, resetAll } = useMembersStore()
  const [showPwGate, setShowPwGate] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const modifiedCount = Object.keys(overrides).length

  const handleCopy = () => {
    const json = exportJSON()
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  const handleResetAll = () => {
    if (confirmReset) {
      resetAll()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  return (
    <>
      {/* Floating toolbar — bottom-right above minimap */}
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          right: 16,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {/* Admin controls (visible when unlocked) */}
        <AnimatePresence>
          {isAdminUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}
            >
              {/* Modified count badge */}
              {modifiedCount > 0 && (
                <div style={{ fontSize: 10, fontWeight: 700, color: '#FCD34D', background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(252,211,77,0.3)', padding: '3px 10px', borderRadius: 20 }}>
                  {modifiedCount} sửa đổi chưa xuất
                </div>
              )}

              {/* Add member button */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 16px',
                  borderRadius: 24,
                  background: '#F97316',
                  border: 'none',
                  color: '#000',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
                }}
              >
                <HiPlus size={16} />
                Thêm thành viên
              </motion.button>

              {/* Copy data button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 24,
                  background: copied ? 'rgba(74,222,128,0.2)' : 'rgba(15,23,42,0.92)',
                  border: copied ? '1px solid #4ADE80' : '1px solid rgba(148,163,184,0.25)',
                  color: copied ? '#4ADE80' : '#CBD5E1',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <HiCheck size={15} /> : <HiClipboardCopy size={15} />}
                {copied ? 'Đã copy!' : 'Copy JSON'}
              </motion.button>

              {/* Reset all button */}
              {modifiedCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResetAll}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 13px',
                    borderRadius: 24,
                    background: confirmReset ? 'rgba(239,68,68,0.2)' : 'rgba(15,23,42,0.92)',
                    border: confirmReset ? '1px solid #EF4444' : '1px solid rgba(148,163,184,0.2)',
                    color: confirmReset ? '#F87171' : '#94A3B8',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <HiRefresh size={13} />
                  {confirmReset ? 'Xác nhận xóa tất cả?' : 'Reset dữ liệu'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lock / Unlock toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => isAdminUnlocked ? lockAdmin() : setShowPwGate(true)}
          title={isAdminUnlocked ? 'Khóa chế độ quản trị' : 'Mở chế độ quản trị'}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: isAdminUnlocked ? 'rgba(249,115,22,0.2)' : 'rgba(15,23,42,0.92)',
            border: isAdminUnlocked ? '1.5px solid #F97316' : '1px solid rgba(148,163,184,0.25)',
            color: isAdminUnlocked ? '#F97316' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isAdminUnlocked ? '0 0 12px rgba(249,115,22,0.3)' : 'none',
            transition: 'all 0.25s',
          }}
        >
          {isAdminUnlocked ? <HiLockOpen size={18} /> : <HiLockClosed size={18} />}
        </motion.button>
      </div>

      {/* Password gate */}
      <AdminPasswordGate
        isOpen={showPwGate}
        onClose={() => setShowPwGate(false)}
        onSuccess={() => { }}
      />

      {/* Add member form */}
      <MemberFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        editMember={null}
      />
    </>
  )
}

export default AdminToolbar