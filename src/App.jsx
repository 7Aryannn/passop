import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Vault from './components/Vault'
import MasterPasswordGate from './components/MasterPasswordGate'
import { encryptData, decryptData } from './utils/cryptoUtils'

const STORAGE_KEY = 'passop_credentials'

const App = () => {
  const [unlocked, setUnlocked] = useState(false)
  const [masterPassword, setMasterPassword] = useState(null)
  const [credentials, setCredentials] = useState([])
  const [decryptError, setDecryptError] = useState(false)

  const handleUnlocked = async (password) => {
    setMasterPassword(password)
    setUnlocked(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const decrypted = await decryptData(stored, password)
        setCredentials(decrypted)
      } catch {
        setDecryptError(true)
        setCredentials([])
      }
    }
  }

  const saveCredentials = (updater) => {
    setCredentials(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      encryptData(next, masterPassword).then(cipher => {
        localStorage.setItem(STORAGE_KEY, cipher)
      })
      return next
    })
  }

  if (!unlocked) {
    return <MasterPasswordGate onUnlocked={handleUnlocked} />
  }

  return (
    <>
      <Navbar />
      {decryptError && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-xs text-red-400/80 border border-red-600/20 manager-font-mono"
          style={{ background: 'rgba(239,68,68,0.06)' }}
        >
          Decryption failed. Data may be corrupted.
        </div>
      )}
      <Routes>
        <Route path="/" element={<Manager credentials={credentials} setCredentials={saveCredentials} />} />
        <Route path="/vault" element={<Vault credentials={credentials} setCredentials={saveCredentials} />} />
      </Routes>
    </>
  )
}

export default App