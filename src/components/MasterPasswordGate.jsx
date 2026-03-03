import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { hashMasterPassword, verifyMasterPassword, hasMasterPassword, clearVaultData } from '../utils/cryptoUtils'

const MasterPasswordGate = ({ onUnlocked }) => {
  const isSetup = !hasMasterPassword()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password) { setError('Password is required.'); return }

    if (isSetup) {
      if (password.length < 8) { setError('Master password must be at least 8 characters.'); return }
      if (password !== confirm) { setError('Passwords do not match.'); return }
      setLoading(true)
      await hashMasterPassword(password)
      onUnlocked(password)
    } else {
      setLoading(true)
      const valid = await verifyMasterPassword(password)
      if (!valid) {
        setLoading(false)
        setError('Incorrect master password.')
        return
      }
      onUnlocked(password)
    }
  }

  const handleReset = () => {
    clearVaultData()
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgb(6, 9, 18)' }}>
      <div className="absolute top-0 z-[-1] h-screen w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center manager-icon-container">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="rgba(96,165,250,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-slate-200 text-base font-semibold tracking-wide vault-font-mono">
              {isSetup ? 'Create Master Password' : 'Unlock Vault'}
            </h1>
            <p className="text-slate-600 text-xs mt-1 tracking-wide">
              {isSetup
                ? 'This password encrypts all your credentials.'
                : 'Enter your master password to continue.'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-6 flex flex-col gap-5 vault-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setError(''); setPassword(e.target.value) }}
                placeholder="Master password"
                className="w-full rounded-lg px-4 pr-10 py-2.5 text-sm font-light text-slate-100 border border-slate-700/60 focus:border-blue-500/60 outline-none transition-all duration-200 vault-input"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 outline-none group">
                <div className="relative w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors duration-200">
                  <span className={"absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center " + (showPassword ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0')}>
                    <EyeOff size={13} strokeWidth={2} />
                  </span>
                  <span className={"absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center " + (showPassword ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100')}>
                    <Eye size={13} strokeWidth={2} />
                  </span>
                </div>
                <span className="text-slate-600 group-hover:text-slate-400 transition-colors duration-200 leading-none manager-show-hide-text">
                  {showPassword ? 'hide' : 'show'}
                </span>
              </button>
            </div>

            {isSetup && (
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setError(''); setConfirm(e.target.value) }}
                  placeholder="Confirm master password"
                  className="w-full rounded-lg px-4 pr-10 py-2.5 text-sm font-light text-slate-100 border border-slate-700/60 focus:border-blue-500/60 outline-none transition-all duration-200 vault-input"
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 outline-none group">
                  <div className="relative w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors duration-200">
                    <span className={"absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center " + (showConfirm ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0')}>
                      <EyeOff size={13} strokeWidth={2} />
                    </span>
                    <span className={"absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center " + (showConfirm ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100')}>
                      <Eye size={13} strokeWidth={2} />
                    </span>
                  </div>
                  <span className="text-slate-600 group-hover:text-slate-400 transition-colors duration-200 leading-none manager-show-hide-text">
                    {showConfirm ? 'hide' : 'show'}
                  </span>
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-400/80 text-xs text-center tracking-wide manager-font-mono">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className={"w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs tracking-widest uppercase transition-all duration-200 " + (loading ? 'opacity-60 cursor-not-allowed border-slate-700/40 text-slate-500' : 'border-blue-600/30 text-blue-400/80 hover:border-blue-500/50 hover:text-blue-300')}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {isSetup ? 'Setting up...' : 'Unlocking...'}
                </>
              ) : (isSetup ? 'Create & Enter' : 'Unlock')}
            </button>
          </form>

          {!isSetup && (
            <>
              <div className="divider-line" />
              {!showReset ? (
                <button type="button" onClick={() => setShowReset(true)}
                  className="text-slate-700 hover:text-slate-500 text-xs text-center tracking-widest uppercase transition-colors duration-200 vault-font-mono">
                  Forgot master password?
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-slate-500 text-xs text-center leading-relaxed tracking-wide">
                    Resetting will permanently delete all saved credentials.
                  </p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowReset(false)}
                      className="flex-1 py-2 rounded-lg text-xs tracking-widest uppercase border border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-500/50 transition-all duration-200">
                      Cancel
                    </button>
                    <button type="button" onClick={handleReset}
                      className="flex-1 py-2 rounded-lg text-xs tracking-widest uppercase border transition-all duration-200 delete-confirm-btn vault-font-mono">
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-slate-700 text-xs tracking-widest uppercase vault-font-mono">
          End-to-end encrypted · Local only
        </p>
      </div>
    </div>
  )
}

export default MasterPasswordGate