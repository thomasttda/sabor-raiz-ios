'use client'

import { useEffect } from 'react'

export function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only apply in production
    if (process.env.NODE_ENV !== 'production') return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault()
      }
      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault()
      }
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
      }
    }

    // Attempt to detect DevTools opening
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        // You could redirect or clear console here
        console.clear()
      }
    }

    // Disable Console Logs in production
    const disableConsole = () => {
      if (typeof window !== 'undefined') {
        const noop = () => {}
        // @ts-ignore
        window.console.log = noop
        // @ts-ignore
        window.console.info = noop
        // @ts-ignore
        window.console.warn = noop
        // @ts-ignore
        window.console.debug = noop
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', detectDevTools)
    disableConsole()

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', detectDevTools)
    }
  }, [])

  return <>{children}</>
}
