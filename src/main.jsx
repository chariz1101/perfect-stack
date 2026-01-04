import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css' // Note: your image shows style.css, so we use that name!

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)