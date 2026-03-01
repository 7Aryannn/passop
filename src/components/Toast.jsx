import { useEffect, useRef, useState } from 'react'

const VARIANTS = {
  success: {
    border: 'border-green-600/30',
    iconBg: 'rgba(34,197,94,0.12)',
    iconBorder: 'rgba(34,197,94,0.3)',
    iconStroke: 'rgba(34,197,94,0.9)',
    progressColor: 'rgba(34,197,94,0.5)',
    icon: <polyline points="20 6 9 17 4 12" />,
  },
  edit: {
    border: 'border-blue-600/30',
    iconBg: 'rgba(96,165,250,0.12)',
    iconBorder: 'rgba(96,165,250,0.3)',
    iconStroke: 'rgba(96,165,250,0.9)',
    progressColor: 'rgba(96,165,250,0.5)',
    icon: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    ),
  },
  delete: {
    border: 'border-red-600/30',
    iconBg: 'rgba(239,68,68,0.12)',
    iconBorder: 'rgba(239,68,68,0.3)',
    iconStroke: 'rgba(239,68,68,0.9)',
    progressColor: 'rgba(239,68,68,0.5)',
    icon: (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </>
    ),
  },
}

const SWIPE_THRESHOLD = 80
const DELETE_DURATION = 5000
const DEFAULT_DURATION = 2500

const Toast = ({ message, type = 'success', onDismiss, onUndo }) => {
  const v = VARIANTS[type] || VARIANTS.success
  const duration = type === 'delete' ? DELETE_DURATION : DEFAULT_DURATION
  const timerRef = useRef(null)
  const dragStartX = useRef(null)
  const dragStartY = useRef(null)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 250)
  }

  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate(50)
    timerRef.current = setTimeout(dismiss, duration)
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev - (100 / (duration / 100))
        return next <= 0 ? 0 : next
      })
    }, 100)
    return () => {
      clearTimeout(timerRef.current)
      clearInterval(interval)
    }
  }, [])

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX
    dragStartY.current = e.clientY
    setIsDragging(true)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    if (isMobile) {
      const dy = e.clientY - dragStartY.current
      if (dy > 0) setOffsetY(dy)
    } else {
      setOffsetX(e.clientX - dragStartX.current)
    }
  }

  const handlePointerUp = () => {
    const swipedX = Math.abs(offsetX) >= SWIPE_THRESHOLD
    const swipedY = offsetY >= SWIPE_THRESHOLD

    if ((!isMobile && swipedX) || (isMobile && swipedY)) {
      clearTimeout(timerRef.current)
      dismiss()
    } else {
      setOffsetX(0)
      setOffsetY(0)
    }
    setIsDragging(false)
    dragStartX.current = null
    dragStartY.current = null
  }

  const handleUndo = () => {
    clearTimeout(timerRef.current)
    onUndo?.()
    dismiss()
  }

  const opacity = isMobile
    ? Math.max(0, 1 - offsetY / (SWIPE_THRESHOLD * 1.5))
    : Math.max(0, 1 - Math.abs(offsetX) / (SWIPE_THRESHOLD * 1.5))

  const positionClasses = isMobile
    ? 'fixed bottom-6 left-4 right-4 z-50'
    : 'fixed right-6 z-50'

  const enterClass = isMobile
    ? (visible ? 'toast-enter-bottom' : 'toast-exit-bottom')
    : (visible ? 'toast-enter' : 'toast-exit')

  return (
    <div
      className={`${positionClasses} ${enterClass}`}
      style={!isMobile ? { top: '72px' } : {}}
    >
      <div
        className={`relative flex flex-col rounded-xl border ${v.border} shadow-2xl toast-bg overflow-hidden cursor-grab active:cursor-grabbing select-none`}
        style={{
          transform: isMobile
            ? `translateY(${offsetY}px)`
            : `translateX(${offsetX}px)`,
          opacity,
          transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: v.iconBg, border: `1px solid ${v.iconBorder}` }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke={v.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {v.icon}
            </svg>
          </div>

          <span className="text-slate-300 text-xs tracking-wide manager-font-mono">{message}</span>

          {type === 'delete' && onUndo && (
            <button
              type="button"
              onClick={handleUndo}
              className="ml-1 text-xs tracking-widest uppercase manager-font-mono text-blue-400/80 hover:text-blue-300 transition-colors duration-200 flex-shrink-0"
            >
              Undo
            </button>
          )}
        </div>

        <div className="h-[2px] w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: v.progressColor,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Toast