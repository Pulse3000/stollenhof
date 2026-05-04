'use client'

import { useState, useEffect, useRef } from 'react'

export function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) setState(JSON.parse(stored) as T)
    } catch {}
  }, [key])

  useEffect(() => {
    if (!loaded.current) return
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])

  return [state, setState] as const
}
