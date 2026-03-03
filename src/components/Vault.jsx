import React, { useEffect, useState, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { processWebsite, validateCredentials } from '../utils/credentialUtils'
import Toast from './Toast'
import { useFieldNavigation } from '../hooks/useFieldNavigation'

const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5 vault-card">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="rgba(239,68,68,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <div>
          <h3 className="text-slate-200 text-sm font-semibold tracking-wide">Delete Credential</h3>
          <p className="text-slate-600 text-xs mt-0.5">This action cannot be undone</p>
        </div>
      </div>

      <div className="divider-line" />

      <p className="text-slate-400 text-xs leading-relaxed tracking-wide">
        Are you sure you want to delete this credential? It will be permanently removed from your vault.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg text-xs tracking-widest uppercase border border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-500/50 transition-all duration-200 vault-btn-cancel"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-lg text-xs tracking-widest uppercase border transition-all duration-200 vault-font-mono delete-confirm-btn"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)

const Spinner = () => (
  <svg className="animate-spin flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const Vault = ({ credentials, setCredentials }) => {
  const [revealedIds, setRevealedIds] = useState(new Set())
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ url: '', username: '', password: '' })
  const [editError, setEditError] = useState('')
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const { setRef, handleKeyDown } = useFieldNavigation(4)
  const pendingDeleteRef = useRef(null)
  const deleteTimerRef = useRef(null)

  const showToast = (type, message, extra = {}) => setToast({ type, message, ...extra })

  const handleCopyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password)
      showToast('success', 'Password copied to clipboard.')
    } catch {}
  }

  useEffect(() => {
    return () => {
      clearTimeout(deleteTimerRef.current)
    }
  }, [])

  const handleDeleteRequest = (id) => setDeleteTargetId(id)

  const handleDeleteConfirm = () => {
    const id = deleteTargetId
    const deleted = credentials.find(c => c.id === id)
    const deletedIndex = credentials.findIndex(c => c.id === id)
    setDeleteTargetId(null)
    setCredentials(prev => prev.filter(c => c.id !== id))
    setRevealedIds(prev => { const s = new Set(prev); s.delete(id); return s })
    pendingDeleteRef.current = { cred: deleted, index: deletedIndex }
    clearTimeout(deleteTimerRef.current)
    deleteTimerRef.current = setTimeout(() => { pendingDeleteRef.current = null }, 5000)
    showToast('delete', 'Credential deleted from vault', { showUndo: true })
  }

  const handleUndo = () => {
    const pending = pendingDeleteRef.current
    if (!pending) return
    clearTimeout(deleteTimerRef.current)
    setCredentials(prev => {
      const updated = [...prev]
      updated.splice(pending.index, 0, pending.cred)
      return updated
    })
    pendingDeleteRef.current = null
    setToast(null)
  }

  const handleDeleteCancel = () => setDeleteTargetId(null)

  const handleEditStart = (cred) => {
    setEditingId(cred.id)
    setEditValues({ url: cred.url, username: cred.username, password: cred.password })
    setEditError('')
    setShowEditPassword(false)
  }

  const handleEditSave = (id) => {
    if (isSaving) return
    const validationError = validateCredentials(editValues)
    if (validationError) {
      setEditError(validationError)
      return
    }
    setIsSaving(true)
    setTimeout(() => {
      setCredentials(prev => prev.map(c => c.id === id ? {
        ...c,
        url: processWebsite(editValues.url),
        username: editValues.username.trim(),
        password: editValues.password.trim(),
      } : c))
      setEditingId(null)
      setEditError('')
      setIsSaving(false)
      showToast('edit', 'Credential updated successfully')
    }, 500)
  }

  const handleEditCancel = () => {
    if (isSaving) return
    setEditingId(null)
    setEditError('')
    setShowEditPassword(false)
  }

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <>
      <div className="absolute top-0 z-[-2] h-screen w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {deleteTargetId && (
        <DeleteModal onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
          onUndo={toast.showUndo ? handleUndo : undefined}
        />
      )}

      <div className="manager-root min-h-screen flex flex-col items-center justify-start px-4 pt-28 pb-16">
        <div className="w-full max-w-xl flex flex-col gap-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-200 text-base font-semibold tracking-wide vault-font-mono">
                Saved Vault
              </h1>
              <p className="text-slate-600 text-xs mt-0.5">
                {credentials.length} {credentials.length === 1 ? 'credential' : 'credentials'} stored
              </p>
            </div>
            <Link
              to="/"
              className="group flex items-center overflow-hidden rounded-lg border border-slate-700/50 hover:border-slate-500/60 px-3 py-2 transition-all duration-300 vault-back-link"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="rgba(96,165,250,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="flex-shrink-0">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="max-w-0 overflow-hidden group-hover:max-w-[56px] group-hover:ml-2 transition-all duration-300 text-slate-400 group-hover:text-slate-200 text-xs tracking-widest uppercase whitespace-nowrap vault-font-mono">
                Back
              </span>
            </Link>
          </div>

          <div className="divider-line" />

          {credentials.length === 0 ? (
            <div className="rounded-2xl p-10 flex flex-col items-center gap-4 vault-card">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="rgba(100,116,139,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              <p className="text-slate-600 text-xs tracking-widest uppercase vault-font-mono">
                No credentials saved yet.
              </p>
              <Link
                to="/"
                className="text-blue-400/70 hover:text-blue-300 text-xs tracking-widest uppercase transition-colors duration-200 vault-font-mono"
              >
                Add your first credential →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl p-6 flex flex-col gap-1 vault-card overflow-hidden">
              {credentials.map((cred, i) => (
                <div
                  key={cred.id}
                  className={`cred-card-transition transition-all duration-300 ${
                    i === credentials.length - 1 ? 'cred-enter' : ''
                  } ${
                    editingId && editingId !== cred.id
                      ? 'blur-[1px] opacity-40 pointer-events-none select-none'
                      : 'blur-0 opacity-100'
                  } ${
                    editingId === cred.id
                      ? 'relative z-10 scale-[1.02]'
                      : 'relative z-0 scale-100'
                  }`}
                >
                  {i !== 0 && <div className="divider-line my-4" />}

                  {editingId === cred.id ? (
                    <form
                      className="flex flex-col gap-3 py-1"
                      onSubmit={e => { e.preventDefault(); handleEditSave(cred.id) }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editValues.url}
                          disabled={isSaving}
                          ref={setRef(0)}
                          onKeyDown={handleKeyDown(0)}
                          onChange={e => { setEditError(''); setEditValues(prev => ({ ...prev, url: e.target.value })) }}
                          className={`col-span-2 rounded-lg px-4 py-2.5 text-sm font-light text-slate-100 border focus:border-blue-500/60 outline-none transition-all duration-200 vault-input ${isSaving ? 'opacity-50 cursor-not-allowed border-slate-800/40' : 'border-slate-700/60'}`}
                          placeholder="Website or URL"
                        />
                        <input
                          type="text"
                          value={editValues.username}
                          disabled={isSaving}
                          ref={setRef(1)}
                          onKeyDown={handleKeyDown(1)}
                          onChange={e => { setEditError(''); setEditValues(prev => ({ ...prev, username: e.target.value })) }}
                          className={`rounded-lg px-4 py-2.5 text-sm font-light text-slate-100 border focus:border-blue-500/60 outline-none transition-all duration-200 vault-input ${isSaving ? 'opacity-50 cursor-not-allowed border-slate-800/40' : 'border-slate-700/60'}`}
                          placeholder="Username"
                        />
                        <div className="relative">
                          <input
                            type={showEditPassword ? 'text' : 'password'}
                            value={editValues.password}
                            disabled={isSaving}
                            ref={setRef(2)}
                            onKeyDown={handleKeyDown(2)}
                            onChange={e => { setEditError(''); setEditValues(prev => ({ ...prev, password: e.target.value })) }}
                            className={`w-full rounded-lg px-4 pr-10 py-2.5 text-sm font-light text-slate-100 border focus:border-blue-500/60 outline-none transition-all duration-200 vault-input ${isSaving ? 'opacity-50 cursor-not-allowed border-slate-800/40' : 'border-slate-700/60'}`}
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => setShowEditPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 outline-none z-10 group disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <div className="relative w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors duration-200">
                              <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center ${showEditPassword ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}>
                                <EyeOff size={13} strokeWidth={2} />
                              </span>
                              <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center ${showEditPassword ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100'}`}>
                                <Eye size={13} strokeWidth={2} />
                              </span>
                            </div>
                            <span className="text-slate-600 group-hover:text-slate-400 transition-colors duration-200 leading-none manager-show-hide-text">
                              {showEditPassword ? 'hide' : 'show'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {editError && (
                        <p className="text-red-400/80 text-xs text-center tracking-wide manager-font-mono">
                          {editError}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          ref={setRef(3)}
                          type="submit"
                          disabled={isSaving}
                          className={`py-2 rounded-lg text-xs tracking-widest uppercase border transition-all duration-200 vault-btn-save flex items-center justify-center gap-2 ${isSaving ? 'opacity-60 cursor-not-allowed border-blue-600/20 text-blue-400/50' : 'border-blue-600/30 text-blue-400/80 hover:border-blue-500/50 hover:text-blue-300'}`}
                        >
                          {isSaving ? <><Spinner />Saving...</> : 'Save'}
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleEditCancel}
                          className={`py-2 rounded-lg text-xs tracking-widest uppercase border transition-all duration-200 vault-btn-cancel ${isSaving ? 'opacity-40 cursor-not-allowed' : 'border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-500/50'}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="cred-row flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 transition-colors duration-200">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-slate-300 text-sm truncate vault-font-mono">
                          {cred.url}
                        </span>
                        <span className="text-slate-500 text-sm truncate">{cred.username}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-slate-600 text-sm tracking-widest cursor-pointer hover:text-slate-400 transition-colors duration-200 vault-font-mono"
                            onClick={() => toggleReveal(cred.id)}
                          >
                            {revealedIds.has(cred.id) ? cred.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(cred.password)}
                            className="text-slate-700 hover:text-slate-400 transition-colors duration-200 outline-none flex-shrink-0"
                            title="Copy password"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditStart(cred)}
                          className="text-slate-600 hover:text-blue-400/80 transition-colors duration-200 outline-none p-1.5"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(cred.id)}
                          className="text-slate-600 hover:text-red-400/80 transition-colors duration-200 outline-none p-1.5"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-slate-700 text-xs tracking-widest uppercase vault-font-mono">
            End-to-end encrypted · Local only
          </p>

        </div>
      </div>
    </>
  )
}

export default Vault