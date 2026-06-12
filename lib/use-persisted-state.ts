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
      if (stored === null) return
      const parsed = JSON.parse(stored)
      // Shallow-merge plain objects with `initial` so newly added fields
      // (e.g. after a schema change) get populated from defaults instead
      // of being undefined for users with cached localStorage.
      const isPlainObject =
        typeof initial === 'object' &&
        initial !== null &&
        !Array.isArray(initial) &&
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      setState((isPlainObject ? { ...initial, ...parsed } : parsed) as T)
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
