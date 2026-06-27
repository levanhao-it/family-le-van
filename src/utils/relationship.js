// ============================================================
// RELATIONSHIP UTILITY
// Determines kinship between two family members using LCA.
// Returns Vietnamese terms and addressing forms (xưng hô).
// ============================================================

/** BFS upward through fatherId/motherId; returns Map<id, {distance, path}> */
function buildAncestorMap(startId, membersMap) {
  const result = new Map()
  const queue = [{ id: startId, path: [startId] }]
  const visited = new Set()

  while (queue.length > 0) {
    const { id, path } = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    result.set(id, { distance: path.length - 1, path })

    const member = membersMap[id]
    if (!member) continue
    if (member.fatherId && !visited.has(member.fatherId))
      queue.push({ id: member.fatherId, path: [...path, member.fatherId] })
    if (member.motherId && !visited.has(member.motherId))
      queue.push({ id: member.motherId, path: [...path, member.motherId] })
  }
  return result
}

/** Find the Lowest Common Ancestor and distances */
function findLCA(id1, id2, membersMap) {
  const anc1 = buildAncestorMap(id1, membersMap)
  const anc2 = buildAncestorMap(id2, membersMap)

  let bestLca = null
  let bestDist = Infinity
  let bestD1 = 0, bestD2 = 0
  let bestPath1 = null, bestPath2 = null

  for (const [ancId, { distance: d1, path: p1 }] of anc1) {
    if (anc2.has(ancId)) {
      const { distance: d2, path: p2 } = anc2.get(ancId)
      if (d1 + d2 < bestDist) {
        bestDist = d1 + d2
        bestLca = ancId
        bestD1 = d1; bestD2 = d2
        bestPath1 = p1; bestPath2 = p2
      }
    }
  }
  if (!bestLca) return null
  return { lca: bestLca, d1: bestD1, d2: bestD2, path1: bestPath1, path2: bestPath2 }
}

/** Returns birth year of a member, or null */
function birthYear(member) {
  if (!member?.birthDate) return null
  const y = parseInt(member.birthDate.split('-')[0], 10)
  return isNaN(y) ? null : y
}

/** True if m1 is older (born earlier) than m2 */
function isOlderThan(m1, m2) {
  const y1 = birthYear(m1); const y2 = birthYear(m2)
  if (y1 !== null && y2 !== null) return y1 < y2
  if (y1 !== null) return true
  if (y2 !== null) return false
  return (m1.generation ?? 99) < (m2.generation ?? 99)
}

// ── Direct ancestor–descendant terms ────────────────────────
function directTerms(ancestor, dist) {
  const g = ancestor.gender
  const aTerm = {
    1: g === 'male' ? 'cha / ba' : 'mẹ',
    2: g === 'male' ? 'ông' : 'bà',
    3: 'cụ',
    4: 'kỵ',
  }[dist] ?? `tổ ${dist} đời`

  const dTerm = { 1: 'con', 2: 'cháu', 3: 'chắt', 4: 'chít' }[dist] ?? `hậu duệ (${dist} đời)`

  const label = {
    1: g === 'male' ? 'Cha – Con' : 'Mẹ – Con',
    2: g === 'male' ? 'Ông – Cháu' : 'Bà – Cháu',
    3: 'Cụ – Chắt',
    4: 'Kỵ – Chít',
  }[dist] ?? `Tổ tiên – Hậu duệ (${dist} đời)`

  return { aTerm, dTerm, label }
}

// ── Uncle/Aunt term based on side & relative age ─────────────
function uncleAuntTerm(uncleM, nephewParentM, isPaternal) {
  if (isPaternal) {
    if (uncleM.gender === 'male') {
      return nephewParentM && isOlderThan(uncleM, nephewParentM) ? 'bác' : 'chú'
    }
    return 'cô'
  } else {
    // Maternal side
    if (uncleM.gender === 'male') return 'cậu'
    return nephewParentM && isOlderThan(uncleM, nephewParentM) ? 'bác' : 'dì'
  }
}

// ────────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────────

/**
 * Compute the relationship between two family members.
 *
 * Returns:
 *  { type, label, how1Calls2, how2Calls1, description, pathIds: Set<id>, d1, d2 }
 *
 *  how1Calls2 = what m1 calls m2 (e.g., "chú")
 *  how2Calls1 = what m2 calls m1 (e.g., "cháu")
 */
export function getRelationship(id1, id2, members) {
  if (!id1 || !id2 || id1 === id2) return null

  const membersMap = Object.fromEntries(members.map((m) => [m.id, m]))
  const m1 = membersMap[id1]
  const m2 = membersMap[id2]
  if (!m1 || !m2) return null

  // ── Spouse ────────────────────────────────────────────────
  const areSpouses =
    m1.spouseIds?.includes(id2) || m2.spouseIds?.includes(id1)
  if (areSpouses) {
    return {
      type: 'spouse',
      label: 'Vợ – Chồng',
      how1Calls2: m2.gender === 'male' ? 'chồng / anh' : 'vợ / em',
      how2Calls1: m1.gender === 'male' ? 'chồng / anh' : 'vợ / em',
      description: `${m1.fullName} và ${m2.fullName} là vợ chồng.`,
      pathIds: new Set([id1, id2]),
      d1: 0, d2: 0,
    }
  }

  // ── LCA ───────────────────────────────────────────────────
  const lca = findLCA(id1, id2, membersMap)
  if (!lca) {
    return {
      type: 'none',
      label: 'Không tìm thấy quan hệ',
      how1Calls2: '—',
      how2Calls1: '—',
      description: 'Hai người này không có quan hệ huyết thống có thể xác định được.',
      pathIds: new Set(),
      d1: -1, d2: -1,
    }
  }

  const { d1, d2, path1, path2 } = lca
  const pathIds = new Set([...path1, ...path2])
  // Connection chain: m1 → ... → LCA → ... → m2
  const connectionChain = [...path1, ...path2.slice(0, -1).reverse()]

  // ── Direct: m1 is ancestor of m2 ─────────────────────────
  if (d1 === 0) {
    const { aTerm, dTerm, label } = directTerms(m1, d2)
    return {
      type: 'direct',
      label,
      how1Calls2: dTerm,   // ancestor calls descendant
      how2Calls1: aTerm,   // descendant calls ancestor
      description: `${m2.fullName} gọi ${m1.fullName} là "${aTerm}". ${m1.fullName} gọi ${m2.fullName} là "${dTerm}".`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── Direct: m2 is ancestor of m1 ─────────────────────────
  if (d2 === 0) {
    const { aTerm, dTerm, label } = directTerms(m2, d1)
    return {
      type: 'direct',
      label,
      how1Calls2: aTerm,   // m1 (descendant) calls m2 (ancestor)
      how2Calls1: dTerm,   // m2 (ancestor) calls m1 (descendant)
      description: `${m1.fullName} gọi ${m2.fullName} là "${aTerm}". ${m2.fullName} gọi ${m1.fullName} là "${dTerm}".`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── Siblings (d1=1, d2=1) ─────────────────────────────────
  if (d1 === 1 && d2 === 1) {
    const sameFather = m1.fatherId && m1.fatherId === m2.fatherId
    const sameMother = m1.motherId && m1.motherId === m2.motherId
    const both = sameFather && sameMother
    const sibType = both
      ? 'ruột'
      : sameFather
        ? 'cùng cha khác mẹ'
        : 'cùng mẹ khác cha'

    const m1older = isOlderThan(m1, m2)
    const olderM = m1older ? m1 : m2
    const elderTitle = olderM.gender === 'male' ? 'anh' : 'chị'

    return {
      type: 'sibling',
      label: `Anh / Chị / Em (${sibType})`,
      how1Calls2: m1older ? 'em' : elderTitle,
      how2Calls1: m1older ? elderTitle : 'em',
      description: `${m1.fullName} và ${m2.fullName} là anh/chị/em ${sibType}.`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── Uncle/Aunt – Nephew/Niece (d=1 vs d=2) ───────────────
  if ((d1 === 1 && d2 === 2) || (d1 === 2 && d2 === 1)) {
    // Normalize: uncleM has d=1, nephewM has d=2
    const uncleIsM1 = d1 === 1
    const uncleM = uncleIsM1 ? m1 : m2
    const nephewM = uncleIsM1 ? m2 : m1
    const nephewPath = uncleIsM1 ? path2 : path1   // [nephewId, parentId, lca]

    // nephewPath[1] is the parent of nephewM connecting to LCA
    const nephewParentId = nephewPath.length >= 2 ? nephewPath[1] : null
    const nephewParentM = nephewParentId ? membersMap[nephewParentId] : null
    const isPaternal = nephewParentId === nephewM.fatherId
    const isMaternal = nephewParentId === nephewM.motherId

    const uaTerm = (isPaternal || isMaternal)
      ? uncleAuntTerm(uncleM, nephewParentM, isPaternal)
      : uncleM.gender === 'male' ? 'chú / bác / cậu' : 'cô / dì / bác'

    const sideLabel = isPaternal ? '(bên nội)' : isMaternal ? '(bên ngoại)' : ''

    return {
      type: 'uncle_niece',
      label: `${uncleM.gender === 'male' ? 'Chú / Bác / Cậu' : 'Cô / Dì / Bác'} – Cháu ${sideLabel}`,
      how1Calls2: uncleIsM1 ? 'cháu' : uaTerm,   // m1→m2
      how2Calls1: uncleIsM1 ? uaTerm : 'cháu',   // m2→m1
      description: `${nephewM.fullName} gọi ${uncleM.fullName} là "${uaTerm}" ${sideLabel}. ${uncleM.fullName} gọi ${nephewM.fullName} là "cháu".`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── First cousins (d1=2, d2=2) ────────────────────────────
  if (d1 === 2 && d2 === 2) {
    const m1older = isOlderThan(m1, m2)
    const elderTitle = (m1older ? m1 : m2).gender === 'male' ? 'anh họ' : 'chị họ'
    return {
      type: 'cousin',
      label: 'Anh / Chị / Em họ',
      how1Calls2: m1older ? 'em họ' : elderTitle,
      how2Calls1: m1older ? elderTitle : 'em họ',
      description: `${m1.fullName} và ${m2.fullName} là anh/chị/em họ (có chung ông hoặc bà).`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── Grand-uncle / Grand-aunt (d=1 vs d=3) ────────────────
  if ((d1 === 1 && d2 === 3) || (d1 === 3 && d2 === 1)) {
    const elderIsM1 = d1 === 1
    const elderM = elderIsM1 ? m1 : m2
    const elderTerm = elderM.gender === 'male'
      ? 'ông chú / ông bác / ông cậu'
      : 'bà cô / bà dì / bà bác'
    return {
      type: 'grand_uncle',
      label: `${elderM.gender === 'male' ? 'Ông bác / Ông chú' : 'Bà cô / Bà dì'} – Cháu`,
      how1Calls2: elderIsM1 ? 'cháu' : elderTerm,
      how2Calls1: elderIsM1 ? elderTerm : 'cháu',
      description: `${elderM.fullName} là ${elderTerm} của ${elderIsM1 ? m2.fullName : m1.fullName}.`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── First cousin once removed (d=2 vs d=3) ───────────────
  if ((d1 === 2 && d2 === 3) || (d1 === 3 && d2 === 2)) {
    const elderIsM1 = d1 === 2
    return {
      type: 'cousin_removed',
      label: 'Họ hàng (lệch một đời)',
      how1Calls2: elderIsM1 ? 'cháu họ' : 'chú họ / cô họ / bác họ',
      how2Calls1: elderIsM1 ? 'chú họ / cô họ / bác họ' : 'cháu họ',
      description: `${m1.fullName} và ${m2.fullName} là họ hàng lệch một đời.`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── Second cousins (d1=3, d2=3) ──────────────────────────
  if (d1 === 3 && d2 === 3) {
    const m1older = isOlderThan(m1, m2)
    const elderTitle = (m1older ? m1 : m2).gender === 'male' ? 'anh' : 'chị'
    return {
      type: 'second_cousin',
      label: 'Họ hàng xa (cùng cụ / kỵ)',
      how1Calls2: m1older ? 'em' : elderTitle,
      how2Calls1: m1older ? elderTitle : 'em',
      description: `${m1.fullName} và ${m2.fullName} là họ hàng xa (có chung cụ hoặc kỵ).`,
      pathIds,
      connectionChain,
      d1, d2,
    }
  }

  // ── Distant / fallback ────────────────────────────────────
  const totalDist = d1 + d2
  return {
    type: 'distant',
    label: `Họ hàng xa (${totalDist} bậc quan hệ)`,
    how1Calls2: d1 < d2 ? 'cháu / em' : 'bậc trên',
    how2Calls1: d1 < d2 ? 'bậc trên' : 'cháu / em',
    description: `${m1.fullName} và ${m2.fullName} có quan hệ họ hàng cách ${totalDist} bậc.`,
    pathIds,
    connectionChain,
    d1, d2,
  }
}