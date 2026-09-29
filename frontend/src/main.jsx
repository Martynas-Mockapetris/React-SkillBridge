import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext'
import './locales/i18n'  // ← ADD THIS LINE - initializes i18n
import { LanguageProvider } from './context/LanguageContext'  // ← ADD THIS LINE
import App from './App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
