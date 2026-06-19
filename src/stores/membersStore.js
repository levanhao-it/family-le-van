// ============================================================
// MEMBERS STORE — Persistent editable family members
// Merges static base data with localStorage overrides/additions
// Admin auth uses SHA-256 (SubtleCrypto) — client-side protection only
// ============================================================
import { create } from 'zustand'
import { familyMembers as BASE_MEMBERS } from '@/data/familyMembers'

const LS_MEMBERS_KEY = 'giapha_members_overrides'
const LS_AUTH_KEY = 'giapha_admin_unlocked'
// SHA-256 of '1411'
const ADMIN_HASH = '90dbca35cc682d5b4c2e53bd171e6cfba19168539c6f0799df31613fd5638a0f'

// Hash input string with SubtleCrypto (async)
export async function hashPassword(plain) {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(plain))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Load persisted overrides from localStorage
function loadOverrides() {
  try {
    const raw = localStorage.getItem(LS_MEMBERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Merge base members with localStorage overrides/additions
function buildMembers(overrides) {
  const baseMap = Object.fromEntries(BASE_MEMBERS.map((m) => [m.id, m]))
  // Apply overrides to existing, keep new additions
  const merged = Object.entries({ ...baseMap, ...overrides }).map(([, m]) => m)
  // Sort: generation asc, then id
  return merged.sort((a, b) => a.generation - b.generation || a.id.localeCompare(b.id))
}

function saveOverrides(overrides) {
  localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(overrides))
}

const initialOverrides = loadOverrides()

export const useMembersStore = create((set, get) => ({
  // ── Data ────────────────────────────────────────────────────
  overrides: initialOverrides,                    // { [id]: memberObject }
  members: buildMembers(initialOverrides),        // merged array

  // ── Admin auth ──────────────────────────────────────────────
  isAdminUnlocked: false,
  adminError: '',

  unlockAdmin: async (password) => {
    const hash = await hashPassword(password)
    if (hash === ADMIN_HASH) {
      set({ isAdminUnlocked: true, adminError: '' })
      return true
    }
    set({ adminError: 'Mật khẩu không đúng. Vui lòng thử lại.' })
    return false
  },

  lockAdmin: () => set({ isAdminUnlocked: false, adminError: '' }),

  clearAdminError: () => set({ adminError: '' }),

  // ── CRUD ────────────────────────────────────────────────────
  saveMember: (member) => {
    const overrides = { ...get().overrides, [member.id]: member }
    saveOverrides(overrides)
    set({ overrides, members: buildMembers(overrides) })
  },

  deleteMember: (id) => {
    // Only allow deleting additions (not base members)
    const isBase = BASE_MEMBERS.some((m) => m.id === id)
    if (isBase) return
    const overrides = { ...get().overrides }
    delete overrides[id]
    saveOverrides(overrides)
    set({ overrides, members: buildMembers(overrides) })
  },

  resetMember: (id) => {
    // Revert a single member to base data
    const overrides = { ...get().overrides }
    delete overrides[id]
    saveOverrides(overrides)
    set({ overrides, members: buildMembers(overrides) })
  },

  resetAll: () => {
    localStorage.removeItem(LS_MEMBERS_KEY)
    set({ overrides: {}, members: buildMembers({}) })
  },

  // ── Export ──────────────────────────────────────────────────
  exportJSON: () => {
    return JSON.stringify(get().members, null, 2)
  },

  // Returns true if a member has been locally modified
  isModified: (id) => {
    return id in get().overrides
  },

  // Generate next sequential ID for a given generation
  generateId: (generation) => {
    const prefix = `g${generation}-`
    const existing = get().members
      .filter((m) => m.id.startsWith(prefix))
      .map((m) => parseInt(m.id.replace(prefix, ''), 10))
      .filter((n) => !isNaN(n))
    const max = existing.length > 0 ? Math.max(...existing) : 0
    return `${prefix}${String(max + 1).padStart(3, '0')}`
  },
}))