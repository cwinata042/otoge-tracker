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
  const year = rtnDate.getFullYear()
  const month = String(rtnDate.getMonth() + 1).padStart(2, '0')
  const day = String(rtnDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
