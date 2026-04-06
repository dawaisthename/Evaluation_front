import { useEffect, useState } from 'react'

export function useAsync(asyncFn, deps) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null })

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setState({ status: 'loading', data: null, error: null })
        const data = await asyncFn()
        if (!cancelled) setState({ status: 'success', data, error: null })
      } catch (error) {
        if (!cancelled) setState({ status: 'error', data: null, error })
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

