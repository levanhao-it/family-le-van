// ============================================================
// FAMILY TREE DATA — React Flow nodes & edges structure
// ============================================================
import { familyMembers } from './familyMembers'

// -------------------------------------------------------
// Node positions — Top-Down layout
// Y spacing: 300px between generations
// X spacing: 240px between nodes, 200px within couples
// -------------------------------------------------------
const nodePositions = {
  // ── Gen 1 (centered above main family) ──────────────
  'g1-001': { x: 3700, y: 0 },
  'g1-002': { x: 3920, y: 0 },

  // ── Gen 2 (each couple centered above their branch) ──
  // Branch Sỹ  (gen3 x: 0–1816,   center ≈ 908)
  'g2-001': { x: 808,  y: 300 },
  'g2-002': { x: 1008, y: 300 },
  // Branch Nhứt (gen3 x: 2076–4092, center ≈ 3084)
  'g2-003': { x: 2984, y: 300 },
  'g2-004': { x: 3184, y: 300 },
  // Branch Lý   (gen3 x: 4352–5448, center ≈ 4900)
  'g2-005': { x: 4800, y: 300 },
  'g2-006': { x: 5000, y: 300 },
  // Branch Thông (gen3 x: 5708–6144, center ≈ 5926)
  'g2-007': { x: 5826, y: 300 },
  'g2-008': { x: 6026, y: 300 },
  // Singles (no children)
  'g2-009': { x: 6350, y: 300 },
  'g2-010': { x: 6590, y: 300 },

  // ── Gen 3 — Branch Sỹ (x: 0–1816) ──────────────────
  'g3-001': { x: 0,    y: 600 },  // Ngọc (blood F)
  'g3-002': { x: 200,  y: 600 },  // Đức  (rể)
  'g3-003': { x: 460,  y: 600 },  // Sinh (blood F)
  'g3-004': { x: 660,  y: 600 },  // Hải  (rể)
  'g3-005': { x: 920,  y: 600 },  // Xuân (blood F)
  'g3-006': { x: 1120, y: 600 },  // Tuấn (rể)
  'g3-007': { x: 1380, y: 600 },  // Cường (blood M)
  'g3-008': { x: 1640, y: 600 },  // Sang  (blood M)

  // ── Gen 3 — Branch Nhứt (x: 2076–4092) ─────────────
  'g3-009': { x: 2076, y: 600 },  // Định  (blood M)
  'g3-010': { x: 2276, y: 600 },  // Thủy  (dâu)
  'g3-011': { x: 2536, y: 600 },  // Hằng  (blood F)
  'g3-012': { x: 2736, y: 600 },  // Giang (rể)
  'g3-013': { x: 2996, y: 600 },  // Trung (blood M)
  'g3-014': { x: 3196, y: 600 },  // Thu   (dâu)
  'g3-015': { x: 3456, y: 600 },  // Chiến (blood M)
  'g3-016': { x: 3656, y: 600 },  // Rơi   (dâu)
  'g3-017': { x: 3916, y: 600 },  // Tài   (blood M)

  // ── Gen 3 — Branch Lý (x: 4352–5448) ───────────────
  'g3-018': { x: 4352, y: 600 },  // Hà    (blood F)
  'g3-019': { x: 4552, y: 600 },  // Hận   (rể)
  'g3-020': { x: 4812, y: 600 },  // Phụng (blood F)
  'g3-021': { x: 5012, y: 600 },  // Phong (rể)
  'g3-022': { x: 5272, y: 600 },  // Long  (blood M)

  // ── Gen 3 — Branch Thông (x: 5708–6144) ────────────
  'g3-023': { x: 5708, y: 600 },  // Liễu (blood F)
  'g3-024': { x: 5968, y: 600 },  // Hào  (blood M)

  // ── Gen 4 — Under Sỹ branch ─────────────────────────
  'g4-001': { x: 0,    y: 900 },  // Ngân  (under Ngọc+Đức)
  'g4-002': { x: 240,  y: 900 },  // Nhi   (under Ngọc+Đức)
  'g4-003': { x: 480,  y: 900 },  // Thảo  (under Sinh+Hải)
  'g4-004': { x: 700,  y: 900 },  // Hà    (rể Thảo)
  'g4-005': { x: 940,  y: 900 },  // Trúc  (under Sinh+Hải)
  'g4-006': { x: 1180, y: 900 },  // Vân   (under Sinh+Hải)
  'g4-007': { x: 1420, y: 900 },  // Khang (under Xuân+Tuấn)

  // ── Gen 4 — Under Nhứt branch ───────────────────────
  'g4-008': { x: 2100, y: 900 },  // Diệu  (under Định+Thủy)
  'g4-009': { x: 2340, y: 900 },  // Phúc  (under Định+Thủy)
  'g4-010': { x: 2580, y: 900 },  // Ly    (under Định+Thủy)
  'g4-011': { x: 2820, y: 900 },  // Danh  (under Hằng+Giang)
  'g4-012': { x: 3060, y: 900 },  // Tiên  (under Hằng+Giang)
  'g4-013': { x: 3300, y: 900 },  // Bin   (under Trung+Thu)
  'g4-014': { x: 3540, y: 900 },  // Tú    (under Trung+Thu)
  'g4-015': { x: 3780, y: 900 },  // Bảo   (under Trung+Thu)
  'g4-016': { x: 4020, y: 900 },  // An    (under Trung+Thu)
  'g4-017': { x: 4260, y: 900 },  // Lâm   (under Chiến+Rơi)
  'g4-018': { x: 4500, y: 900 },  // Tuyết (under Chiến+Rơi)

  // ── Gen 4 — Under Lý branch ─────────────────────────
  'g4-019': { x: 4740, y: 900 },  // Công   (under Hà+Hận)
  'g4-020': { x: 4980, y: 900 },  // Nhiên  (under Hà+Hận)
  'g4-021': { x: 5220, y: 900 },  // Con trai (under Phụng+Phong)
  'g4-022': { x: 5460, y: 900 },  // Con gái  (under Phụng+Phong)

  // ── Gen 5 ────────────────────────────────────────────
  'g5-001': { x: 580,  y: 1200 }, // Bé A (under Thảo+Hà)
}

// Build React Flow nodes
export const buildFamilyNodes = (members = familyMembers) => {
  return members.map((member) => ({
    id: member.id,
    type: 'familyNode',
    position: nodePositions[member.id] || { x: Math.random() * 1600, y: member.generation * 200 },
    data: { member },
    dragHandle: '.node-drag-handle',
  }))
}

// Build React Flow edges
export const buildFamilyEdges = (members = familyMembers) => {
  const edges = []

  members.forEach((member) => {
    // Parent → Child edges
    if (member.childrenIds?.length) {
      member.childrenIds.forEach((childId) => {
        edges.push({
          id: `e-parent-${member.id}-${childId}`,
          source: member.id,
          target: childId,
          type: 'smoothstep',
          data: { relationshipType: 'parent-child' },
          style: {
            stroke: 'rgba(148,210,180,0.55)',
            strokeWidth: 1.5,
          },
          animated: false,
        })
      })
    }

    // Marriage edges (only add once per couple)
    if (member.spouseIds?.length && member.gender === 'male') {
      member.spouseIds.forEach((spouseId) => {
        const spouse = members.find((m) => m.id === spouseId)
        if (spouse) {
          edges.push({
            id: `e-marriage-${member.id}-${spouseId}`,
            source: member.id,
            target: spouseId,
            type: 'straight',
            data: { relationshipType: 'marriage' },
            label: '♡',
            labelStyle: {
              fill: 'rgba(253,224,71,0.95)',
              fontSize: 12,
            },
            style: {
              stroke: 'rgba(253,224,71,0.55)',
              strokeWidth: 1.2,
              strokeDasharray: '5,4',
            },
          })
        }
      })
    }
  })

  return edges
}

// Export static data
export const familyNodes = buildFamilyNodes()
export const familyEdges = buildFamilyEdges()

// Generation groups for visualization
export const generationGroups = {
  1: { label: 'Thế hệ I — Thủy tổ', y: 0,    color: '#FFC857' },
  2: { label: 'Thế hệ II — Nhị thế', y: 300,  color: '#93C5FD' },
  3: { label: 'Thế hệ III — Tam thế', y: 600, color: '#86EFAC' },
  4: { label: 'Thế hệ IV — Tứ thế',  y: 900,  color: '#C084FC' },
  5: { label: 'Thế hệ V — Ngũ thế',  y: 1200, color: '#FDE68A' },
}