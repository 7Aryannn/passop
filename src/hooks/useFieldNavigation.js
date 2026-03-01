import { useRef, useCallback } from 'react'

export const useFieldNavigation = (fieldCount) => {
  const refs = useRef(Array.from({ length: fieldCount }, () => null))

  const setRef = (index) => (el) => {
    refs.current[index] = el
  }

  const handleKeyDown = useCallback((index) => (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      refs.current[index + 1]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      refs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      const next = refs.current[index + 1]
      if (next) {
        e.preventDefault()
        next.focus()
      }
    }
  }, [])

  return { setRef, handleKeyDown }
}