const VERIFICATION_META = {
  verified: {
    label: 'Đã kiểm chứng',
    color: '#86EFAC',
  },
  partial: {
    label: 'Đối chiếu một phần',
    color: '#FCD34D',
  },
  oral: {
    label: 'Tài liệu truyền khẩu',
    color: '#F9A8D4',
  },
  draft: {
    label: 'Chờ bổ sung nguồn',
    color: '#94A3B8',
  },
}

const DEFAULT_VERIFICATION = {
  status: 'draft',
  note: 'Chưa bổ sung ghi chú kiểm chứng cho hồ sơ này.',
}

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim() : ''

const dedupeStrings = (values = []) =>
  [...new Set(values.map(normalizeText).filter(Boolean))]

const normalizeSourceRef = (source) => {
  if (!source) return null

  if (typeof source === 'string') {
    return {
      label: source,
      holder: null,
      note: null,
      type: 'document',
    }
  }

  const label = normalizeText(source.label) || normalizeText(source.holder)

  if (!label) return null

  return {
    label,
    holder: normalizeText(source.holder) || null,
    note: normalizeText(source.note) || null,
    type: normalizeText(source.type) || 'reference',
  }
}

export const buildArchiveRecord = ({
  relatedMembers = [],
  location,
  locationNote,
  timeLabel,
  sourceRefs = [],
  verification = DEFAULT_VERIFICATION,
  documents = [],
  images = [],
} = {}) => ({
  people: dedupeStrings(relatedMembers),
  location: {
    label: normalizeText(location) || 'Chưa xác định địa điểm',
    note: normalizeText(locationNote) || null,
  },
  timeframe: {
    label: normalizeText(timeLabel) || 'Chưa xác định thời điểm',
  },
  sources: sourceRefs.map(normalizeSourceRef).filter(Boolean),
  evidence: {
    documents: dedupeStrings(documents),
    images: dedupeStrings(images),
  },
  verification: {
    status: normalizeText(verification?.status) || DEFAULT_VERIFICATION.status,
    note: normalizeText(verification?.note) || DEFAULT_VERIFICATION.note,
  },
})

export const getArchiveRecord = (item = {}) =>
  item.archive ?? buildArchiveRecord({
    relatedMembers: item.relatedMembers,
    location: item.location,
    timeLabel: item.timeLabel ?? item.date,
    sourceRefs: item.sourceRefs,
    verification: item.verification,
    documents: item.documents,
    images: item.images,
  })

export const summarizeArchiveCollection = (items = []) =>
  items.reduce(
    (summary, item) => {
      const archive = getArchiveRecord(item)
      const hasCoreMetadata =
        archive.people.length > 0 &&
        Boolean(archive.location?.label) &&
        Boolean(archive.timeframe?.label) &&
        archive.sources.length > 0 &&
        Boolean(archive.verification?.note)

      summary.total += 1
      summary.catalogedCount += hasCoreMetadata ? 1 : 0
      summary.verifiedCount += archive.verification.status === 'verified' ? 1 : 0
      summary.peopleLinkedCount += archive.people.length > 0 ? 1 : 0
      summary.sourceCount += archive.sources.length
      summary.documentCount += archive.evidence.documents.length

      return summary
    },
    {
      total: 0,
      catalogedCount: 0,
      verifiedCount: 0,
      peopleLinkedCount: 0,
      sourceCount: 0,
      documentCount: 0,
    }
  )

export const getVerificationMeta = (status = 'draft') =>
  VERIFICATION_META[status] ?? VERIFICATION_META.draft

export const resolveRelatedMembers = (memberIds = [], members = []) => {
  const membersMap = new Map(members.map((member) => [member.id, member]))

  return [...new Set(memberIds)].map((memberId) => {
    const member = membersMap.get(memberId)

    return {
      id: memberId,
      label: member?.fullName ?? memberId,
    }
  })
}

export const formatArchiveSource = (source) => {
  if (!source) return ''
  if (typeof source === 'string') return source

  return [source.label, source.holder, source.note]
    .filter(Boolean)
    .join(' · ')
}