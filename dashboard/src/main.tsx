/**
 * React Application Entry Point
 * Renders the main App component into the DOM
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/tailwind.css'

/**
 * Mount the React application to the root DOM element
 * Wrapped in StrictMode for additional development checks
 */
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found in HTML')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
