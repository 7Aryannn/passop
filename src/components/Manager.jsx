import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { processWebsite, validateCredentials } from '../utils/credentialUtils'
import Toast from './Toast'
import { useFieldNavigation } from '../hooks/useFieldNavigation'

const CARD_BG = 'rgb(6, 9, 18)'

const FloatingInput = ({ id, label, type = 'text', name, value, onChange, disabled, inputRef, onKeyDown, children }) => {
  const [focused, setFocused] = useState(false)
  const floating = focused || value.length > 0

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        ref={inputRef}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        disabled={disabled}
        className={`peer w-full rounded-lg px-4 pt-5 pb-2.5 text-base font-light text-slate-100 bg-transparent outline-none transition-all duration-200 border floating-input ${
          disabled
            ? 'border-slate-800/40 opacity-50 cursor-not-allowed'
            : focused
            ? 'border-blue-500/60 ring-1 ring-blue-700/20'
            : 'border-slate-700/60 hover:border-slate-500/60'
        }`}
      />
      <label
        htmlFor={id}
        className="absolute pointer-events-none transition-all duration-200 ease-in-out z-10 floating-label"
        style={{
          letterSpacing: floating ? '0.12em' : '0.06em',
          fontSize: floating ? '9px' : '13px',
          top: floating ? '0px' : '50%',
          transform: 'translateY(-50%)',
          color: focused ? 'rgba(96,165,250,0.95)' : floating ? 'rgba(100,116,139,0.9)' : 'rgba(100,116,139,0.8)',
          backgroundColor: floating ? CARD_BG : 'transparent',
          paddingLeft: floating ? '6px' : '0',
          paddingRight: floating ? '6px' : '0',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const Spinner = () => (
  <svg className="animate-spin flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const Manager = ({ credentials, setCredentials }) => {
  const [values, setValues] = useState({ url: '', username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [btnState, setBtnState] = useState('idle')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const { setRef, handleKeyDown } = useFieldNavigation(4)

  const handleChange = (e) => {
    setError('')
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (isSaving) return
    const validationError = validateCredentials(values)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)
    setBtnState('loading')

    const newCredential = {
      id: crypto.randomUUID(),
      url: processWebsite(values.url),
      username: values.username.trim(),
      password: values.password.trim(),
    }

    setTimeout(() => {
      setCredentials(prev => [...prev, newCredential])
      setBtnState('success')
      setToast({ type: 'success', message: 'Credential added to vault' })
      setIsSaving(false)

      setTimeout(() => {
        setBtnState('idle')
        setValues({ url: '', username: '', password: '' })
        setShowPassword(false)
        setError('')
      }, 1800)
    }, 600)
  }

  return (
    <>
      <div className="absolute top-0 z-[-2] h-screen w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      <div className="manager-root min-h-[100dvh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col gap-6">

          <div className="text-center pt-24 sm:pt-28 md:pt-32 lg:pt-0">
            <p className="text-slate-400 text-xs sm:text-sm md:text-base font-light leading-relaxed tracking-wide">
              Store, manage, and access your credentials securely.
            </p>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base font-light leading-relaxed tracking-wide">
              Your vault, your control.
            </p>
          </div>

          <div className="rounded-2xl p-8 manager-card relative">
            <Link
              to="/vault"
              className="absolute top-6 right-6 group flex items-center justify-center overflow-hidden rounded-lg border border-slate-700/50 hover:border-slate-500/60 px-3 py-2 transition-all duration-300 vault-link text-slate-400 hover:text-slate-200"
              title="Vault"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="rgba(96,165,250,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
              <span className="max-w-0 overflow-hidden group-hover:max-w-[48px] group-hover:ml-2 transition-all duration-300 text-slate-400 group-hover:text-slate-200 text-xs tracking-widest uppercase whitespace-nowrap vault-link-text">
                VAULT
              </span>
            </Link>

            <div className="flex items-center justify-center gap-4 mb-7 mt-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 manager-icon-container">
                <svg className="lock-pulse" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(96,165,250,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-slate-200 text-base font-semibold tracking-wide">New Entry</h2>
                <p className="text-slate-600 text-xs mt-0.5">Store a new credential securely</p>
              </div>
            </div>

            <div className="divider-line mb-7" />

            <form onSubmit={handleAdd} className="flex flex-col gap-5">
              <FloatingInput
                id="url" name="url" label="Website" type="text"
                value={values.url} onChange={handleChange} disabled={isSaving}
                inputRef={setRef(0)} onKeyDown={handleKeyDown(0)}
              />
              <div className="flex flex-col md:flex-row gap-5">
                <FloatingInput
                  id="username" name="username" label="Username" type="text"
                  value={values.username} onChange={handleChange} disabled={isSaving}
                  inputRef={setRef(1)} onKeyDown={handleKeyDown(1)}
                />
                <div className="w-full">
                  <FloatingInput
                    id="password" name="password" label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password} onChange={handleChange} disabled={isSaving}
                    inputRef={setRef(2)} onKeyDown={handleKeyDown(2)}
                  >
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      disabled={isSaving}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 outline-none z-10 group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="relative w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors duration-200">
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center ${showPassword ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}>
                          <EyeOff size={15} strokeWidth={2} />
                        </span>
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 origin-center ${showPassword ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100'}`}>
                          <Eye size={15} strokeWidth={2} />
                        </span>
                      </div>
                      <span className="text-slate-600 group-hover:text-slate-400 transition-colors duration-200 leading-none manager-show-hide-text">
                        {showPassword ? 'hide' : 'show'}
                      </span>
                    </button>
                  </FloatingInput>
                </div>
              </div>

              {error && (
                <p className="text-red-400/80 text-xs text-center tracking-wide manager-font-mono">
                  {error}
                </p>
              )}

              <div className="divider-line" />

              <button
                ref={setRef(3)}
                type="submit"
                disabled={btnState !== 'idle'}
                className={`btn-credential w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg border text-xs tracking-[0.18em] uppercase manager-add-btn transition-all duration-300 ${
                  btnState === 'success'
                    ? 'border-green-600/40 text-green-400/90 btn-success'
                    : 'border-slate-700/50 text-slate-300'
                } ${btnState !== 'idle' ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                {btnState === 'loading' && (
                  <>
                    <Spinner />
                    Saving...
                  </>
                )}
                {btnState === 'success' && (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added
                  </>
                )}
                {btnState === 'idle' && (
                  <>
                    <span className="flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(96,165,250,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </span>
                    Save Credential
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-700 text-xs tracking-widest uppercase manager-font-mono">
            End-to-end encrypted · Local only
          </p>

        </div>
      </div>
    </>
  )
}

export default Manager