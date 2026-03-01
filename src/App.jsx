import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Vault from './components/Vault'

const STORAGE_KEY = 'passop_credentials'

const App = () => {
  const [credentials, setCredentials] = useState([])
  const initialized = useRef(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCredentials(JSON.parse(stored))
    } catch {
      setCredentials([])
    }
    initialized.current = true
  }, [])

  useEffect(() => {
    if (!initialized.current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
  }, [credentials])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Manager credentials={credentials} setCredentials={setCredentials} />} />
        <Route path="/vault" element={<Vault credentials={credentials} setCredentials={setCredentials} />} />
      </Routes>
    </>
  )
}

export default App