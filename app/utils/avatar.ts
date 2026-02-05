export function optimizedAvatar(url: string | undefined | null, size: number = 72): string {
  if (!url) return ''
  if (url.includes('avatars.githubusercontent.com')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}s=${size}`
  }
  return url
}
