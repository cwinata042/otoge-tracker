export function isValidLink(link: string | null) {
  try {
    const url = link ? new URL(link) : null

    return url?.protocol === 'http:' || url?.protocol === 'https:'
  } catch {
    return false
  }
}

export function formatDate(date: Date) {
  const rtnDate = new Date(date)
  const year = rtnDate.getUTCFullYear()
  const month = String(rtnDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(rtnDate.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
