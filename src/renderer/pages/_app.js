import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Set up Electron API menu listeners
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onMenuAction(() => {
        // Handle menu actions from main process
        console.log('Menu action received')
      })
    }
  }, [])

  return <Component {...pageProps} />
}