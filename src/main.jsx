import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AppRoutes from './AppRoutes.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <HelmetProvider>
          <AppRoutes />
        </HelmetProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
