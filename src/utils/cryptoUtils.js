const PBKDF2_ITERATIONS = 200000
const SALT_KEY = 'passop_salt'
const HASH_KEY = 'passop_hash'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const getOrCreateSalt = () => {
  let salt = localStorage.getItem(SALT_KEY)
  if (!salt) {
    salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem(SALT_KEY, salt)
  }
  return hexToBytes(salt)
}

const hexToBytes = (hex) => {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return arr
}

const bytesToHex = (bytes) =>
  Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')

const deriveKey = async (password, salt) => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export const hashMasterPassword = async (password) => {
  const salt = getOrCreateSalt()
  const key = await deriveKey(password, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode('passop_verify')
  )
  const result = bytesToHex(iv) + ':' + bytesToHex(new Uint8Array(encrypted))
  localStorage.setItem(HASH_KEY, result)
}

export const verifyMasterPassword = async (password) => {
  const stored = localStorage.getItem(HASH_KEY)
  if (!stored) return false
  const [ivHex, dataHex] = stored.split(':')
  const salt = getOrCreateSalt()
  const key = await deriveKey(password, salt)
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBytes(ivHex) },
      key,
      hexToBytes(dataHex)
    )
    return decoder.decode(decrypted) === 'passop_verify'
  } catch {
    return false
  }
}

export const hasMasterPassword = () => !!localStorage.getItem(HASH_KEY)

export const encryptData = async (data, password) => {
  const salt = getOrCreateSalt()
  const key = await deriveKey(password, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data))
  )
  return bytesToHex(iv) + ':' + bytesToHex(new Uint8Array(encrypted))
}

export const decryptData = async (ciphertext, password) => {
  const [ivHex, dataHex] = ciphertext.split(':')
  const salt = getOrCreateSalt()
  const key = await deriveKey(password, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBytes(ivHex) },
    key,
    hexToBytes(dataHex)
  )
  return JSON.parse(decoder.decode(decrypted))
}

export const clearVaultData = () => {
  localStorage.removeItem(HASH_KEY)
  localStorage.removeItem(SALT_KEY)
  localStorage.removeItem('passop_credentials')
}