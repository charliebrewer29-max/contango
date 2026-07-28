import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import App from '@/App.jsx'
import '@/index.css'

// Theme provider drives the `.dark`/`.light` class on <html>, which the
// CSS variables in index.css resolve against. Defaults to the dark
// trading-terminal feel, adapts to the system preference when set.
ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem>
    <App />
  </ThemeProvider>
)