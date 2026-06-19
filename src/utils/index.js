import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge tailwind classes safely
export const cn = (...args) => twMerge(clsx(args))

// Format date to Vietnamese locale
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

// Calculate age
export const calculateAge = (birthDate, deathDate = null) => {
  const birth = new Date(birthDate)
  const end = deathDate ? new Date(deathDate) : new Date()
  return end.getFullYear() - birth.getFullYear()
}

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Get generation label in Vietnamese
export const getVietGenerationLabel = (gen) => {
  const labels = ['', 'Thứ nhất', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm']
  return labels[gen] ? `Đời ${labels[gen]}` : `Đời thứ ${gen}`
}

// Summarize live member data for headers and overview stats
export const getMemberSummary = (members = []) => {
  const generations = [...new Set(
    members
      .map((member) => Number(member.generation))
      .filter((generation) => Number.isInteger(generation) && generation > 0)
  )].sort((a, b) => a - b)

  return {
    total: members.length,
    alive: members.filter((member) => member.isAlive).length,
    generationCount: generations.length,
    generations,
  }
}

// Random item from array
export const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Debounce
export const debounce = (fn, ms = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}