const isValidUrl = (str) => {
  try {
    const url = new URL(str)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    const host = url.hostname
    if (!host || host.endsWith('.') || host.startsWith('.')) return false
    const parts = host.split('.')
    if (parts.length < 2) return false
    const tld = parts[parts.length - 1]
    if (tld.length < 2) return false
    return parts.every(p => p.length > 0 && /^[a-zA-Z0-9-]+$/.test(p))
  } catch {
    return false
  }
}

const isValidWebsiteName = (str) => {
  return /^[a-zA-Z][a-zA-Z ]*$/.test(str.trim())
}

export const processWebsite = (value) => {
  const trimmed = value.trim()
  if (isValidUrl(trimmed)) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export const validateWebsite = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Website is required.'
  if (isValidUrl(trimmed)) return ''
  if (isValidWebsiteName(trimmed)) return ''
  return 'Enter a valid URL (https://google.com) or a name (google).'
}

export const validateUsername = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Username is required.'
  if (!/^[a-zA-Z0-9]/.test(trimmed)) return 'Username must start with a letter or number.'
  if (trimmed.length < 3) return 'Username must be at least 3 characters.'
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'Username can only contain letters, numbers, and underscores.'
  return ''
}

export const validatePassword = (value) => {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.'
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter.'
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number.'
  if (!/[^a-zA-Z0-9]/.test(value)) return 'Password must contain at least one special character.'
  return ''
}

export const validateCredentials = ({ url, username, password }) => {
  const websiteError = validateWebsite(url)
  if (websiteError) return websiteError
  const usernameError = validateUsername(username)
  if (usernameError) return usernameError
  const passwordError = validatePassword(password)
  if (passwordError) return passwordError
  return ''
}