export function isValidLink(link: string | null) {
  try {
    const url = link ? new URL(link) : null

    return url?.protocol === 'http:' || url?.protocol === 'https:'
  } catch {
    return false
  }
}
